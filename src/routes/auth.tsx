import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, LogIn, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { checkIsAdmin } from "@/hooks/use-session";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk atau Daftar - Sentra Layanan UT" },
      {
        name: "description",
        content:
          "Masuk atau buat akun Sentra Layanan UT Arek Malang untuk memantau pendaftaran dan mengelola konten website.",
      },
      { property: "og:title", content: "Masuk atau Daftar - Sentra Layanan UT" },
      {
        property: "og:description",
        content: "Akses akun Sentra Layanan UT Arek Malang untuk memantau status pendaftaran Anda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const inputClass =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-base font-semibold outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25 sm:text-sm";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    const routeUser = async (userId: string) => {
      const isAdmin = await checkIsAdmin(userId);
      if (!active) return;
      navigate({ to: isAdmin ? "/admin" : "/dashboard", replace: true });
    };

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data?.session?.user) void routeUser(data.session.user.id);
      })
      .catch(() => {});

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session?.user) {
        void routeUser(session.user.id);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "masuk") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          toast.error(
            error.message === "Invalid login credentials"
              ? "Email atau kata sandi salah."
              : error.message === "Email not confirmed"
                ? "Email belum dikonfirmasi. Silakan cek kotak masuk Anda."
                : error.message,
          );
          return;
        }
        toast.success("Berhasil masuk.");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: { full_name: fullName.trim() },
          },
        });
        if (error) {
          toast.error(
            error.message.includes("already registered")
              ? "Email ini sudah terdaftar. Silakan masuk."
              : error.message,
          );
          return;
        }
        if (data.session) {
          toast.success("Akun dibuat dan Anda langsung masuk.");
        } else {
          toast.success("Cek email Anda untuk mengonfirmasi akun sebelum masuk.");
          setMode("masuk");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.info("Isi alamat email Anda terlebih dahulu.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Tautan penggantian kata sandi telah dikirim ke email Anda.");
  };

  const handleGoogle = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result && "error" in result && result.error) {
        throw new Error(String(result.error));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Masuk dengan Google gagal.");
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
              <h1 className="text-xl font-black leading-tight">Masuk / Daftar</h1>
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
                  className={inputClass}
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
                className={inputClass}
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
                className={inputClass}
              />
              <Button
                type="submit"
                variant="utYellow"
                size="form"
                className="w-full"
                disabled={busy}
              >
                <LogIn className="size-5" aria-hidden="true" />
                {busy ? "Memproses…" : mode === "masuk" ? "Masuk" : "Buat Akun"}
              </Button>
            </form>

            {mode === "masuk" ? (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="mt-3 text-sm font-bold text-ut-blue underline-offset-4 hover:underline"
              >
                Lupa kata sandi?
              </button>
            ) : null}

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
          </div>
        </div>
      </div>
    </main>
  );
}
