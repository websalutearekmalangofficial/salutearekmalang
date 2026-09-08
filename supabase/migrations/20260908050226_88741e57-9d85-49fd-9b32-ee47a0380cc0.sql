-- helpers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- pages
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  meta_title text,
  meta_description text,
  nav_label text,
  nav_order integer NOT NULL DEFAULT 0,
  show_in_nav boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published pages" ON public.pages
  FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can view all pages" ON public.pages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage pages" ON public.pages
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- sections
CREATE TABLE public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  kind text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  eyebrow text,
  title text,
  subtitle text,
  body text,
  media_url text,
  media_kind text,
  video_url text,
  document_url text,
  link_url text,
  link_label text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sections_page_order_idx ON public.sections (page_id, sort_order);
GRANT SELECT ON public.sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sections TO authenticated;
GRANT ALL ON public.sections TO service_role;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published sections" ON public.sections
  FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can view all sections" ON public.sections
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage sections" ON public.sections
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER sections_updated_at BEFORE UPDATE ON public.sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- section items
CREATE TABLE public.section_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  title text,
  subtitle text,
  body text,
  icon text,
  badges text[] NOT NULL DEFAULT '{}',
  media_url text,
  video_url text,
  document_url text,
  link_url text,
  link_label text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX section_items_section_order_idx ON public.section_items (section_id, sort_order);
GRANT SELECT ON public.section_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.section_items TO authenticated;
GRANT ALL ON public.section_items TO service_role;
ALTER TABLE public.section_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published items" ON public.section_items
  FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can view all items" ON public.section_items
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage items" ON public.section_items
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER section_items_updated_at BEFORE UPDATE ON public.section_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- nav items
CREATE TABLE public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  badge text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nav_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nav_items TO authenticated;
GRANT ALL ON public.nav_items TO service_role;
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active nav" ON public.nav_items
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can view all nav" ON public.nav_items
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage nav" ON public.nav_items
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER nav_items_updated_at BEFORE UPDATE ON public.nav_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- media library
CREATE TABLE public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  storage_path text,
  url text NOT NULL,
  media_kind text NOT NULL DEFAULT 'image',
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_library TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO authenticated;
GRANT ALL ON public.media_library TO service_role;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view media" ON public.media_library
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage media" ON public.media_library
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER media_library_updated_at BEFORE UPDATE ON public.media_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- registrations
CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  sekolah text,
  kota text,
  email text,
  nomor_hp text,
  jalur text,
  status text NOT NULL DEFAULT 'baru',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit registration" ON public.registrations
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view registrations" ON public.registrations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update registrations" ON public.registrations
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete registrations" ON public.registrations
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER registrations_updated_at BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- seed home page content matching the current landing page
INSERT INTO public.pages (slug, title, meta_title, meta_description, nav_label, nav_order, show_in_nav, is_published) VALUES
  ('beranda', 'Beranda', 'Sentra Layanan UT Arek Malang', 'Pendaftaran Sentra Layanan Universitas Terbuka di MPP Merdeka Malang.', 'Beranda', 1, true, true),
  ('informasi', 'Informasi', 'Informasi - Sentra Layanan UT', 'Informasi program dan layanan Sentra Layanan Universitas Terbuka Malang.', 'Informasi', 2, true, true),
  ('panduan', 'Panduan', 'Panduan - Sentra Layanan UT', 'Panduan lengkap alur pendaftaran Sentra Layanan Universitas Terbuka.', 'Panduan', 3, true, true),
  ('kontak', 'Kontak', 'Kontak - Sentra Layanan UT', 'Hubungi Sentra Layanan Universitas Terbuka Arek Malang.', 'Kontak', 4, true, true);

INSERT INTO public.nav_items (label, href, badge, icon, sort_order, is_active) VALUES
  ('Beranda', '#beranda', 'Beranda', 'Home', 1, true),
  ('Informasi', '#informasi', NULL, NULL, 2, true),
  ('Panduan', '#panduan', NULL, NULL, 3, true),
  ('Kontak', '#kontak', NULL, NULL, 4, true);

