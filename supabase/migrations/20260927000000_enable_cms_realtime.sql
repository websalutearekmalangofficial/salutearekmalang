-- Keep public CMS changes visible to open frontend sessions immediately.
alter publication supabase_realtime add table public.pages;
alter publication supabase_realtime add table public.sections;
alter publication supabase_realtime add table public.section_items;
alter publication supabase_realtime add table public.nav_items;
