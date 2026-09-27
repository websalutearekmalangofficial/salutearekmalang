import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  MessageCircle,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AdminCard, Field, inputClass, textareaClass } from "@/components/admin/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type AdminSetting = {
  key: string;
  value: string;
  description: string | null;
};

type WhatsAppTemplate = {
  id: string;
  name: string;
  description: string | null;
  body: string;
  meta_template_name: string | null;
  meta_language_code: string;
  is_active: boolean;
  is_auto_reply: boolean;
};

export const Route = createFileRoute("/_authenticated/admin/pengaturan")({
  component: SettingsAdmin,
});

const defaultTemplate: WhatsAppTemplate = {
  id: "",
  name: "",
  description: "",
  body: "Halo {{nama}}, kami dari Sentra Layanan UT Salut Malang.",
  meta_template_name: null,
  meta_language_code: "id",
  is_active: true,
  is_auto_reply: false,
};

function SettingsAdmin() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<WhatsAppTemplate | null>(null);

  const settingsQuery = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async (): Promise<AdminSetting[]> => {
      const { data, error } = await (supabase as any)
        .from("admin_settings")
        .select("key,value,description")
        .order("key");
      if (error) throw error;
      return (data ?? []) as AdminSetting[];
    },
  });

  const templatesQuery = useQuery({
    queryKey: ["whatsapp-templates"],
    retry: false,
    queryFn: async (): Promise<WhatsAppTemplate[]> => {
      const { data, error } = await (supabase as any)
        .from("whatsapp_templates")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error) return (data ?? []) as WhatsAppTemplate[];

      // Some Supabase projects can temporarily serve a stale PostgREST
      // schema cache after a table is created/exposed. Fall back to the
      // existing admin RPC so the settings page can still read the same
      // database table without showing a false "table not found" state.
      const message = String(error.message ?? "");
      const isSchemaCacheError =
        message.includes("schema cache") ||
        message.includes("Could not find the table");

      if (!isSchemaCacheError) throw error;

      const { data: rpcData, error: rpcError } = await (supabase as any)
        .rpc("get_admin_whatsapp_templates");

      if (rpcError) throw error;
      return (rpcData ?? []) as WhatsAppTemplate[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-settings-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_settings" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_templates" }, () => {
        queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const settingMap = useMemo(
    () => Object.fromEntries((settingsQuery.data ?? []).map((item) => [item.key, item.value])),
    [settingsQuery.data],
  );

  const saveSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const user = await supabase.auth.getUser();
      const { error } = await (supabase as any).from("admin_settings").upsert({
        key,
        value,
        updated_by: user.data.user?.id ?? null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Pengaturan disimpan.");
    },
    onError: (error) => toast.error(error.message || "Gagal menyimpan pengaturan."),
  });

  const saveTemplate = useMutation({
    mutationFn: async (template: WhatsAppTemplate) => {
      const name = template.name.trim();
      const body = template.body.trim();

      if (!name || !body) {
        throw new Error("Nama template dan isi pesan wajib diisi.");
      }

      let templateId = template.id;

      // Clear the previous default only when this template is explicitly made default.
      if (template.is_auto_reply) {
        const { error: clearDefaultsError } = await (supabase as any)
          .from("whatsapp_templates")
          .update({ is_auto_reply: false })
          .neq("id", template.id || "00000000-0000-0000-0000-000000000000");
        if (clearDefaultsError) throw clearDefaultsError;
      }

      const payload = {
        name,
        description: template.description?.trim() || null,
        body,
        meta_template_name: template.meta_template_name?.trim() || null,
        meta_language_code: template.meta_language_code.trim() || "id",
        is_active: template.is_active,
        is_auto_reply: template.is_auto_reply,
        updated_at: new Date().toISOString(),
      };

      if (templateId) {
        const { data, error } = await (supabase as any)
          .from("whatsapp_templates")
          .update(payload)
          .eq("id", templateId)
          .select("*")
          .single();
        if (error) throw error;
        if (!data) throw new Error("Template tidak ditemukan saat menyimpan.");
      } else {
        const { data, error } = await (supabase as any)
          .from("whatsapp_templates")
          .insert(payload)
          .select("*")
          .single();
        if (error) throw error;
        templateId = data?.id;
        if (!templateId) throw new Error("Template tersimpan tetapi ID tidak dikembalikan.");
      }

      // Keep the configured default in admin_settings synchronized with the template.
      if (template.is_auto_reply && templateId) {
        const user = await supabase.auth.getUser();
        const { error: settingError } = await (supabase as any)
          .from("admin_settings")
          .upsert({
            key: "whatsapp_default_template_id",
            value: templateId,
            updated_by: user.data.user?.id ?? null,
            updated_at: new Date().toISOString(),
          });
        if (settingError) throw settingError;
      } else if (defaultTemplateId === template.id && !template.is_active) {
        const { error: settingError } = await (supabase as any)
          .from("admin_settings")
          .upsert({
            key: "whatsapp_default_template_id",
            value: "",
            updated_at: new Date().toISOString(),
          });
        if (settingError) throw settingError;
      }

      return templateId;
    },
    onSuccess: async () => {
      setDraft(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-settings"] }),
      ]);
      toast.success("Template WhatsApp berhasil disimpan dan disinkronkan.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan template.");
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("whatsapp_templates").delete().eq("id", id);
      if (error) throw error;

      if (defaultTemplateId === id) {
        const { error: settingError } = await (supabase as any)
          .from("admin_settings")
          .upsert({ key: "whatsapp_default_template_id", value: "", updated_at: new Date().toISOString() });
        if (settingError) throw settingError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast.success("Template dihapus.");
    },
    onError: (error) => toast.error(error.message || "Gagal menghapus template."),
  });

  const activeTemplates = (templatesQuery.data ?? []).filter((template) => template.is_active);
  const defaultTemplateId = settingMap.whatsapp_default_template_id ?? "";
  const whatsappEnabled = settingMap.whatsapp_enabled !== "false";

  return (
    <>
      <AdminCard
        title="Pengaturan Sistem"
        description="Satu tempat untuk mengatur konfigurasi yang digunakan panel admin dan fitur website."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-ut-yellow text-ut-navy">
                <MessageCircle className="size-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">WhatsApp</p>
                <p className="font-black text-ut-navy">{whatsappEnabled ? "Aktif" : "Nonaktif"}</p>
              </div>
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Mode saat ini: <strong className="text-ut-navy">Manual</strong>. Pesan dibuka di WhatsApp dengan teks terisi.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-section-blue text-ut-blue">
                <Settings2 className="size-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Template aktif</p>
                <p className="font-black text-ut-navy">{activeTemplates.length}</p>
              </div>
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Template tersedia realtime untuk fitur Chat di Data Pendaftar.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-section-blue text-ut-blue">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Akses</p>
                <p className="font-black text-ut-navy">Admin only</p>
              </div>
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Pengaturan disimpan di Supabase dan dilindungi RLS berbasis role admin.
            </p>
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="WhatsApp"
        description="Konfigurasi sesuai kemampuan sistem saat ini. Tidak menggunakan WAHA atau provider pengiriman otomatis."
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-ut-navy">Fitur WhatsApp di Data Pendaftar</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Jika aktif, admin dapat membuka WhatsApp dengan nomor dan template pesan yang sudah terisi.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={whatsappEnabled}
                onClick={() => saveSetting.mutate({ key: "whatsapp_enabled", value: whatsappEnabled ? "false" : "true" })}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${whatsappEnabled ? "bg-ut-blue" : "bg-muted"}`}
              >
                <span
                  className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${whatsappEnabled ? "left-6" : "left-1"}`}
                />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <Field label="Template default untuk tombol Chat">
              <select
                className={inputClass}
                value={defaultTemplateId}
                onChange={(event) =>
                  saveSetting.mutate({
                    key: "whatsapp_default_template_id",
                    value: event.target.value,
                  })
                }
                disabled={!whatsappEnabled || settingsQuery.isLoading}
              >
                <option value="">Pilih otomatis dari template Default</option>
                {activeTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}{template.is_auto_reply ? " — Default" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              Perubahan ini langsung dipakai saat admin membuka Chat dari Data Pendaftar.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-black">Mode pengiriman: Manual</p>
            <p className="mt-1">
              Sistem tidak mengirim pesan otomatis. Tombol <strong>Buka WhatsApp</strong> membuka WhatsApp
              dengan pesan yang sudah dipersonalisasi, lalu admin menekan Kirim.
            </p>
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Template Pesan WhatsApp"
        description="Template disimpan di database dan perubahan tampil realtime di Data Pendaftar."
      >
        <div className="space-y-3">
          {(templatesQuery.data ?? []).map((template) => (
            <div key={template.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-ut-navy">{template.name}</h3>
                    {template.is_active ? <Badge variant="secondary">Aktif</Badge> : <Badge variant="outline">Nonaktif</Badge>}
                    {template.is_auto_reply ? <Badge>Default</Badge> : null}
                    {defaultTemplateId === template.id ? <Badge variant="secondary">Dipilih</Badge> : null}
                  </div>
                  {template.description ? (
                    <p className="mt-1 text-xs font-medium text-muted-foreground">{template.description}</p>
                  ) : null}
                  <p className="mt-3 whitespace-pre-wrap rounded-xl bg-muted/30 p-3 text-sm leading-6 text-foreground">
                    {template.body}
                  </p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Variabel: <code>{"{{nama}}"}</code>, <code>{"{{jalur}}"}</code>, <code>{"{{status}}"}</code>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="formOutline" onClick={() => setDraft(template)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="formOutline"
                    aria-label={`Hapus template ${template.name}`}
                    onClick={() => {
                      if (confirm(`Hapus template "${template.name}"?`)) deleteTemplate.mutate(template.id);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {templatesQuery.isLoading ? (
            <p className="text-sm font-medium text-muted-foreground">Memuat template…</p>
          ) : null}

          {templatesQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <p className="font-bold">Template WhatsApp belum dapat dimuat.</p>
              <p className="mt-1">{(templatesQuery.error as { message?: string } | null)?.message ?? "Terjadi kesalahan saat membaca template."}</p>
              <Button
                type="button"
                variant="formOutline"
                size="sm"
                className="mt-3"
                onClick={() => void templatesQuery.refetch()}
              >
                <RefreshCw className="size-4" />
                Coba lagi
              </Button>
            </div>
          ) : null}

          {!templatesQuery.isLoading && !templatesQuery.isError && templatesQuery.data?.length === 0 ? (
            <p className="text-sm font-medium text-muted-foreground">Belum ada template WhatsApp.</p>
          ) : null}

          <Button type="button" variant="utYellow" size="form" onClick={() => setDraft({ ...defaultTemplate })}>
            <Plus className="size-4" />
            Tambah template
          </Button>
        </div>
      </AdminCard>

      {draft ? (
        <AdminCard
          title={draft.id ? "Edit Template WhatsApp" : "Template WhatsApp Baru"}
          description="Gunakan variabel {{nama}}, {{jalur}}, dan {{status}} agar pesan otomatis menyesuaikan data pendaftar."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama template">
              <input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Kode bahasa">
              <input className={inputClass} value={draft.meta_language_code} onChange={(e) => setDraft({ ...draft, meta_language_code: e.target.value })} />
            </Field>
            <Field label="Nama template provider (opsional)">
              <input
                className={inputClass}
                value={draft.meta_template_name ?? ""}
                onChange={(e) => setDraft({ ...draft, meta_template_name: e.target.value || null })}
                placeholder="Digunakan jika nanti terhubung provider resmi"
              />
            </Field>
            <Field label="Deskripsi">
              <input className={inputClass} value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Isi pesan">
                <textarea className={textareaClass} rows={7} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
              </Field>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-5">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-ut-navy">
              <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} className="size-4 accent-ut-blue" />
              Aktif
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-ut-navy">
              <input type="checkbox" checked={draft.is_auto_reply} onChange={(e) => setDraft({ ...draft, is_auto_reply: e.target.checked })} className="size-4 accent-ut-blue" />
              Jadikan Default
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="utYellow"
              size="form"
              onClick={() => saveTemplate.mutate(draft)}
              disabled={!draft.name.trim() || !draft.body.trim() || saveTemplate.isPending}
            >
              <Save className="size-4" />
              Simpan template
            </Button>
            <Button type="button" variant="formOutline" size="form" onClick={() => setDraft(null)}>
              Batal
            </Button>
          </div>
        </AdminCard>
      ) : null}

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <Check className="size-4 text-ut-blue" />
          Data tersinkron dengan Supabase Realtime
        </div>
        <Button
          type="button"
          variant="formOutline"
          size="sm"
          onClick={() => {
            void settingsQuery.refetch();
            void templatesQuery.refetch();
          }}
        >
          <RefreshCw className="size-4" />
          Muat ulang
        </Button>
      </div>
    </>
  );
}
