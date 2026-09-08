-- 1. Create the table
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

-- 2. Grant permissions
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;

-- 3. Enable Row Level Security
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies

-- Allow anyone to view published pages
CREATE POLICY "Public can view published pages" ON public.pages
  FOR SELECT 
  TO anon, authenticated 
  USING (is_published = true);

-- Allow admins to view ALL pages (including unpublished ones)
CREATE POLICY "Admins can view all pages" ON public.pages
  FOR SELECT 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert new pages
CREATE POLICY "Admins can insert pages" ON public.pages
  FOR INSERT 
  TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update pages
CREATE POLICY "Admins can update pages" ON public.pages
  FOR UPDATE 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete pages
CREATE POLICY "Admins can delete pages" ON public.pages
  FOR DELETE 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));
