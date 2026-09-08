import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";
import type { NavItem, PageContent, Section, SectionConfig, SectionItem } from "@/lib/cms";

function createPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

const emptyContent: PageContent = { page: null, sections: [], nav: [] };

/** Membaca satu halaman publik beserta section dan isinya, terurut. */
export const getPageContent = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<PageContent> => {
    try {
      const supabase = createPublicClient();

      const [pageResult, navResult] = await Promise.all([
        supabase
          .from("pages")
          .select(
            "id, slug, title, meta_title, meta_description, nav_label, nav_order, show_in_nav, is_published",
          )
          .eq("slug", data.slug)
          .eq("is_published", true)
          .maybeSingle(),
        supabase
          .from("nav_items")
          .select("id, label, href, badge, icon, sort_order, is_active")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

      const nav = (navResult.data ?? []) as NavItem[];
      const page = pageResult.data;
      if (!page) return { ...emptyContent, nav };

      const { data: sectionRows } = await supabase
        .from("sections")
        .select(
          "id, page_id, kind, sort_order, eyebrow, title, subtitle, body, media_url, media_kind, video_url, document_url, link_url, link_label, config, is_published",
        )
        .eq("page_id", page.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      const sectionIds = (sectionRows ?? []).map((row) => row.id);
      let itemRows: SectionItem[] = [];
      if (sectionIds.length > 0) {
        const { data: items } = await supabase
          .from("section_items")
          .select(
            "id, section_id, sort_order, title, subtitle, body, icon, badges, media_url, video_url, document_url, link_url, link_label, is_published",
          )
          .in("section_id", sectionIds)
          .eq("is_published", true)
          .order("sort_order", { ascending: true });
        itemRows = (items ?? []) as SectionItem[];
      }

      const sections: Section[] = (sectionRows ?? []).map((row) => ({
        ...(row as unknown as Omit<Section, "items" | "config">),
        config: (row.config ?? {}) as SectionConfig,
        items: itemRows.filter((item) => item.section_id === row.id),
      }));

      return { page: page as PageContent["page"], sections, nav };
    } catch (error) {
      console.error("[cms] getPageContent failed", error);
      return emptyContent;
    }
  });

const registrationSchema = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  sekolah: z.string().trim().max(160).optional().or(z.literal("")),
  kota: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Alamat email tidak valid").max(255).optional().or(z.literal("")),
  nomor_hp: z.string().trim().max(40).optional().or(z.literal("")),
  jalur: z.string().trim().max(80).optional().or(z.literal("")),
});

/** Menyimpan pengiriman formulir pendaftaran dari halaman publik. */
export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => registrationSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { error } = await supabase.from("registrations").insert({
      nama: data.nama,
      sekolah: data.sekolah || null,
      kota: data.kota || null,
      email: data.email || null,
      nomor_hp: data.nomor_hp || null,
      jalur: data.jalur || null,
    });

    if (error) {
      console.error("[cms] submitRegistration failed", error.message);
      return { ok: false as const, message: "Pendaftaran gagal dikirim. Silakan coba lagi." };
    }

    return {
      ok: true as const,
      message: "Pendaftaran berhasil dikirim. Tim kami akan menghubungi Anda.",
    };
  });
