import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Ganti Kata Sandi - Sentra Layanan UT" },
      {
        name: "description",
        content: "Buat kata sandi baru untuk akun Sentra Layanan UT Arek Malang Anda.",
      },
      { property: "og:title", content: "Ganti Kata Sandi - Sentra Layanan UT" },
      {
        property: "og:description",
        content: "Halaman penggantian kata sandi akun Sentra Layanan UT Arek Malang.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setReady(Boolean(data.session)))
      .catch(() => setReady(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setReady(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (password !== confirm) {
      toast.error("Konfirmasi kata sandi tidak sama.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Kata sandi berhasil diganti.");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-section-blue px-4 py-10 font-body">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-form">
        <div className="flex items-center gap-3 bg-form-header px-5 py-4 text-form-header-foreground">
          <KeyRound className="size-9 shrink-0 text-ut-yellow" aria-hidden="true" />
          <h1 className="text-xl font-black leading-tight">Buat Kata Sandi Baru</h1>
        </div>
        <div className="px-5 py-5">
          {ready ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Kata Sandi Baru"
                aria-label="Kata Sandi Baru"
                autoComplete="new-password"
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base font-semibold outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25 sm:text-sm"
              />
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Ulangi Kata Sandi Baru"
                aria-label="Ulangi Kata Sandi Baru"
                autoComplete="new-password"
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base font-semibold outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25 sm:text-sm"
              />
              <Button
                type="submit"
                variant="utYellow"
                size="form"
                className="w-full"
                disabled={busy}
              >
                {busy ? "Menyimpan…" : "Simpan Kata Sandi"}
              </Button>
            </form>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">
              Buka halaman ini dari tautan yang kami kirim ke email Anda, lalu isi kata sandi baru.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
