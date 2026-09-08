import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FileText, ImageIcon, Video, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchMedia } from "@/lib/admin-cms";

const kindIcon = { image: ImageIcon, video: Video, document: FileText } as const;

export function MediaPicker({
  label,
  value,
  onChange,
  kind = "image",
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  kind?: "image" | "video" | "document";
}) {
  const [open, setOpen] = useState(false);
  const { data: media = [] } = useQuery({ queryKey: ["media"], queryFn: fetchMedia, enabled: open });
  const Icon = kindIcon[kind];

  return (
    <div className="space-y-2">
      <span className="block text-xs font-black uppercase tracking-wide text-ut-navy">{label}</span>
      <div className="flex gap-2">
        <input
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value || null)}
          placeholder="Tempel tautan atau pilih dari perpustakaan"
          className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm font-semibold outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
        />
        <Button type="button" variant="formOutline" className="h-11 shrink-0 px-3" onClick={() => setOpen((v) => !v)}>
          <Icon className="size-4" aria-hidden="true" />
          Pilih
        </Button>
        {value ? (
          <Button type="button" variant="formOutline" className="h-11 shrink-0 px-3" onClick={() => onChange(null)} aria-label="Hapus media">
            <X className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      {value && kind === "image" ? (
        <img src={value} alt="Pratinjau media" className="h-24 w-auto rounded-lg border border-border object-cover" />
      ) : null}

      {open ? (
        <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-background p-2">
          {media.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Belum ada berkas. Unggah dulu di menu Media.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {media.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(item.url);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg border border-border p-2 text-left text-xs font-bold text-ut-navy transition hover:bg-section-blue"
                  >
                    {item.media_kind === "image" ? (
                      <img src={item.url} alt="" className="size-10 shrink-0 rounded object-cover" />
                    ) : (
                      <span className="grid size-10 shrink-0 place-items-center rounded bg-section-blue">
                        {item.media_kind === "video" ? <Video className="size-4" /> : <FileText className="size-4" />}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate">{item.title ?? item.url}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
