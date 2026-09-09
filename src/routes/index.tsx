import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardPenLine,
  CloudUpload,
  GraduationCap,
  Headphones,
  Home,
  IdCard,
  Info,
  Mail,
  Menu,
  MapPin,
  Megaphone,
  MonitorCheck,
  Phone,
  Quote,
  RefreshCw,
  School,
  Send,
  ShieldCheck,
  User,
  UserRoundPlus,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import campusHero from "@/assets/ut-campus-hero.jpg";
import saluteStudent from "@/assets/salute-student.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentra Layanan UT Arek Malang" },
      {
        name: "description",
        content:
          "Landing page resmi Sentra Layanan UT Arek Malang untuk pendaftaran, alur layanan, kelebihan, testimoni, dan informasi kontak.",
      },
      { property: "og:title", content: "Sentra Layanan UT Arek Malang" },
      {
        property: "og:description",
        content:
          "Daftar dan dapatkan informasi pendaftaran Universitas Terbuka melalui Sentra Layanan UT Arek Malang.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const navLinks = ["Informasi", "Panduan", "Kontak"];

const formFields = [
  { label: "Nama Lengkap", icon: User, type: "text", name: "nama" },
  { label: "Nama Sekolah", icon: School, type: "text", name: "sekolah" },
  { label: "Asal Kota Sekolah", icon: MapPin, type: "text", name: "kota" },
  { label: "Alamat Email", icon: Mail, type: "email", name: "email" },
  { label: "Nomor HP", icon: Phone, type: "tel", name: "nomor_hp" },
];

const processSteps = [
  {
    number: "1",
    icon: ClipboardPenLine,
    title: "Isi Formulir di Website",
    body: (
      <>
        situs <strong>salutearekmalang.com</strong> lalu isi formulir pendaftaran secara
        lengkap dan benar.
      </>
    ),
  },
  {
    number: "2",
    icon: CheckCircle2,
    title: "Pilih Jalur Pendaftaran",
    badges: ["SIPAS", "Non SIPAS"],
    body: (
      <>
        jalur pendaftaran: <strong>SIPAS</strong> atau <strong>Non SIPAS</strong>, kemudian
        pilih jenis jalur: <strong>Reguler</strong> atau <strong>RPL</strong> (Rekognisi
        Pembelajaran Lampau).
      </>
    ),
  },
  {
    number: "3",
    icon: GraduationCap,
    title: "Pilih Jurusan",
    body: "Pilih jurusan sesuai dengan program studi yang Anda inginkan (seperti pada gambar di samping).",
  },
  {
    number: "4",
    icon: CloudUpload,
    title: "Unggah Dokumen",
    body: (
      <>
        Unggah dokumen persyaratan:
        <br />• KTP
        <br />• KK
        <br />• Ijazah SMA/SMK
        <br />• Legalisir Ijazah SMA/SMK
        <br />• Transkrip Nilai SMA/SMK yang sudah dilegalisir.
      </>
    ),
  },
  {
    number: "5",
    icon: MonitorCheck,
    title: "Verifikasi oleh Admin",
    body: "Data dan dokumen Anda akan diverifikasi oleh admin. Jika semua sudah sesuai, proses akan dilanjutkan ke tahap akhir.",
  },
  {
    number: "6",
    icon: IdCard,
    title: "Dapat Nomor Akun Pendaftaran",
    body: (
      <>
        Setelah verifikasi selesai, Anda akan <strong>mendapatkan nomor akun pendaftaran</strong>{" "}
        melalui email atau nomor HP yang Anda daftarkan.
      </>
    ),
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Layanan Pendaftaran Gratis",
    description:
      "Calon mahasiswa dapat berkonsultasi dan dibantu mengisi pendaftaran tanpa biaya layanan tambahan.",
  },
  {
    icon: BookOpenCheck,
    title: "Pendampingan Akademik",
    description:
      "Tim membantu memahami pilihan program studi, jalur pendaftaran, dan kebutuhan dokumen akademik.",
  },
  {
    icon: Info,
    title: "Informasi Cepat & Akurat",
    description:
      "Setiap pertanyaan dijawab dengan arahan yang jelas agar proses pendaftaran berjalan lancar.",
  },
  {
    icon: Headphones,
    title: "Waktu & Tempat Fleksibel",
    description:
      "Layanan mudah dijangkau dan ramah bagi calon mahasiswa yang memiliki aktivitas padat.",
  },
];

const testimonials = [
  {
    quote:
      "Proses daftar jadi lebih mudah karena semua dokumen dicek satu per satu. Saya tidak bingung memilih jalur kuliah yang sesuai.",
    name: "Rizky Pratama",
    status: "Mahasiswa Aktif",
    initials: "RP",
  },
  {
    quote:
      "Salute Arek Malang membantu saya memahami sistem kuliah UT yang fleksibel. Informasinya cepat dan sangat jelas.",
    name: "Dinda Maharani",
    status: "Alumni",
    initials: "DM",
  },
  {
    quote:
      "Adminnya responsif, ramah, dan sabar menjelaskan pilihan jurusan. Pendaftaran saya selesai tanpa kendala berarti.",
    name: "Bagus Firmansyah",
    status: "Mahasiswa Aktif",
    initials: "BF",
  },
];

function Index() {
  const [selectedPath, setSelectedPath] = useState("Pilih Jalur Pendaftaran");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const nama = formData.get("nama") as string;
    const sekolah = formData.get("sekolah") as string;
    const kota = formData.get("kota") as string;
    const email = formData.get("email") as string;
    const nomor_hp = formData.get("nomor_hp") as string;

    if (!nama || !sekolah || !kota || !nomor_hp) {
      toast.error("Harap isi semua kolom pendaftaran yang wajib.");
      return;
    }
    if (selectedPath === "Pilih Jalur Pendaftaran") {
      toast.error("Harap pilih jalur pendaftaran.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("registrations").insert({
      nama,
      sekolah,
      kota,
      email,
      nomor_hp,
      jalur: selectedPath,
      status: "pending",
    });

    if (error) {
      console.error(error);
      toast.error("Gagal mengirim data. Silakan coba lagi nanti.");
    } else {
      setIsSuccessDialogOpen(true);
      event.currentTarget.reset();
      setSelectedPath("Pilih Jalur Pendaftaran");
    }

    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background font-body text-foreground">
      <Header />
      <HeroRegistration
        selectedPath={selectedPath}
        setSelectedPath={setSelectedPath}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <RegistrationProcess />
      <BenefitsSection />
      <TestimonialsSection />
      <FooterBanner />

      <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="size-8" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-bold">
              Pendaftaran Berhasil!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              Terima kasih telah mendaftar. Data Anda telah kami terima, dan tim Sentra Layanan UT
              akan segera menghubungi Anda untuk proses selanjutnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction
              onClick={() => setIsSuccessDialogOpen(false)}
              className="w-full sm:w-auto px-8"
            >
              Tutup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ut-sky/25 bg-hero-nav text-hero-foreground shadow-header">
      <div className="mx-auto grid min-h-16 w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-2.5 sm:gap-3 sm:py-3 md:min-h-20 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-8 lg:px-12">
        <a
          href="#home"
          className="flex min-w-0 items-center gap-2.5 sm:gap-3"
          aria-label="Sentra Layanan UT Beranda"
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-hero-foreground/70 bg-hero-foreground/10 sm:size-11 md:size-12">
            <Building2 className="size-6 sm:size-7" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="min-w-0 leading-none">
              <p className="truncate text-xs font-black uppercase sm:text-sm md:text-base">
                UNIVERSITAS
              </p>
              <p className="truncate text-xs font-black uppercase sm:text-sm md:text-base">
                TERBUKA
              </p>
            </div>
            <span
              className="hidden h-10 w-px shrink-0 bg-hero-foreground/70 sm:block"
              aria-hidden="true"
            />
            <div className="hidden min-w-0 font-script text-2xl font-bold leading-none text-hero-foreground drop-shadow-title sm:block md:text-4xl">
              Sentra Layanan
              <span className="block font-display text-xl font-black tracking-normal md:text-2xl">
                UT
              </span>
            </div>
          </div>
        </a>

        <nav
          className="hidden items-center justify-center gap-3 md:flex lg:gap-9"
          aria-label="Navigasi utama"
        >
          <a
            href="#home"
            className="inline-flex items-center gap-2 rounded-full bg-ut-yellow px-4 py-2.5 text-sm font-black text-ut-navy shadow-yellow lg:px-5"
          >
            <Home className="size-4" aria-hidden="true" />
            Beranda
          </a>
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="rounded-full px-2 py-1 text-sm font-bold text-hero-foreground/95 transition hover:text-ut-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 md:min-w-0">
          <Button
            variant="heroOutline"
            size="pill"
            className="shrink-0 px-3 text-[0.7rem] sm:px-4 sm:text-xs md:text-sm"
          >
            <CircleUserRound className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Masuk / Daftar</span>
            <span className="sm:hidden">Masuk</span>
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-hero-foreground/60 bg-hero-foreground/10 transition hover:bg-hero-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-yellow md:hidden"
          >
            {menuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-hero-foreground/20 px-4 pb-4 pt-3 md:hidden"
          aria-label="Navigasi mobile"
        >
          <ul className="grid gap-2">
            <li>
              <a
                href="#home"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-ut-yellow px-4 py-3 text-sm font-black text-ut-navy"
              >
                <Home className="size-4" aria-hidden="true" />
                Beranda
              </a>
            </li>
            {navLinks.map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl bg-hero-foreground/10 px-4 py-3 text-sm font-bold text-hero-foreground transition hover:bg-hero-foreground/20"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

function HeroRegistration({
  selectedPath,
  setSelectedPath,
  handleSubmit,
  isSubmitting,
}: {
  selectedPath: string;
  setSelectedPath: (value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}) {
  return (
    <section id="home" className="relative scroll-mt-20 bg-hero-deep text-hero-foreground">
      <img
        src={campusHero}
        alt="Gedung kampus modern Sentra Layanan UT"
        width={1600}
        height={760}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-hero-overlay" aria-hidden="true" />
      <div
        className="absolute inset-y-0 left-0 hidden w-72 bg-side-stripes lg:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-0 h-44 w-full bg-wave-white"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:gap-10 md:px-8 md:py-12 lg:min-h-[540px] lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-8 lg:px-12 lg:py-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="relative flex items-center pb-10 pt-2 sm:pb-12 lg:min-h-[430px] lg:pt-0">
          <Button
            variant="slider"
            size="icon"
            className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 lg:inline-flex"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft className="size-8" aria-hidden="true" />
          </Button>

          <div className="relative z-10 grid w-full gap-4 pl-0 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-center lg:gap-4 lg:pl-16">
            <div className="hidden h-[390px] self-end lg:flex lg:items-end lg:justify-center">
              <img
                src={saluteStudent}
                alt="Mahasiswa Sentra Layanan UT mengenakan jas kuning"
                width={720}
                height={960}
                className="h-full w-auto scale-110 object-contain drop-shadow-student"
              />
            </div>

            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap items-center gap-2.5 text-hero-foreground/95 sm:gap-3 md:mb-6">
                <p className="font-script text-2xl font-bold leading-none drop-shadow-title sm:text-3xl md:text-4xl">
                  Salute Arek Malang
                </p>
                <SmallLogo label="UT" />
                <SmallLogo label="MP" />
                <SmallLogo label="DIKTISAINTEK BERDAMPAK" wide />
              </div>

              <h1 className="max-w-[52rem] origin-left font-display text-[1.9rem] font-black uppercase leading-[1.02] text-hero-foreground drop-shadow-title sm:text-4xl md:text-5xl lg:w-[132%] lg:scale-x-[0.78] lg:text-[3.3rem] lg:leading-[0.98] xl:text-[3.45rem]">
                SENTRA LAYANAN UNIVERSITAS TERBUKA ADA DI MPP MERDEKA MALANG LHO YUK KEPOIN !!!
              </h1>
              <div
                className="mt-4 h-2 w-52 max-w-full rounded-full bg-ut-yellow shadow-yellow sm:w-72 md:mt-5"
                aria-hidden="true"
              />
            </div>
          </div>

          <Button
            variant="slider"
            size="icon"
            className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 lg:inline-flex"
            aria-label="Slide berikutnya"
          >
            <ChevronRight className="size-8" aria-hidden="true" />
          </Button>

          <div
            className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 sm:bottom-3 sm:gap-3 lg:bottom-9"
            aria-hidden="true"
          >
            <span className="size-2.5 rounded-full bg-ut-yellow sm:size-3" />
            <span className="size-2.5 rounded-full bg-hero-foreground/80 sm:size-3" />
            <span className="size-2.5 rounded-full bg-hero-foreground/80 sm:size-3" />
            <span className="size-2.5 rounded-full bg-hero-foreground/80 sm:size-3" />
          </div>
        </div>

        <RegistrationForm
          selectedPath={selectedPath}
          setSelectedPath={setSelectedPath}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </section>
  );
}

function SmallLogo({ label, wide = false }: { label: string; wide?: boolean }) {
  return (
    <span
      className={`inline-flex h-9 items-center justify-center rounded-full border border-hero-foreground/70 bg-hero-foreground/15 px-2.5 text-center text-[0.6rem] font-black leading-tight sm:h-11 sm:px-3 sm:text-xs ${wide ? "min-w-24 sm:min-w-32" : "min-w-9 sm:min-w-11"}`}
    >
      {label}
    </span>
  );
}

function RegistrationForm({
  selectedPath,
  setSelectedPath,
  handleSubmit,
  isSubmitting,
}: {
  selectedPath: string;
  setSelectedPath: (value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}) {
  return (
    <aside className="relative z-20 mx-auto w-full max-w-md self-start overflow-hidden rounded-2xl bg-card text-card-foreground shadow-form lg:mx-0 lg:max-w-none lg:mt-4">
      <div className="flex items-center gap-3 bg-form-header px-4 py-4 text-form-header-foreground sm:gap-4 sm:px-5">
        <UserRoundPlus className="size-10 shrink-0 text-ut-yellow sm:size-12" aria-hidden="true" />
        <h2 className="text-xl font-black leading-tight sm:text-2xl">
          Pendaftaran Sentra Layanan UT
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 px-4 py-4 sm:px-5">
        <p className="text-sm font-semibold leading-snug text-muted-foreground">
          Silakan isi data diri Anda untuk melakukan pendaftaran layanan di Sentra Layanan
          Universitas Terbuka.
        </p>
        {formFields.map((field) => {
          const Icon = field.icon;
          return (
            <label key={field.name} className="relative block">
              <Icon
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ut-navy"
                aria-hidden="true"
              />
              <input
                type={field.type}
                name={field.name}
                placeholder={field.label}
                aria-label={field.label}
                className="h-12 w-full rounded-xl border border-input bg-background pl-12 pr-4 text-base font-semibold sm:text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
            </label>
          );
        })}
        <label className="relative block">
          <Megaphone
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ut-navy"
            aria-hidden="true"
          />
          <select
            value={selectedPath}
            onChange={(event) => setSelectedPath(event.target.value)}
            aria-label="Jalur Pendaftaran"
            className="h-12 w-full appearance-none rounded-xl border border-input bg-background pl-12 pr-10 pt-4 pb-1 text-base font-black sm:text-sm text-ut-navy outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
          >
            <option>Pilih Jalur Pendaftaran</option>
            <option>SIPAS</option>
            <option>Non SIPAS</option>
            <option>Reguler</option>
            <option>RPL</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-ut-navy"
            aria-hidden="true"
          />
          <span className="pointer-events-none absolute left-12 top-1.5 text-[0.62rem] font-bold text-muted-foreground">
            Jalur Pendaftaran
          </span>
        </label>
        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          <Button type="submit" variant="utYellow" size="form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="size-5 animate-spin" aria-hidden="true" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="size-5" aria-hidden="true" />
                Daftar
              </>
            )}
          </Button>
          <Button
            type="reset"
            variant="formOutline"
            size="form"
            disabled={isSubmitting}
            onClick={() => setSelectedPath("Pilih Jalur Pendaftaran")}
          >
            <RefreshCw className="size-5" aria-hidden="true" />
            Clear Data
          </Button>
        </div>
      </form>
    </aside>
  );
}

function RegistrationProcess() {
  return (
    <section
      id="panduan"
      className="relative scroll-mt-20 bg-background px-4 pb-12 pt-10 sm:px-6 md:px-8 md:pt-12 lg:px-12"
    >
      <div className="absolute inset-x-0 top-0 h-28 bg-section-swoop" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 max-w-xl md:mb-10">
          <div className="mb-2 h-1.5 w-20 rounded-full bg-ut-yellow" aria-hidden="true" />
          <h2 className="font-display text-2xl font-black leading-tight text-ut-navy sm:text-3xl md:text-4xl">
            Alur Pendaftaran
            <span className="block">Sentra Layanan UT</span>
          </h2>
          <div
            className="mt-3 h-1.5 w-64 max-w-full rounded-full bg-ut-yellow"
            aria-hidden="true"
          />
        </div>

        <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(6,minmax(0,1fr))] lg:gap-x-5">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                <article className="relative h-full rounded-xl border border-ut-sky/55 bg-card px-4 pb-5 pt-10 text-center shadow-step transition duration-300 hover:-translate-y-1 hover:shadow-form sm:pt-12">
                  <span className="absolute -top-4 left-1/2 grid size-11 -translate-x-1/2 place-items-center rounded-full bg-ut-yellow text-xl font-black text-ut-navy shadow-yellow sm:size-12 sm:text-2xl lg:-left-1 lg:translate-x-0">
                    {step.number}
                  </span>
                  <Icon
                    className="mx-auto mb-3 size-12 text-ut-blue sm:size-16"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  {step.badges ? (
                    <div className="mb-3 flex justify-center gap-2">
                      {step.badges.map((badge) => (
                        <span
                          key={badge}
                          className="inline-flex items-center gap-1 rounded-lg border border-ut-sky bg-background px-2 py-1 text-[0.62rem] font-black text-ut-blue"
                        >
                          <CheckCircle2 className="size-3 text-ut-yellow" aria-hidden="true" />
                          {badge}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <h3 className="mb-2 text-sm font-black leading-tight text-ut-navy sm:text-base">
                    {step.title}
                  </h3>
                  <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </article>
                {index < processSteps.length - 1 ? (
                  <ChevronRight
                    className="absolute -right-4 top-1/2 z-10 hidden size-7 -translate-y-1/2 text-ut-blue lg:block"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section
      id="informasi"
      className="scroll-mt-20 bg-section-blue px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center font-display text-2xl font-black leading-tight text-ut-navy sm:text-3xl md:text-4xl">
          Kenapa Memilih Salute Arek Malang?
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4 md:mt-10">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article
                key={benefit.title}
                className="rounded-2xl bg-card p-5 text-center shadow-benefit sm:p-6 transition duration-300 hover:-translate-y-1 hover:shadow-form"
              >
                <div className="mx-auto mb-4 grid size-14 place-items-center sm:mb-5 sm:size-16 rounded-full bg-ut-yellow text-ut-navy shadow-yellow">
                  <Icon className="size-7 sm:size-8" aria-hidden="true" />
                </div>
                <h3 className="text-base font-black leading-tight text-ut-navy sm:text-lg">
                  {benefit.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:mt-3">
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section
      id="kontak"
      className="scroll-mt-20 bg-background px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center font-display text-2xl font-black text-ut-navy sm:text-3xl md:text-4xl">
          Apa Kata Mereka?
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:mt-10 md:gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-testimonial transition duration-300 hover:-translate-y-1 hover:shadow-form sm:p-6"
            >
              <Quote
                className="mb-3 size-8 fill-current text-ut-yellow sm:mb-4 sm:size-10"
                aria-hidden="true"
              />
              <p className="flex-1 text-sm italic leading-relaxed text-testimonial">
                “{item.quote}”
              </p>
              <div className="mt-5 flex items-center gap-3 sm:mt-6">
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-avatar text-sm font-black text-ut-navy">
                  {item.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black text-ut-navy sm:text-base">
                    {item.name}
                  </h3>
                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-black ${item.status === "Alumni" ? "bg-ut-yellow text-ut-navy" : "bg-status-blue text-ut-blue"}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterBanner() {
  return (
    <footer className="bg-footer-blue px-4 py-6 text-hero-foreground sm:px-6 md:px-8 md:py-7 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:justify-start">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg sm:size-14">
            <Phone className="size-6 sm:size-8" aria-hidden="true" />
          </div>
          <p className="text-lg font-black leading-tight sm:text-xl">
            Informasi
            <span className="block">Pendaftaran</span>
          </p>
          <span className="hidden h-12 w-px bg-hero-foreground/70 sm:block" aria-hidden="true" />
          <a
            href="tel:081230024264"
            className="rounded-full border-4 border-ut-sky bg-footer-pill px-4 py-2 text-lg font-black tracking-normal text-hero-foreground shadow-inner transition hover:bg-ut-sky/30 sm:px-6 sm:text-2xl md:text-3xl"
          >
            0812-3002-4264
          </a>
        </div>
        <p className="text-center font-script text-2xl font-bold italic leading-tight text-hero-foreground sm:text-3xl md:text-right md:text-4xl">
          Kuliah Fleksibel
          <span className="block">Raih Masa Depan</span>
        </p>
      </div>
    </footer>
  );
}
