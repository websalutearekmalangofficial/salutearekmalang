import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ChevronDown, Mail, MapPin, Phone, RefreshCw, Send, School, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/daftar")({
  head: () => ({
    meta: [
      { title: "Mulai Pendaftaran | SALUT Arek Malang" },
      {
        name: "description",
        content: "Mulai pendaftaran layanan Universitas Terbuka melalui SALUT Arek Malang.",
      },
    ],
  }),
  component: DaftarPage,
});

function DaftarPage() {
  const [jalur, setJalur] = useState("Pilih Jalur Pendaftaran");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const nama = String(data.get("nama") || "").trim();
    const sekolah = String(data.get("sekolah") || "").trim();
    const kota = String(data.get("kota") || "").trim();
    const email = String(data.get("email") || "").trim();
    const nomor_hp = String(data.get("nomor_hp") || "").trim();

    if (!nama || !sekolah || !kota || !nomor_hp || jalur === "Pilih Jalur Pendaftaran") {
      toast.error("Harap lengkapi data dan pilih jalur pendaftaran.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { error } = await supabase.from("registrations").insert({
        nama,
        sekolah,
        kota,
        email: email || null,
        nomor_hp,
        jalur,
        user_id: sessionData.session?.user?.id ?? null,
      });

      if (error) {
        console.error("[registration] insert failed", error);
        toast.error("Pendaftaran gagal dikirim. Silakan coba lagi.");
        return;
      }

      form.reset();
      setJalur("Pilih Jalur Pendaftaran");
      toast.success("Pendaftaran berhasil dikirim.");
    } catch (error) {
      console.error("[registration] submit failed", error);
      toast.error("Gagal mengirim data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "nama", label: "Nama Lengkap", type: "text", icon: User },
    { name: "sekolah", label: "Nama Sekolah", type: "text", icon: School },
    { name: "kota", label: "Asal Kota Sekolah", type: "text", icon: MapPin },
    { name: "email", label: "Alamat Email", type: "email", icon: Mail },
    { name: "nomor_hp", label: "Nomor HP / WhatsApp", type: "tel", icon: Phone },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground sm:px-6 md:px-12 md:py-16">
      <div className="mx-auto grid max-w-6xl items-start gap-10 md:grid-cols-2 md:gap-14">
        <div className="pt-2">
          <Link to="/" className="text-sm font-bold text-ut-blue transition hover:underline">
            ← Kembali ke Beranda
          </Link>
          <p className="mt-8 font-script text-3xl font-bold text-ut-blue">SALUT Arek Malang</p>
          <h1 className="mt-3 font-sans text-4xl font-black leading-tight text-black md:text-5xl">
            Mulai Pendaftaran
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Isi data Anda untuk memulai proses pendaftaran melalui Sentra Layanan Universitas Terbuka Arek Malang.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-5 shadow-form sm:p-7">
          <div className="space-y-3">
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <label key={field.name} className="relative block">
                  <Icon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ut-navy" />
                  <input
                    name={field.name}
                    type={field.type}
                    placeholder={field.label}
                    aria-label={field.label}
                    required={field.name !== "email"}
                    className="h-12 w-full rounded-xl border border-input bg-background pl-12 pr-4 text-base font-semibold text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
                  />
                </label>
              );
            })}
            <label className="relative block">
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-ut-navy" />
              <select
                value={jalur}
                onChange={(event) => setJalur(event.target.value)}
                aria-label="Jalur Pendaftaran"
                className="h-12 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-base font-semibold text-ut-navy outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
              >
                <option>Pilih Jalur Pendaftaran</option>
                <option>SIPAS</option>
                <option>Non SIPAS</option>
                <option>Reguler</option>
                <option>RPL</option>
              </select>
            </label>
            <Button type="submit" disabled={isSubmitting} className="mt-2 h-12 w-full rounded-full bg-ut-yellow font-black text-black hover:bg-ut-yellow/90">
              {isSubmitting ? <><RefreshCw className="size-5 animate-spin" />Mengirim...</> : <><Send className="size-5" />Kirim Pendaftaran</>}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