WITH home AS (SELECT id FROM public.pages WHERE slug = 'beranda')
INSERT INTO public.sections (page_id, kind, sort_order, eyebrow, title, subtitle, body, link_url, link_label, config)
SELECT home.id, v.kind, v.sort_order, v.eyebrow, v.title, v.subtitle, v.body, v.link_url, v.link_label, v.config::jsonb
FROM home, (VALUES
  ('hero', 1, NULL, 'SENTRA LAYANAN UNIVERSITAS TERBUKA ADA DI MPP MERDEKA MALANG LHO YUK KEPOIN !!!', NULL, NULL, NULL, NULL, '{}'),
  ('form', 2, NULL, 'Pendaftaran Sentra Layanan UT', 'Silakan isi data diri Anda dengan lengkap dan benar', NULL, NULL, NULL, '{"submit_label":"Daftar","clear_label":"Clear Data"}'),
  ('process', 3, NULL, 'Alur Pendaftaran', NULL, NULL, NULL, NULL, '{}'),
  ('benefits', 4, NULL, 'Kenapa Memilih Salute Arek Malang?', NULL, NULL, NULL, NULL, '{}'),
  ('testimonials', 5, NULL, 'Apa Kata Mereka?', NULL, NULL, NULL, NULL, '{}'),
  ('contact_banner', 6, NULL, 'Informasi Pendaftaran', 'Kuliah Fleksibel Raih Masa Depan', '0812-3002-4264', 'https://wa.me/6281230024264', 'WhatsApp', '{}')
) AS v(kind, sort_order, eyebrow, title, subtitle, body, link_url, link_label, config);

INSERT INTO public.section_items (section_id, sort_order, title, body, icon, badges)
SELECT s.id, v.sort_order, v.title, v.body, v.icon, v.badges
FROM public.sections s, (VALUES
  (1, 'Isi Formulir di Website', 'Lengkapi data diri Anda pada formulir pendaftaran online.', 'FileText', '{}'::text[]),
  (2, 'Pilih Jalur Pendaftaran', 'Tentukan jalur pendaftaran yang sesuai dengan kebutuhan Anda.', 'Route', '{"SIPAS","Non SIPAS"}'::text[]),
  (3, 'Pilih Jurusan', 'Pilih program studi yang Anda minati.', 'GraduationCap', '{}'::text[]),
  (4, 'Unggah Dokumen', 'KTP, KK, Ijazah SMA/SMK, Legalisir Ijazah, Transkrip Nilai.', 'Upload', '{}'::text[]),
  (5, 'Verifikasi oleh Admin', 'Data Anda diperiksa dan diverifikasi oleh admin kami.', 'ShieldCheck', '{}'::text[]),
  (6, 'Dapat Nomor Akun Pendaftaran', 'Anda menerima nomor akun untuk melanjutkan proses.', 'BadgeCheck', '{}'::text[])
) AS v(sort_order, title, body, icon, badges)
WHERE s.kind = 'process';

INSERT INTO public.section_items (section_id, sort_order, title, body, icon)
SELECT s.id, v.sort_order, v.title, v.body, v.icon
FROM public.sections s, (VALUES
  (1, 'Layanan Pendaftaran Gratis', 'Seluruh proses pendampingan pendaftaran tanpa biaya tambahan.', 'Gift'),
  (2, 'Pendampingan Akademik', 'Tim kami siap membantu Anda selama masa perkuliahan.', 'Users'),
  (3, 'Informasi Cepat & Akurat', 'Setiap pertanyaan dijawab cepat dengan data resmi.', 'Zap'),
  (4, 'Waktu & Tempat Fleksibel', 'Belajar kapan saja dan di mana saja sesuai jadwal Anda.', 'Clock')
) AS v(sort_order, title, body, icon)
WHERE s.kind = 'benefits';

INSERT INTO public.section_items (section_id, sort_order, title, subtitle, body)
SELECT s.id, v.sort_order, v.title, v.subtitle, v.body
FROM public.sections s, (VALUES
  (1, 'Rizky Ananda', 'Alumni', 'Proses pendaftarannya mudah dan dibantu sampai selesai. Sangat membantu untuk saya yang bekerja.'),
  (2, 'Dwi Puspita', 'Mahasiswa Aktif', 'Jadwal kuliah fleksibel jadi saya tetap bisa bekerja sambil menyelesaikan studi.'),
  (3, 'Ahmad Fauzi', 'Alumni', 'Tim Salute Arek Malang responsif dan informasinya jelas dari awal sampai lulus.')
) AS v(sort_order, title, subtitle, body)
WHERE s.kind = 'testimonials';