-- Limit repeated public registration submissions by contact identity.
-- The trigger runs with elevated privileges but is not executable by public API roles.

create or replace function public.enforce_registration_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  recent_count integer;
  normalized_email text := nullif(lower(trim(new.email)), '');
  normalized_phone text := nullif(regexp_replace(coalesce(new.nomor_hp, ''), '[^0-9]+', '', 'g'), '');
begin
  if normalized_email is null and normalized_phone is null then
    raise exception using
      errcode = 'P0001',
      message = 'Email atau nomor HP wajib diisi untuk pendaftaran.';
  end if;

  select count(*) into recent_count
  from public.registrations
  where created_at > now() - interval '15 minutes'
    and (
      (normalized_email is not null and lower(trim(email)) = normalized_email)
      or
      (normalized_phone is not null and regexp_replace(coalesce(nomor_hp, ''), '[^0-9]+', '', 'g') = normalized_phone)
    );

  if recent_count >= 3 then
    raise exception using
      errcode = 'P0001',
      message = 'Terlalu banyak percobaan pendaftaran. Silakan coba lagi beberapa menit.';
  end if;

  return new;
end;
$function$;

revoke all on function public.enforce_registration_rate_limit() from public, anon, authenticated;
grant execute on function public.enforce_registration_rate_limit() to postgres, service_role;

drop trigger if exists registrations_rate_limit on public.registrations;
create trigger registrations_rate_limit
before insert on public.registrations
for each row execute function public.enforce_registration_rate_limit();
