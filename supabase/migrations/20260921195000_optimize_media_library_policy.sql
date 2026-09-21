-- The admin ALL policy already grants SELECT to admins.
-- Remove the redundant SELECT policy to avoid duplicate policy evaluation.
drop policy if exists "Admins can view media" on public.media_library;
