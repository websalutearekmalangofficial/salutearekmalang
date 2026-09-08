import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Images, ListOrdered, Menu, Users } from "lucide-react";

import { AdminCard } from "@/components/admin/field";
import { fetchMedia, fetchNavItems, fetchPages, fetchRegistrations } from "@/lib/admin-cms";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const pages = useQuery({ queryKey: ["pages"], queryFn: fetchPages });
  const nav = useQuery({ queryKey: ["nav"], queryFn: fetchNavItems });
  const media = useQuery({ queryKey: ["media"], queryFn: fetchMedia });
  const registrations = useQuery({ queryKey: ["registrations"], queryFn: fetchRegistrations });

  const cards = [
    { label: "Halaman", value: pages.data?.length ?? 0, to: "/admin/halaman", icon: ListOrdered },
    { label: "Menu navigasi", value: nav.data?.length ?? 0, to: "/admin/navigasi", icon: Menu },
    { label: "Berkas media", value: media.data?.length ?? 0, to: "/admin/media", icon: Images },
    {
      label: "Pendaftar",
      value: registrations.data?.length ?? 0,
      to: "/admin/pendaftar",
      icon: Users,
    },
  ] as const;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="rounded-2xl bg-card p-5 shadow-benefit transition duration-300 hover:-translate-y-1 hover:shadow-form"
          >
            <div className="mb-3 grid size-11 place-items-center rounded-full bg-ut-yellow text-ut-navy shadow-yellow">
              <card.icon className="size-5" aria-hidden="true" />
            </div>
            <p className="font-display text-3xl font-black text-ut-navy">{card.value}</p>
            <p className="text-sm font-bold text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>

      <AdminCard
        title="Cara mengelola konten"
        description="Semua isi website diambil langsung dari panel ini, jadi setiap perubahan langsung tampil."
      >
        <ol className="grid gap-2 text-sm font-medium text-muted-foreground">
          <li>
            1. Buka <strong className="text-ut-navy">Halaman &amp; Section</strong> untuk mengubah
            judul, teks, gambar, video, tautan, dan urutan tiap bagian.
          </li>
          <li>
            2. Buka <strong className="text-ut-navy">Menu Navigasi</strong> untuk mengatur nama
            menu, tautan, dan urutannya di bagian atas website.
          </li>
          <li>
            3. Unggah foto, video, atau dokumen di <strong className="text-ut-navy">Media</strong>,
            lalu pilih berkasnya saat mengedit section.
          </li>
          <li>
            4. Lihat dan kelola orang yang mengisi formulir di{" "}
            <strong className="text-ut-navy">Data Pendaftar</strong>.
          </li>
        </ol>
      </AdminCard>
    </>
  );
}
