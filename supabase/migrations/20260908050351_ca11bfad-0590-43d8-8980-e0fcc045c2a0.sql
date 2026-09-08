CREATE POLICY "Read cms media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'cms-media');
CREATE POLICY "Admins upload cms media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cms-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update cms media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'cms-media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'cms-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete cms media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'cms-media' AND public.has_role(auth.uid(), 'admin'));