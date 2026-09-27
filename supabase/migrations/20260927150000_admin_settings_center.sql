create table if not exists public.admin_settings (
  key text primary key,
  value text not null default '',
  description text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_settings enable row level security;

grant select, insert, update, delete on table public.admin_settings to authenticated;

drop policy if exists "admins can manage settings" on public.admin_settings;
create policy "admins can manage settings"
on public.admin_settings
for all
to authenticated
using ((select private.has_role(auth.uid(), 'admin'::app_role)))
with check ((select private.has_role(auth.uid(), 'admin'::app_role)));

insert into public.admin_settings (key, value, description)
values
  ('whatsapp_mode', 'manual', 'Mode WhatsApp saat ini. Manual membuka WhatsApp dengan pesan terisi; pengiriman dilakukan admin.'),
  ('whatsapp_default_template_id', '', 'ID template WhatsApp default yang dipilih otomatis saat admin membuka chat.'),
  ('whatsapp_enabled', 'true', 'Aktifkan fitur komunikasi WhatsApp di panel admin.')
on conflict (key) do nothing;

create index if not exists admin_settings_updated_at_idx on public.admin_settings(updated_at);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'admin_settings'
  ) then
    alter publication supabase_realtime add table public.admin_settings;
  end if;
end $$;
