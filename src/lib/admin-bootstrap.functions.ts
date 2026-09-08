import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Memberikan peran admin kepada pengguna pertama yang meminta,
 * hanya jika belum ada admin sama sekali di sistem.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) {
      console.error("[admin] claimFirstAdmin count failed", countError.message);
      return { ok: false as const, message: "Gagal memeriksa data admin." };
    }

    if ((count ?? 0) > 0) {
      return { ok: false as const, message: "Admin sudah terdaftar. Hubungi admin untuk mendapatkan akses." };
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });

    if (error) {
      console.error("[admin] claimFirstAdmin insert failed", error.message);
      return { ok: false as const, message: "Gagal menetapkan admin." };
    }

    return { ok: true as const, message: "Akun Anda sekarang menjadi admin." };
  });
