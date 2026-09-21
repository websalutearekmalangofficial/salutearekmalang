-- Optimize RLS auth evaluation and remove overlapping permissive policies.
-- Live database was verified after applying these changes.

alter policy "Admins can manage media" on public.media_library
  using (has_role((select auth.uid()), 'admin'::app_role))
  with check (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Admins can manage nav" on public.nav_items
  using (has_role((select auth.uid()), 'admin'::app_role))
  with check (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Admins can manage sections" on public.sections
  using (has_role((select auth.uid()), 'admin'::app_role))
  with check (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Admins can manage items" on public.section_items
  using (has_role((select auth.uid()), 'admin'::app_role))
  with check (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Admin bisa mengelola halaman" on public.pages
  using (has_role((select auth.uid()), 'admin'::app_role))
  with check (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Admins can view media" on public.media_library
  using (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Admins can view all nav" on public.nav_items
  using (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Admins can view all items" on public.section_items
  using (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Admins can view all sections" on public.sections
  using (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Admins can view all profiles" on public.profiles
  using (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Users can view own profile" on public.profiles
  using ((select auth.uid()) = id);

alter policy "Users can update own profile" on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter policy "Admins can delete registrations" on public.registrations
  using (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Admins can update registrations" on public.registrations
  using (has_role((select auth.uid()), 'admin'::app_role))
  with check (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Admins can view registrations" on public.registrations
  using (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Users can view own registrations by email" on public.registrations
  using (
    email is not null
    and lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'::text), ''::text))
  );

alter policy "Admins can view all roles" on public.user_roles
  using (has_role((select auth.uid()), 'admin'::app_role));

alter policy "Users can view their own roles" on public.user_roles
  using ((select auth.uid()) = user_id);

drop policy if exists "Admins can view media" on public.media_library;
drop policy if exists "Admins can view all nav" on public.nav_items;
drop policy if exists "Admins can view all items" on public.section_items;
drop policy if exists "Admins can view all sections" on public.sections;

drop policy if exists "Public can view active nav" on public.nav_items;
create policy "Public can view active nav" on public.nav_items
  for select to anon
  using (is_active = true);
create policy "Authenticated can view nav" on public.nav_items
  for select to authenticated
  using (is_active = true or has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Publik bisa melihat halaman" on public.pages;
create policy "Publik bisa melihat halaman" on public.pages
  for select to anon
  using (is_published = true);
create policy "Authenticated can view pages" on public.pages
  for select to authenticated
  using (is_published = true or has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Public can view published items" on public.section_items;
create policy "Public can view published items" on public.section_items
  for select to anon
  using (is_published = true);
create policy "Authenticated can view published items" on public.section_items
  for select to authenticated
  using (is_published = true or has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Public can view published sections" on public.sections;
create policy "Public can view published sections" on public.sections
  for select to anon
  using (is_published = true);
create policy "Authenticated can view published sections" on public.sections
  for select to authenticated
  using (is_published = true or has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Authenticated can view profiles" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id or has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Admins can view registrations" on public.registrations;
drop policy if exists "Users can view own registrations by email" on public.registrations;
create policy "Authenticated can view registrations" on public.registrations
  for select to authenticated
  using (
    has_role((select auth.uid()), 'admin'::app_role)
    or (
      email is not null
      and lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'::text), ''::text))
    )
  );

drop policy if exists "Admins can view all roles" on public.user_roles;
drop policy if exists "Users can view their own roles" on public.user_roles;
create policy "Authenticated can view roles" on public.user_roles
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    or has_role((select auth.uid()), 'admin'::app_role)
  );

drop policy if exists "Admins can manage nav" on public.nav_items;
create policy "Admins can insert nav" on public.nav_items
  for insert to authenticated
  with check (has_role((select auth.uid()), 'admin'::app_role));
create policy "Admins can update nav" on public.nav_items
  for update to authenticated
  using (has_role((select auth.uid()), 'admin'::app_role))
  with check (has_role((select auth.uid()), 'admin'::app_role));
create policy "Admins can delete nav" on public.nav_items
  for delete to authenticated
  using (has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Admin bisa mengelola halaman" on public.pages;
create policy "Admins can insert pages" on public.pages
  for insert to authenticated
  with check (has_role((select auth.uid()), 'admin'::app_role));
create policy "Admins can update pages" on public.pages
  for update to authenticated
  using (has_role((select auth.uid()), 'admin'::app_role))
  with check (has_role((select auth.uid()), 'admin'::app_role));
create policy "Admins can delete pages" on public.pages
  for delete to authenticated
  using (has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Admins can manage items" on public.section_items;
create policy "Admins can insert items" on public.section_items
  for insert to authenticated
  with check (has_role((select auth.uid()), 'admin'::app_role));
create policy "Admins can update items" on public.section_items
  for update to authenticated
  using (has_role((select auth.uid()), 'admin'::app_role))
  with check (has_role((select auth.uid()), 'admin'::app_role));
create policy "Admins can delete items" on public.section_items
  for delete to authenticated
  using (has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Admins can manage sections" on public.sections;
create policy "Admins can insert sections" on public.sections
  for insert to authenticated
  with check (has_role((select auth.uid()), 'admin'::app_role));
create policy "Admins can update sections" on public.sections
  for update to authenticated
  using (has_role((select auth.uid()), 'admin'::app_role))
  with check (has_role((select auth.uid()), 'admin'::app_role));
create policy "Admins can delete sections" on public.sections
  for delete to authenticated
  using (has_role((select auth.uid()), 'admin'::app_role));
