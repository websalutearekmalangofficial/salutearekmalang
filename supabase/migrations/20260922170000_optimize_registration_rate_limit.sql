-- Index contact identities used by the registration anti-spam trigger.
create index if not exists registrations_email_created_at_idx
on public.registrations (lower(trim(email)), created_at desc)
where email is not null;

create index if not exists registrations_phone_created_at_idx
on public.registrations (regexp_replace(nomor_hp, '[^0-9]+', '', 'g'), created_at desc)
where nomor_hp is not null;
