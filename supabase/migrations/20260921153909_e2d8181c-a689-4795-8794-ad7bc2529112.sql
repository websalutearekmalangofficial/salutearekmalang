-- 0. Private schema for role helper so it is not callable through the API
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 1. Repoint every policy to the private helper
DROP POLICY "Admins can manage media" ON public.media_library;
CREATE POLICY "Admins can manage media" ON public.media_library FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins can view all nav" ON public.nav_items;
CREATE POLICY "Admins can view all nav" ON public.nav_items FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can manage nav" ON public.nav_items;
CREATE POLICY "Admins can manage nav" ON public.nav_items FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins can view all pages" ON public.pages;
CREATE POLICY "Admins can view all pages" ON public.pages FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can manage pages" ON public.pages;
CREATE POLICY "Admins can manage pages" ON public.pages FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins can view all items" ON public.section_items;
CREATE POLICY "Admins can view all items" ON public.section_items FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can manage items" ON public.section_items;
CREATE POLICY "Admins can manage items" ON public.section_items FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins can view all sections" ON public.sections;
CREATE POLICY "Admins can view all sections" ON public.sections FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can manage sections" ON public.sections;
CREATE POLICY "Admins can manage sections" ON public.sections FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins upload cms media" ON storage.objects;
CREATE POLICY "Admins upload cms media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cms-media' AND private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins update cms media" ON storage.objects;
CREATE POLICY "Admins update cms media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cms-media' AND private.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'cms-media' AND private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins delete cms media" ON storage.objects;
CREATE POLICY "Admins delete cms media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cms-media' AND private.has_role(auth.uid(), 'admin'));

-- 2. Registration admin policies + ownership by account instead of email text
DROP POLICY "Admins can view registrations" ON public.registrations;
CREATE POLICY "Admins can view registrations" ON public.registrations FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can update registrations" ON public.registrations;
CREATE POLICY "Admins can update registrations" ON public.registrations FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can delete registrations" ON public.registrations;
CREATE POLICY "Admins can delete registrations" ON public.registrations FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS registrations_user_id_idx ON public.registrations(user_id);

DROP POLICY IF EXISTS "Users can view own registrations by email" ON public.registrations;
CREATE POLICY "Users can view own registrations" ON public.registrations FOR SELECT TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can submit registration" ON public.registrations;
CREATE POLICY "Anonymous can submit registration" ON public.registrations FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);
CREATE POLICY "Authenticated can submit own registration" ON public.registrations FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 3. Media library metadata no longer readable by anonymous visitors
DROP POLICY IF EXISTS "Public can view media" ON public.media_library;
REVOKE SELECT ON public.media_library FROM anon;

-- 4. Drop the API-exposed definer helper
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);