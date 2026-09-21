import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Memberikan peran admin kepada pengguna pertama yang meminta.
 *
 * Keunikan peran admin dijaga di level database dengan partial unique index,
 * sehingga dua permintaan yang datang bersamaan tidak bisa sama-sama menjadi admin.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });

    if (error) {
      if (error.code === "23505") {
        return {
          ok: false as const,
          message: "Admin sudah terdaftar. Hubungi admin untuk mendapatkan akses.",
        };
      }

      console.error("[admin] claimFirstAdmin insert failed", error.message);
      return { ok: false as const, message: "Gagal menetapkan admin." };
    }

    return { ok: true as const, message: "Akun Anda sekarang menjadi admin." };
  });
