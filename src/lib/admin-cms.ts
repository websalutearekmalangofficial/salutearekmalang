import { supabase } from "@/integrations/supabase/client";
import type { NavItem, PageRecord, Section, SectionConfig, SectionItem } from "@/lib/cms";

const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5; // 5 tahun

export async function fetchIsAdmin(userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) return false;
  return Boolean(data);
}

export async function fetchPages(): Promise<PageRecord[]> {
  const { data, error } = await supabase
    .from("pages")
    .select("id, slug, title, meta_title, meta_description, nav_label, nav_order, show_in_nav, is_published")
    .order("nav_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PageRecord[];
}

export async function fetchSections(pageId: string): Promise<Section[]> {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const rows = data ?? [];
  const ids = rows.map((row) => row.id);
  let items: SectionItem[] = [];
  if (ids.length > 0) {
    const { data: itemRows, error: itemError } = await supabase
      .from("section_items")
      .select("*")
      .in("section_id", ids)
      .order("sort_order", { ascending: true });
    if (itemError) throw itemError;
    items = (itemRows ?? []) as unknown as SectionItem[];
  }

  return rows.map((row) => ({
    ...(row as unknown as Omit<Section, "items" | "config">),
    config: (row.config ?? {}) as SectionConfig,
    items: items.filter((item) => item.section_id === row.id),
  }));
}

export async function fetchNavItems(): Promise<NavItem[]> {
  const { data, error } = await supabase
    .from("nav_items")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as NavItem[];
}

export type MediaRow = {
  id: string;
  title: string | null;
  storage_path: string | null;
  url: string;
  media_kind: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export async function fetchMedia(): Promise<MediaRow[]> {
  const { data, error } = await supabase
    .from("media_library")
    .select("id, title, storage_path, url, media_kind, mime_type, size_bytes, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MediaRow[];
}

export type RegistrationRow = {
  id: string;
  nama: string;
  sekolah: string | null;
  kota: string | null;
  email: string | null;
  nomor_hp: string | null;
  jalur: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export async function fetchRegistrations(): Promise<RegistrationRow[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as RegistrationRow[];
}

function guessMediaKind(file: File): "image" | "video" | "document" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

/** Mengunggah berkas ke ruang media lalu mencatatnya di perpustakaan media. */
export async function uploadMedia(file: File, title?: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from("cms-media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: signed, error: signedError } = await supabase.storage
    .from("cms-media")
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signedError || !signed?.signedUrl) throw signedError ?? new Error("Gagal membuat tautan berkas.");

  const { data: user } = await supabase.auth.getUser();

  const { error: insertError } = await supabase.from("media_library").insert({
    title: title?.trim() || file.name,
    storage_path: path,
    url: signed.signedUrl,
    media_kind: guessMediaKind(file),
    mime_type: file.type || null,
    size_bytes: file.size,
    uploaded_by: user.user?.id ?? null,
  });
  if (insertError) throw insertError;

  return signed.signedUrl;
}

export async function deleteMedia(row: MediaRow) {
  if (row.storage_path) {
    await supabase.storage.from("cms-media").remove([row.storage_path]);
  }
  const { error } = await supabase.from("media_library").delete().eq("id", row.id);
  if (error) throw error;
}

/** Menukar urutan dua baris pada tabel yang memiliki kolom sort_order. */
export async function swapOrder(
  table: "sections" | "section_items" | "nav_items" | "pages",
  a: { id: string; order: number },
  b: { id: string; order: number },
) {
  const column = table === "pages" ? "nav_order" : "sort_order";
  const patch = (order: number) => ({ [column]: order }) as never;
  const updates = [
    supabase.from(table).update(patch(b.order)).eq("id", a.id),
    supabase.from(table).update(patch(a.order)).eq("id", b.id),
  ];
  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}
