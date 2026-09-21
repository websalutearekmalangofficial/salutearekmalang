-- Media metadata is administrative data; public pages already store the
-- resolved media URL directly in sections/items, so anon does not need
-- SELECT access to media_library.
drop policy if exists "Public can view media" on public.media_library;

create policy "Admins can view media" on public.media_library
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
