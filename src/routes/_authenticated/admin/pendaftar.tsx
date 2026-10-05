import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Copy,
  ExternalLink,
  Eye,
  KeyRound,
  MessageCircle,
  Trash2,
  UserPlus,
  X,
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
import {
  createRegistrantAccount,
  fetchRegistrations,
  type RegistrationRow,
} from "@/lib/admin-cms";
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

type AccountCredentials = {
  ok: boolean;
  user_id: string;
  username: string;
  password: string;
  registration_reference: string | null;
  message: string;
};

export const Route = createFileRoute("/_authenticated/admin/pendaftar")({
  component: RegistrationsAdmin,
});

function normalizePhone(value: string | null) {
  const raw = String(value ?? "")
    .trim()
    .replace(/[\s().-]/g, "");

  if (!raw) return null;

  if (raw.startsWith("+")) {
    return raw.slice(1);
  }

  if (raw.startsWith("62")) {
    return raw;
  }

  if (raw.startsWith("0")) {
    return "62" + raw.slice(1);
  }

  return raw;
}

function renderTemplate(body: string, row: RegistrationRow) {
  return body
    .replaceAll("{{nama}}", row.nama ?? "")
    .replaceAll("{{jalur}}", row.jalur ?? "")
    .replaceAll("{{status}}", row.status ?? "");
}

function copyToClipboard(value: string, label: string) {
  void navigator.clipboard
    .writeText(value)
    .then(() => {
      toast.success(`${label} berhasil disalin.`);
    })
    .catch(() => {
      toast.error(`Gagal menyalin ${label.toLowerCase()}.`);
    });
}

