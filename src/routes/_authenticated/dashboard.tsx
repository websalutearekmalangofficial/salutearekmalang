import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ClipboardList, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin, useSession } from "@/hooks/use-session";
import { registrationStatuses } from "@/lib/cms";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: UserDashboard,
});

function statusLabel(value: string) {
  return registrationStatuses.find((status) => status.value === value)?.label ?? value;
}

function UserDashboard() {
  const navigate = useNavigate();
  const { user, loading } = useSession();

  const adminQuery = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: () => checkIsAdmin(user?.id),
    enabled: Boolean(user?.id),
  });

  const registrations = useQuery({
    queryKey: ["my-registrations", user?.email],
    enabled: Boolean(user?.email),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("id, nama, sekolah, kota, jalur, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const rows = registrations.data ?? [];

  return (
    <main className="min-h-screen bg-section-blue font-body">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-hero-nav px-4 py-3 text-hero-foreground shadow-header md:px-8">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-black uppercase leading-none">
            Dashboard Saya
          </p>
          <p className="truncate text-xs font-semibold opacity-90">
            {loading ? "Memuat…" : (user?.email ?? "")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {adminQuery.data ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-hero-foreground/60 px-3 py-2 text-xs font-bold transition hover:bg-hero-foreground/10"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Panel Admin
            </Link>
          ) : null}
          <Button variant="heroOutline" size="pill" onClick={handleSignOut}>
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 md:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-ut-navy transition hover:text-ut-blue"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke beranda
        </Link>

        <section className="rounded-2xl bg-card p-5 shadow-form">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="size-8 text-ut-blue" aria-hidden="true" />
            <div>
              <h1 className="font-display text-xl font-black text-ut-navy">
                Selamat datang{user?.user_metadata?.["full_name"] ? ", " : ""}
                {String(user?.user_metadata?.["full_name"] ?? "")}
              </h1>
              <p className="text-sm font-semibold text-muted-foreground">
                Pantau status pendaftaran Anda di Sentra Layanan UT Arek Malang.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 shadow-form">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="size-5 text-ut-blue" aria-hidden="true" />
            <h2 className="font-display text-lg font-black text-ut-navy">Pendaftaran Saya</h2>
          </div>

          {registrations.isLoading ? (
            <p className="text-sm font-semibold text-muted-foreground">Memuat data…</p>
          ) : rows.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">
                Belum ada pendaftaran dengan alamat email akun ini. Isi formulir pendaftaran di
                beranda menggunakan email yang sama agar statusnya tampil di sini.
              </p>
              <Link to="/">
                <Button variant="utYellow" size="form">
                  Isi Formulir Pendaftaran
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="text-xs font-black uppercase tracking-wide text-ut-navy">
                    <th className="border-b border-border p-2">Nama</th>
                    <th className="border-b border-border p-2">Sekolah / Kota</th>
                    <th className="border-b border-border p-2">Jalur</th>
                    <th className="border-b border-border p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="align-top">
                      <td className="border-b border-border p-2 font-bold text-ut-navy">
                        {row.nama}
                        <span className="block text-xs font-medium text-muted-foreground">
                          {new Date(row.created_at).toLocaleDateString("id-ID")}
                        </span>
                      </td>
                      <td className="border-b border-border p-2 font-medium text-muted-foreground">
                        {row.sekolah ?? "-"}
                        <span className="block text-xs">{row.kota ?? ""}</span>
                      </td>
                      <td className="border-b border-border p-2 font-medium text-muted-foreground">
                        {row.jalur ?? "-"}
                      </td>
                      <td className="border-b border-border p-2">
                        <span className="inline-flex rounded-full bg-ut-yellow px-3 py-1 text-xs font-black text-ut-navy">
                          {statusLabel(row.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
