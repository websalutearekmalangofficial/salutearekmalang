import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, LogIn, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk Admin - Sentra Layanan UT" },
      {
        name: "description",
        content: "Halaman masuk pengelola konten website Sentra Layanan UT Arek Malang.",
      },
      { property: "og:title", content: "Masuk Admin - Sentra Layanan UT" },
      {
        property: "og:description",
        content: "Masuk untuk mengelola halaman, menu, dan konten website Sentra Layanan UT.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("demo_admin_user")) {
      navigate({ to: "/admin", replace: true });
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data?.session) navigate({ to: "/admin", replace: true });
      })
      .catch(() => {});

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        navigate({ to: "/admin", replace: true });
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleDemoLogin = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "demo_admin_user",
        JSON.stringify({ id: "demo-admin-id", email: "admin@sentralayanan.ut.ac.id" }),
      );
    }
    toast.success("Berhasil masuk sebagai Demo Admin.");
    navigate({ to: "/admin", replace: true });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "masuk") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (
            error.message?.includes("fetch") ||
            error.message?.includes("apiKey") ||
            error.message?.includes("Invalid API key") ||
            error.message?.includes("placeholder")
          ) {
            toast.info(
              "Supabase belum terhubung. Anda dapat menggunakan 'Akses Instant Demo Admin' untuk masuk.",
            );
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Berhasil masuk.");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: { full_name: fullName },
          },
        });
        if (error) {
          if (
            error.message?.includes("fetch") ||
            error.message?.includes("apiKey") ||
            error.message?.includes("Invalid API key") ||
            error.message?.includes("placeholder")
          ) {
            toast.info(
              "Supabase belum terhubung. Silakan gunakan 'Akses Instant Demo Admin' untuk pengujian.",
            );
          } else {
            toast.error(error.message);
          }
          return;
        }
        if (!data.session) {
          toast.success("Cek email Anda untuk mengonfirmasi akun sebelum masuk.");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result && "error" in result && result.error) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin + "/auth",
          },
        });
        if (error) throw error;
      }
    } catch {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin + "/auth",
          },
        });
        if (error) throw error;
      } catch (fallbackError) {
        toast.error(
          fallbackError instanceof Error ? fallbackError.message : "Masuk dengan Google gagal.",
        );
      }
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-section-blue px-4 py-10 font-body">
      <div className="w-full max-w-md">
        <a
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-ut-navy transition hover:text-ut-blue"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke beranda
        </a>

        <div className="overflow-hidden rounded-2xl bg-card shadow-form">
          <div className="flex items-center gap-3 bg-form-header px-5 py-4 text-form-header-foreground">
            <ShieldCheck className="size-10 shrink-0 text-ut-yellow" aria-hidden="true" />
            <div>
              <h1 className="text-xl font-black leading-tight">Panel Pengelola Konten</h1>
              <p className="text-xs font-semibold opacity-90">Sentra Layanan UT Arek Malang</p>
            </div>
          </div>

          <div className="px-5 py-5">
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-section-blue p-1">
              {(["masuk", "daftar"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`rounded-lg px-3 py-2 text-sm font-black capitalize transition ${
                    mode === value ? "bg-ut-yellow text-ut-navy shadow-yellow" : "text-ut-navy/70"
                  }`}
                >
                  {value === "masuk" ? "Masuk" : "Daftar"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "daftar" ? (
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Nama Lengkap"
                  aria-label="Nama Lengkap"
                  autoComplete="name"
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base font-semibold outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25 sm:text-sm"
                />
              ) : null}
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Alamat Email"
                aria-label="Alamat Email"
                autoComplete="email"
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base font-semibold outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25 sm:text-sm"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Kata Sandi"
                aria-label="Kata Sandi"
                autoComplete={mode === "masuk" ? "current-password" : "new-password"}
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base font-semibold outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25 sm:text-sm"
              />
              <Button
                type="submit"
                variant="utYellow"
                size="form"
                className="w-full"
                disabled={busy}
              >
                <LogIn className="size-5" aria-hidden="true" />
                {mode === "masuk" ? "Masuk" : "Buat Akun"}
              </Button>
            </form>

            <div className="my-4 flex items-center gap-3 text-xs font-bold text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              atau
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="formOutline"
              size="form"
              className="w-full"
              onClick={handleGoogle}
            >
              <Mail className="size-5" aria-hidden="true" />
              Lanjutkan dengan Google
            </Button>

            <div className="mt-3 pt-2 border-t border-border">
              <Button
                type="button"
                size="form"
                className="w-full bg-ut-navy text-white hover:bg-ut-navy/90 font-bold"
                onClick={handleDemoLogin}
              >
                <Sparkles className="size-5 text-ut-yellow" aria-hidden="true" />
                Akses Instant Demo Admin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
