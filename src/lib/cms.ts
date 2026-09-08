import {
  BadgeCheck,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardPenLine,
  Clock,
  CloudUpload,
  FileText,
  Gift,
  GraduationCap,
  Headphones,
  Home,
  IdCard,
  Info,
  Mail,
  MapPin,
  Megaphone,
  MonitorCheck,
  Phone,
  Quote,
  Route as RouteIcon,
  School,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  User,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Ikon yang bisa dipilih admin untuk section maupun butir isi. */
export const iconMap: Record<string, LucideIcon> = {
  BadgeCheck,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardPenLine,
  Clock,
  CloudUpload,
  FileText,
  Gift,
  GraduationCap,
  Headphones,
  Home,
  IdCard,
  Info,
  Mail,
  MapPin,
  Megaphone,
  MonitorCheck,
  Phone,
  Quote,
  Route: RouteIcon,
  School,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  User,
  Users,
  Zap,
};

export const iconNames = Object.keys(iconMap).sort();

export function resolveIcon(name?: string | null): LucideIcon | null {
  if (!name) return null;
  return iconMap[name] ?? null;
}

/** Jenis section yang dikenali oleh tampilan publik. */
export const sectionKinds = [
  { value: "hero", label: "Hero (banner utama)" },
  { value: "form", label: "Formulir pendaftaran" },
  { value: "process", label: "Alur langkah bernomor" },
  { value: "benefits", label: "Kartu kelebihan" },
  { value: "testimonials", label: "Testimoni" },
  { value: "contact_banner", label: "Banner kontak" },
  { value: "richtext", label: "Teks bebas" },
  { value: "media", label: "Gambar / Video" },
  { value: "faq", label: "Tanya jawab" },
] as const;

export const mediaKinds = [
  { value: "image", label: "Gambar" },
  { value: "video", label: "Video" },
  { value: "document", label: "Dokumen" },
] as const;

export const registrationStatuses = [
  { value: "baru", label: "Baru" },
  { value: "diproses", label: "Diproses" },
  { value: "terverifikasi", label: "Terverifikasi" },
  { value: "ditolak", label: "Ditolak" },
] as const;

/** Nilai bebas pada config section, dibatasi agar aman dikirim dari server. */
export type SectionConfig = Record<string, string | number | boolean | null>;

export type SectionItem = {
  id: string;
  section_id: string;
  sort_order: number;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  icon: string | null;
  badges: string[];
  media_url: string | null;
  video_url: string | null;
  document_url: string | null;
  link_url: string | null;
  link_label: string | null;
  is_published: boolean;
};

export type Section = {
  id: string;
  page_id: string;
  kind: string;
  sort_order: number;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  media_url: string | null;
  media_kind: string | null;
  video_url: string | null;
  document_url: string | null;
  link_url: string | null;
  link_label: string | null;
  config: SectionConfig;
  is_published: boolean;
  items: SectionItem[];
};

export type PageRecord = {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  nav_label: string | null;
  nav_order: number;
  show_in_nav: boolean;
  is_published: boolean;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  badge: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
};

export type PageContent = {
  page: PageRecord | null;
  sections: Section[];
  nav: NavItem[];
};

export function sectionOf(sections: Section[], kind: string): Section | undefined {
  return sections.find((section) => section.kind === kind);
}

export function configString(section: Section | undefined, key: string, fallback: string): string {
  const value = section?.config?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}
