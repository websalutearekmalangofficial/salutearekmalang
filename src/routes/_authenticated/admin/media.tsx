import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, FileText, ImageIcon, Trash2, Upload, Video } from "lucide-react";
import { toast } from "sonner";

import { AdminCard, Field, inputClass } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { deleteMedia, fetchMedia, uploadMedia, type MediaRow } from "@/lib/admin-cms";

export const Route = createFileRoute("/_authenticated/admin/media")({
  component: MediaAdmin,
});

const kindIcon: Record<string, typeof ImageIcon> = { image: ImageIcon, video: Video, document: FileText };

function formatSize(bytes: number | null) {
  if (!bytes) return "-";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaAdmin() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const mediaQuery = useQuery({ queryKey: ["media"], queryFn: fetchMedia });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["media"] });

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("no-file");
      await uploadMedia(file, title);
    },
    onSuccess: () => {
      toast.success("Berkas berhasil diunggah.");
      setFile(null);
      setTitle("");
      refresh();
    },
    onError: () => toast.error("Gagal mengunggah berkas. Maksimal 50 MB."),
  });

  const remove = useMutation({
    mutationFn: (row: MediaRow) => deleteMedia(row),
    onSuccess: () => {
      toast.success("Berkas dihapus.");
      refresh();
    },
    onError: () => toast.error("Gagal menghapus berkas."),
  });

  const rows = mediaQuery.data ?? [];

  return (
    <>
      <AdminCard title="Unggah Media" description="Gambar, video, atau dokumen maksimal 50 MB per berkas.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nama berkas (opsional)">
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Pilih berkas">
            <input
              type="file"
              className={inputClass + " py-2.5"}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </Field>
        </div>
        <Button
          type="button"
          variant="utYellow"
          size="form"
          className="mt-4"
          disabled={!file || upload.isPending}
          onClick={() => upload.mutate()}
        >
          <Upload className="size-4" aria-hidden="true" />
          {upload.isPending ? "Mengunggah…" : "Unggah"}
        </Button>
      </AdminCard>

      <AdminCard title="Perpustakaan Media" description="Salin tautan berkas untuk dipakai saat mengedit section.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const Icon = kindIcon[row.media_kind] ?? FileText;
            return (
              <div key={row.id} className="rounded-xl border border-border bg-background p-3">
                {row.media_kind === "image" ? (
                  <img
                    src={row.url}
                    alt={row.title ?? "Media"}
                    loading="lazy"
                    className="mb-3 h-32 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-3 grid h-32 w-full place-items-center rounded-lg bg-section-blue text-ut-navy">
                    <Icon className="size-8" aria-hidden="true" />
                  </div>
                )}
                <p className="truncate text-sm font-black text-ut-navy">{row.title ?? "(tanpa nama)"}</p>
                <p className="text-xs font-bold text-muted-foreground">
                  {row.media_kind} · {formatSize(row.size_bytes)}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="formOutline"
                    className="h-10 flex-1 rounded-full px-3"
                    onClick={() => {
                      navigator.clipboard.writeText(row.url);
                      toast.success("Tautan disalin.");
                    }}
                  >
                    <Copy className="size-4" aria-hidden="true" />
                    Salin tautan
                  </Button>
                  <Button
                    type="button"
                    variant="formOutline"
                    className="h-10 w-10 rounded-full p-0"
                    aria-label="Hapus berkas"
                    onClick={() => remove.mutate(row)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && !mediaQuery.isLoading ? (
            <p className="text-sm font-medium text-muted-foreground">Belum ada berkas.</p>
          ) : null}
        </div>
      </AdminCard>
    </>
  );
}
