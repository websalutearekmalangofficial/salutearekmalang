import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ExternalLink,
  Images,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { claimFirstAdmin } from "@/lib/admin-bootstrap.functions";
import { fetchIsAdmin } from "@/lib/admin-cms";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const menu = [
  { to: "/admin", label: "Ringkasan", icon: LayoutDashboard, exact: true },
  { to: "/admin/halaman", label: "Halaman & Section", icon: ListOrdered, exact: false },
  { to: "/admin/navigasi", label: "Menu Navigasi", icon: Menu, exact: false },
  { to: "/admin/media", label: "Media", icon: Images, exact: false },
  { to: "/admin/pendaftar", label: "Data Pendaftar", icon: Users, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!active) return;
        if (data.user?.id) {
          setUserId(data.user.id);
        } else {
          navigate({ to: "/auth", replace: true });
        }
        setAuthChecked(true);
      })
      .catch(() => {
        if (!active) return;
        setAuthChecked(true);
        navigate({ to: "/auth", replace: true });
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", userId],
    queryFn: () => fetchIsAdmin(userId!),
    enabled: Boolean(userId),
  });

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };


  const handleClaim = async () => {
    setClaiming(true);
    try {
      const result = await claimFirstAdmin();
      if (result.ok) {
        toast.success(result.message);
        await queryClient.invalidateQueries({ queryKey: ["is-admin"] });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Gagal meminta akses admin.");
    } finally {
      setClaiming(false);
    }
  };

  if (!authChecked || (userId && isLoading)) {
    return (
      <main className="grid min-h-screen place-items-center bg-section-blue font-body">
        <p className="text-sm font-bold text-ut-navy">Memuat panel…</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-section-blue px-4 font-body">
        <div className="w-full max-w-md rounded-2xl bg-card p-6 text-center shadow-form">
          <ShieldCheck className="mx-auto mb-3 size-12 text-ut-blue" aria-hidden="true" />
          <h1 className="font-display text-xl font-black text-ut-navy">
            Akun Anda belum berperan admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hanya admin yang bisa mengelola konten. Jika Anda pemilik website dan belum ada admin
            sama sekali, klaim akses admin sekarang.
          </p>
          <div className="mt-5 grid gap-2">
            <Button variant="utYellow" size="form" onClick={handleClaim} disabled={claiming}>
              Klaim akses admin
            </Button>
            <Button variant="formOutline" size="form" onClick={handleSignOut}>
              <LogOut className="size-4" aria-hidden="true" />
              Keluar
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-section-blue font-body">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-hero-nav px-4 py-3 text-hero-foreground shadow-header md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={sidebarOpen}
            className="grid size-10 place-items-center rounded-full border border-hero-foreground/60 bg-hero-foreground/10 lg:hidden"
          >
            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-black uppercase leading-none">
              Panel Pengelola
            </p>
            <p className="truncate text-xs font-semibold opacity-90">
              Sentra Layanan UT Arek Malang
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-hero-foreground/60 px-3 py-2 text-xs font-bold transition hover:bg-hero-foreground/10 sm:inline-flex"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Lihat website
          </a>
          <Button variant="heroOutline" size="pill" onClick={handleSignOut}>
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-8">
        <aside
          className={`${sidebarOpen ? "block" : "hidden"} fixed inset-x-4 top-20 z-30 rounded-2xl bg-card p-3 shadow-form lg:static lg:block lg:w-64 lg:shrink-0 lg:self-start lg:rounded-2xl`}
        >
          <nav className="grid gap-1" aria-label="Menu panel admin">
            {menu.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-ut-navy transition hover:bg-section-blue [&.active]:bg-ut-yellow [&.active]:shadow-yellow"
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
