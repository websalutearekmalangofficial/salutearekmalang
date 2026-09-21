-- Optimize RLS auth evaluation and remove overlapping permissive SELECT policies.
-- The live database was verified after applying these changes.

alter policy "Admins can manage media" on public.media_library
  using (has_role((select auth.uid()), 'admin'::app_role))
  with check (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Admins can manage nav" on public.nav_items
  using (has_role((select auth.uid()), 'admin'::app_role))
  with check (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Admins can insert nav" on public.nav_items
  using (has_role((select auth.uid()), 'admin'::app_role));
