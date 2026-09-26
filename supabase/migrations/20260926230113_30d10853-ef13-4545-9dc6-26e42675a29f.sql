DROP POLICY IF EXISTS "Read cms media" ON storage.objects;
CREATE POLICY "Admins read cms media" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'cms-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));