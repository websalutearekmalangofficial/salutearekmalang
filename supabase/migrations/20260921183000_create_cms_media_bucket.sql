-- Recreate the CMS media bucket in every environment.
-- Public read matches the existing storage.objects SELECT policy and the public CMS use case.
insert into storage.buckets (id, name, public, file_size_limit)
values ('cms-media', 'cms-media', true, 52428800)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;
