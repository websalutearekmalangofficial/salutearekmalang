import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { AdminCard, inputClass } from "@/components/admin/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { fetchRegistrations, type RegistrationRow } from "@/lib/admin-cms";
import { registrationStatuses } from "@/lib/cms";

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


export const Route = createFileRoute("/_authenticated/admin/pendaftar")({
  component: RegistrationsAdmin,
});

function normalizePhone(value: string | null) {
  const raw = String(value ?? "").trim().replace(/[\s().-]/g, "");
  if (!raw) return null;
  if (raw.startsWith("+")) return raw.slice(1);
  if (raw.startsWith("62")) return raw;
  if (raw.startsWith("0")) return "62" + raw.slice(1);
  return raw;
}

function renderTemplate(body: string, row: RegistrationRow) {
  return body
    .replaceAll("{{nama}}", row.nama)
    .replaceAll("{{jalur}}", row.jalur ?? "")
    .replaceAll("{{status}}", row.status ?? "");
}


function RegistrationsAdmin() {
  const queryClient = useQueryClient();
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationRow | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const query = useQuery({
    queryKey: ["registrations"],
    queryFn: fetchRegistrations,
  });

  const templatesQuery = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: async (): Promise<WhatsAppTemplate[]> => {
      const { data, error } = await (supabase as any)
        .from("whatsapp_templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as WhatsAppTemplate[];
    },
  });



  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["registrations"] });
    queryClient.invalidateQueries({ queryKey: ["whatsapp-messages"] });
  };



  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status diperbarui.");
      refresh();
    },
    onError: () => toast.error("Gagal memperbarui status."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Data pendaftar dihapus.");
      refresh();
    },
    onError: () => toast.error("Gagal menghapus data."),
  });



  const openComposer = (row: RegistrationRow) => {
    setSelectedRegistration(row);
    const autoTemplate = templatesQuery.data?.find((template) => template.is_auto_reply);
    setSelectedTemplateId(autoTemplate?.id ?? templatesQuery.data?.[0]?.id ?? "");
  };

  const openManualWhatsApp = (row: RegistrationRow, template?: WhatsAppTemplate) => {
    const phone = normalizePhone(row.nomor_hp);
    if (!phone) {
      toast.error("Nomor WhatsApp pendaftar tidak valid.");
      return;
    }

    const body = template
      ? renderTemplate(template.body, row)
      : `Halo ${row.nama}, kami dari Sentra Layanan UT Salut Malang.`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(body)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const rows: RegistrationRow[] = query.data ?? [];
  const selectedTemplate = templatesQuery.data?.find((template) => template.id === selectedTemplateId);
  const selectedPhone = normalizePhone(selectedRegistration?.nomor_hp ?? null);

  return (
    <>
      <AdminCard
        title="Data Pendaftar"
        description="Kelola pendaftar, status, dan komunikasi WhatsApp langsung dari dashboard admin."
      >
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Pendaftar</p>
            <p className="mt-1 text-2xl font-black text-ut-navy">{rows.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Template Aktif</p>
            <p className="mt-1 text-2xl font-black text-ut-navy">
              {templatesQuery.data?.length ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Cara Kirim</p>
            <p className="mt-1 text-sm font-black text-ut-navy">Buka WhatsApp</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[78rem] border-collapse text-left text-sm">
            <thead>
              <tr className="text-xs font-black uppercase tracking-wide text-ut-navy">
                <th className="border-b border-border p-2">Nama</th>
                <th className="border-b border-border p-2">Sekolah / Kota</th>
                <th className="border-b border-border p-2">Kontak</th>
                <th className="border-b border-border p-2">Jalur</th>
                <th className="border-b border-border p-2">Status</th>
                <th className="border-b border-border p-2">WhatsApp</th>
                <th className="border-b border-border p-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const hasPhone = Boolean(normalizePhone(row.nomor_hp));

                return (
                  <tr key={row.id} className="align-top">
                    <td className="border-b border-border p-2 font-bold text-ut-navy">
                      {row.nama}
                      <span className="block text-xs font-medium text-muted-foreground">
                        {new Date(row.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </td>
                    <td className="border-b border-border p-2 font-medium text-muted-foreground">
                      {row.sekolah ?? "-"}
                      <span className="block text-xs">{row.kota ?? ""}</span>
                    </td>
                    <td className="border-b border-border p-2 font-medium text-muted-foreground">
                      {row.email ?? "-"}
                      <span className="block text-xs">{row.nomor_hp ?? "Nomor belum diisi"}</span>
                    </td>
                    <td className="border-b border-border p-2 font-medium text-muted-foreground">
                      {row.jalur ?? "-"}
                    </td>
                    <td className="border-b border-border p-2">
                      <select
                        className={inputClass + " h-10"}
                        value={row.status}
                        onChange={(e) => updateStatus.mutate({ id: row.id, status: e.target.value })}
                      >
                        {registrationStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border-b border-border p-2">
                      <Button
                        type="button"
                        className="h-9 gap-1.5 rounded-lg"
                        disabled={!hasPhone || templatesQuery.isLoading || templatesQuery.isError}
                        onClick={() => openComposer(row)}
                      >
                        <MessageCircle className="size-4" />
                        Chat
                      </Button>
                    </td>
                    <td className="border-b border-border p-2">
                      <Button
                        type="button"
                        variant="formOutline"
                        className="h-10 w-10 rounded-full p-0"
                        aria-label={`Hapus data ${row.nama}`}
                        onClick={() => remove.mutate(row.id)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && !query.isLoading ? (
            <p className="p-2 text-sm font-medium text-muted-foreground">Belum ada pendaftar.</p>
          ) : null}
        </div>
      </AdminCard>

      <Dialog
        open={Boolean(selectedRegistration)}
        onOpenChange={(open) => {
          if (!open) setSelectedRegistration(null);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-ut-navy">
              <MessageCircle className="size-5" />
              Chat WhatsApp Pendaftar
            </DialogTitle>
            <DialogDescription>
              Nomor WhatsApp diambil langsung dari kontak yang diinput pendaftar.
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="font-black text-ut-navy">{selectedRegistration.nama}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedPhone ? `+${selectedPhone}` : "Nomor tidak valid"}
                </p>
              </div>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-wide text-ut-navy">
                  Pilih Template
                </span>
                <select
                  className={inputClass}
                  value={selectedTemplateId}
                  onChange={(event) => setSelectedTemplateId(event.target.value)}
                  disabled={templatesQuery.isLoading}
                >
                  {(templatesQuery.data ?? []).map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}{template.is_auto_reply ? " — Default" : ""}
                    </option>
                  ))}
                </select>
              </label>

              {selectedTemplate ? (
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                      Preview Pesan
                    </span>
                    {selectedTemplate.is_auto_reply ? (
                      <Badge variant="secondary">Default</Badge>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-foreground">
                    {renderTemplate(selectedTemplate.body, selectedRegistration)}
                  </p>
                </div>
              ) : templatesQuery.isError ? (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <p className="font-bold">Template WhatsApp gagal dimuat.</p>
                    <p className="mt-1">
                      {(templatesQuery.error as Error)?.message || "Periksa akses admin dan koneksi database."}
                    </p>
                    <Button
                      type="button"
                      variant="formOutline"
                      className="mt-2 h-8"
                      onClick={() => templatesQuery.refetch()}
                    >
                      Muat ulang template
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertCircle className="size-4 shrink-0" />
                  Template WhatsApp belum tersedia.
                </div>
              )}

           </div>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="formOutline"
              className="gap-2"
              disabled={!selectedRegistration || !selectedPhone || !selectedTemplate}
              onClick={() => {
                if (selectedRegistration) openManualWhatsApp(selectedRegistration, selectedTemplate);
              }}
            >
              <ExternalLink className="size-4" />
              Buka WhatsApp
            </Button>
            <Button
              type="button"
              variant="formOutline"
              onClick={() => setSelectedRegistration(null)}
            >
              Tutup
            </Button>
          </DialogFooter>    </DialogContent>
      </Dialog>
    </>
  );
}