function RegistrationsAdmin() {
  const queryClient = useQueryClient();

  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationRow | null>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const [accountCredentials, setAccountCredentials] =
    useState<AccountCredentials | null>(null);

  const query = useQuery({
    queryKey: ["registrations"],
    queryFn: fetchRegistrations,
  });

  const settingsQuery = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await (supabase as any)
        .from("admin_settings")
        .select("key,value");

      if (error) throw error;

      return Object.fromEntries(
        (data ?? []).map(
          (item: { key: string; value: string }) => [item.key, item.value],
        ),
      );
    },
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

      return (data ?? []) as WhatsAppTemplate[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-whatsapp-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_settings",
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ["admin-settings"],
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "whatsapp_templates",
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ["whatsapp-templates"],
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: ["registrations"],
    });

    void queryClient.invalidateQueries({
      queryKey: ["whatsapp-messages"],
    });
  };

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: string;
    }) => {
      const { error } = await supabase
        .from("registrations")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },

    onSuccess: () => {
      toast.success("Status pendaftar berhasil diperbarui.");
      refresh();
    },

    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui status.",
      );
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },

    onSuccess: () => {
      toast.success("Data pendaftar dihapus.");
      setSelectedRegistration(null);
      setAccountCredentials(null);
      refresh();
    },

    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menghapus data.",
      );
    },
  });

  const createAccount = useMutation({
    mutationFn: async (registrationId: string) => {
      return createRegistrantAccount(registrationId);
    },

    onSuccess: (result) => {
      setAccountCredentials(result);

      toast.success(
        "Akses Dashboard User berhasil dibuat.",
      );

      refresh();
    },

    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal membuat akses user.",
      );
    },
  });

  const settings = settingsQuery.data ?? {};

  const whatsappEnabled =
    settings["whatsapp_enabled"] !== "false";

  const defaultTemplateId =
    settings["whatsapp_default_template_id"] ?? "";

  const openDetail = (row: RegistrationRow) => {
    setSelectedRegistration(row);

    /*
     * Sangat penting:
     * Credential akun sebelumnya tidak boleh terbawa
     * ketika admin membuka pendaftar lain.
     */
    setAccountCredentials(null);

    const configuredTemplate = templatesQuery.data?.find(
      (template) => template.id === defaultTemplateId,
    );

    const autoTemplate = templatesQuery.data?.find(
      (template) => template.is_auto_reply,
    );

    setSelectedTemplateId(
      configuredTemplate?.id ??
        autoTemplate?.id ??
        templatesQuery.data?.[0]?.id ??
        "",
    );
  };

  const openManualWhatsApp = (
    row: RegistrationRow,
    template?: WhatsAppTemplate,
  ) => {
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

  const selectedTemplate =
    templatesQuery.data?.find(
      (template) => template.id === selectedTemplateId,
    );

  const selectedPhone = normalizePhone(
    selectedRegistration?.nomor_hp ?? null,
  );

  const selectedStatus =
    selectedRegistration?.status?.toLowerCase() ?? "";

  const canCreateAccount =
    selectedRegistration &&
    selectedStatus === "terverifikasi" &&
    !selectedRegistration.user_id;

  return (
    <>
      <AdminCard
        title="Data Pendaftar"
        description="Kelola pendaftar, status, akses Dashboard User, dan komunikasi WhatsApp langsung dari dashboard admin."
      >
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
              Pendaftar
            </p>

            <p className="mt-1 text-2xl font-black text-ut-navy">
              {rows.length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
              Template Aktif
            </p>

            <p className="mt-1 text-2xl font-black text-ut-navy">
              {templatesQuery.data?.length ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
              Cara Kirim
            </p>

            <p className="mt-1 text-sm font-black text-ut-navy">
              Buka WhatsApp
            </p>
          </div>
        </div>

        {templatesQuery.isError ? (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />

            <div className="min-w-0">
              <p className="font-black">
                Template WhatsApp belum dapat dimuat.
              </p>

              <p className="mt-1 break-words">
                {(templatesQuery.error as Error)?.message ??
                  "Periksa struktur tabel whatsapp_templates dan akses Supabase."}
              </p>

              <Button
                type="button"
                variant="formOutline"
                className="mt-3 h-8"
                onClick={() => void templatesQuery.refetch()}
              >
                Muat ulang template
              </Button>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[82rem] border-collapse text-left text-sm">
            <thead>
              <tr className="text-xs font-black uppercase tracking-wide text-ut-navy">
                <th className="border-b border-border p-2">
                  Nomor Referensi
                </th>

                <th className="border-b border-border p-2">
                  Nama
                </th>

                <th className="border-b border-border p-2">
                  Sekolah / Kota
                </th>

                <th className="border-b border-border p-2">
                  Kontak
                </th>

                <th className="border-b border-border p-2">
                  Jalur
                </th>

                <th className="border-b border-border p-2">
                  Status
                </th>

                <th className="border-b border-border p-2">
                  WhatsApp
                </th>

                <th className="border-b border-border p-2">
                  Detail
                </th>

                <th className="border-b border-border p-2" />
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => {
                const hasPhone = Boolean(
                  normalizePhone(row.nomor_hp),
                );

                return (
                  <tr
                    key={row.id}
                    className="align-top"
                  >
                    <td className="border-b border-border p-2">
                      <button
                        type="button"
                        className="text-left font-black text-ut-navy hover:underline"
                        onClick={() => openDetail(row)}
                      >
                        {row.registration_reference || "-"}
                      </button>

                      <span className="mt-1 block text-xs font-medium text-muted-foreground">
                        {new Date(
                          row.created_at,
                        ).toLocaleDateString("id-ID")}
                      </span>
                    </td>

                    <td className="border-b border-border p-2 font-bold text-ut-navy">
                      {row.nama}
                    </td>

                    <td className="border-b border-border p-2 font-medium text-muted-foreground">
                      {row.sekolah ?? "-"}

                      <span className="block text-xs">
                        {row.kota ?? ""}
                      </span>
                    </td>

                    <td className="border-b border-border p-2 font-medium text-muted-foreground">
                      {row.email ?? "-"}

                      <span className="block text-xs">
                        {row.nomor_hp ??
                          "Nomor belum diisi"}
                      </span>
                    </td>

                    <td className="border-b border-border p-2 font-medium text-muted-foreground">
                      {row.jalur ?? "-"}
                    </td>

                    <td className="border-b border-border p-2">
                      <select
                        className={inputClass + " h-10"}
                        value={row.status}
                        onChange={(event) =>
                          updateStatus.mutate({
                            id: row.id,
                            status: event.target.value,
                          })
                        }
                        disabled={updateStatus.isPending}
                      >
                        {registrationStatuses.map(
                          (status) => (
                            <option
                              key={status.value}
                              value={status.value}
                            >
                              {status.label}
                            </option>
                          ),
                        )}
                      </select>
                    </td>

                    <td className="border-b border-border p-2">
                      <Button
                        type="button"
                        className="h-9 gap-1.5 rounded-lg"
                        disabled={
                          !whatsappEnabled ||
                          !hasPhone ||
                          templatesQuery.isLoading ||
                          templatesQuery.isError
                        }
                        onClick={() =>
                          openDetail(row)
                        }
                      >
                        <MessageCircle className="size-4" />
                        Chat
                      </Button>
                    </td>

                    <td className="border-b border-border p-2">
                      <Button
                        type="button"
                        variant="formOutline"
                        className="h-9 gap-1.5"
                        onClick={() =>
                          openDetail(row)
                        }
                      >
                        <Eye className="size-4" />
                        Detail
                      </Button>
                    </td>

                    <td className="border-b border-border p-2">
                      <Button
                        type="button"
                        variant="formOutline"
                        className="h-10 w-10 rounded-full p-0"
                        aria-label={`Hapus data ${row.nama}`}
                        onClick={() =>
                          remove.mutate(row.id)
                        }
                        disabled={remove.isPending}
                      >
                        <Trash2
                          className="size-4"
                          aria-hidden="true"
                        />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {rows.length === 0 &&
          !query.isLoading ? (
            <p className="p-2 text-sm font-medium text-muted-foreground">
              Belum ada pendaftar.
            </p>
          ) : null}

          {query.isLoading ? (
            <p className="p-4 text-sm font-medium text-muted-foreground">
              Memuat data pendaftar...
            </p>
          ) : null}

          {query.isError ? (
            <div className="m-3 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />

              <div>
                <p className="font-black">
                  Data pendaftar gagal dimuat.
                </p>

                <p className="mt-1">
                  {(query.error as Error)?.message ??
                    "Terjadi kesalahan saat mengambil data."}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </AdminCard>

      <Dialog
        open={Boolean(selectedRegistration)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRegistration(null);
            setAccountCredentials(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-ut-navy">
              <Eye className="size-5" />
              Detail Pendaftar
            </DialogTitle>

            <DialogDescription>
              Detail data pendaftar, status verifikasi,
              akses Dashboard User, dan komunikasi WhatsApp.
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Nomor Referensi
                  </p>

                  <p className="mt-1 font-black text-ut-navy">
                    {selectedRegistration.registration_reference ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Status
                  </p>

                  <div className="mt-1">
                    <Badge>
                      {selectedRegistration.status ||
                        "-"}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Nama Lengkap
                  </p>

                  <p className="mt-1 font-bold text-ut-navy">
                    {selectedRegistration.nama ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>

                  <p className="mt-1 break-all font-medium text-muted-foreground">
                    {selectedRegistration.email ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Kontak / WhatsApp
                  </p>

                  <p className="mt-1 font-medium text-muted-foreground">
                    {selectedRegistration.nomor_hp ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Jalur
                  </p>

                  <p className="mt-1 font-medium text-muted-foreground">
                    {selectedRegistration.jalur ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Sekolah
                  </p>

                  <p className="mt-1 font-medium text-muted-foreground">
                    {selectedRegistration.sekolah ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Kota
                  </p>

                  <p className="mt-1 font-medium text-muted-foreground">
                    {selectedRegistration.kota ||
                      "-"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-ut-navy">
                      Akses Dashboard User
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Buat akun setelah pendaftar
                      berstatus Terverifikasi.
                    </p>
                  </div>

                  <KeyRound className="size-5 text-ut-navy" />
                </div>

                {accountCredentials ? (
                  <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                        Akun Berhasil Dibuat
                      </p>

                      <p className="mt-1 text-sm text-emerald-800">
                        Simpan kredensial berikut.
                        Password awal hanya
                        ditampilkan pada proses ini.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-emerald-200 bg-white p-3">
                        <p className="text-xs font-bold text-muted-foreground">
                          Username
                        </p>

                        <div className="mt-1 flex items-center justify-between gap-2">
                          <code className="break-all font-bold text-ut-navy">
                            {accountCredentials.username}
                          </code>

                          <Button
                            type="button"
                            variant="formOutline"
                            className="h-8 shrink-0 px-2"
                            onClick={() =>
                              copyToClipboard(
                                accountCredentials.username,
                                "Username",
                              )
                            }
                          >
                            <Copy className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-emerald-200 bg-white p-3">
                        <p className="text-xs font-bold text-muted-foreground">
                          Password Awal
                        </p>

                        <div className="mt-1 flex items-center justify-between gap-2">
                          <code className="break-all font-bold text-ut-navy">
                            {accountCredentials.password}
                          </code>

                          <Button
                            type="button"
                            variant="formOutline"
                            className="h-8 shrink-0 px-2"
                            onClick={() =>
                              copyToClipboard(
                                accountCredentials.password,
                                "Password",
                              )
                            }
                          >
                            <Copy className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      <strong>Penting:</strong>{" "}
                      berikan username dan password
                      awal kepada pendaftar melalui
                      kanal komunikasi yang aman.
                      Pendaftar akan diminta mengganti
                      password saat login pertama.
                    </div>
                  </div>
                ) : selectedRegistration.user_id ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    <p className="font-black">
                      Akun Dashboard User sudah
                      terhubung.
                    </p>

                    <p className="mt-1">
                      Pendaftar ini sudah memiliki
                      akun user.
                    </p>
                  </div>
                ) : selectedStatus ===
                  "terverifikasi" ? (
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <Button
                      type="button"
                      className="gap-2"
                      disabled={
                        createAccount.isPending
                      }
                      onClick={() => {
                        if (
                          selectedRegistration
                        ) {
                          createAccount.mutate(
                            selectedRegistration.id,
                          );
                        }
                      }}
                    >
                      <UserPlus className="size-4" />

                      {createAccount.isPending
                        ? "Membuat Akses..."
                        : "Buat Akses User"}
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-black">
                      Verifikasi pendaftar
                      terlebih dahulu.
                    </p>

                    <p className="mt-1">
                      Akses Dashboard User hanya
                      dapat dibuat setelah status
                      pendaftar menjadi{" "}
                      <strong>
                        Terverifikasi
                      </strong>
                      .
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-ut-navy">
                      WhatsApp Pendaftar
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Nomor diambil langsung dari
                      field Kontak/Nomor HP pada
                      pendaftaran.
                    </p>
                  </div>

                  <MessageCircle className="size-5 text-ut-navy" />
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="font-black text-ut-navy">
                    {selectedRegistration.nama}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedPhone
                      ? `+${selectedPhone}`
                      : "Nomor tidak valid"}
                  </p>
                </div>

                {templatesQuery.isError ? (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />

                    <div>
                      <p className="font-bold">
                        Template WhatsApp gagal
                        dimuat.
                      </p>

                      <p className="mt-1 break-words">
                        {
                          (
                            templatesQuery.error as Error
                          )?.message
                        }
                      </p>

                      <Button
                        type="button"
                        variant="formOutline"
                        className="mt-2 h-8"
                        onClick={() =>
                          void templatesQuery.refetch()
                        }
                      >
                        Muat ulang template
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="mt-4 block space-y-2">
                      <span className="text-xs font-black uppercase tracking-wide text-ut-navy">
                        Pilih Template
                      </span>

                      <select
                        className={inputClass}
                        value={
                          selectedTemplateId
                        }
                        onChange={(event) =>
                          setSelectedTemplateId(
                            event.target.value,
                          )
                        }
                        disabled={
                          templatesQuery.isLoading
                        }
                      >
                        <option value="">
                          Pilih template...
                        </option>

                        {(
                          templatesQuery.data ??
                          []
                        ).map((template) => (
                          <option
                            key={template.id}
                            value={template.id}
                          >
                            {template.name}
                            {template.is_auto_reply
                              ? " — Default"
                              : ""}
                          </option>
                        ))}
                      </select>
                    </label>

                    {selectedTemplate ? (
                      <div className="mt-4 rounded-xl border border-border bg-background p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                            Preview Pesan
                          </span>

                          {selectedTemplate.is_auto_reply ? (
                            <Badge variant="secondary">
                              Default
                            </Badge>
                          ) : null}
                        </div>

                        <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-foreground">
                          {renderTemplate(
                            selectedTemplate.body,
                            selectedRegistration,
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        <AlertCircle className="size-4 shrink-0" />
                        Template WhatsApp belum
                        tersedia.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="formOutline"
                className="gap-2"
                disabled={
                  !selectedRegistration ||
                  !selectedPhone ||
                  !selectedTemplate
                }
                onClick={() => {
                  if (selectedRegistration) {
                    openManualWhatsApp(
                      selectedRegistration,
                      selectedTemplate,
                    );
                  }
                }}
              >
                <ExternalLink className="size-4" />
                Buka WhatsApp
              </Button>
            </div>

            <Button
              type="button"
              variant="formOutline"
              className="gap-2"
              onClick={() => {
                setSelectedRegistration(null);
                setAccountCredentials(null);
              }}
            >
              <X className="size-4" />
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
