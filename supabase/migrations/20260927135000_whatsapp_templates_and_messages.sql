-- WhatsApp templates/messages: reproducible schema, starter templates, and admin-only access.

create table if not exists public.whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  body text not null,
  meta_template_name text,
  meta_language_code text not null default 'id',
  is_active boolean not null default true,
  is_auto_reply boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null,
  template_id uuid,
  phone_number text not null,
  message_body text not null,
  status text not null default 'pending',
  provider_message_id text,
  error_message text,
  sent_by uuid,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists whatsapp_templates_meta_name_key
  on public.whatsapp_templates(meta_template_name)
  where meta_template_name is not null;

create index if not exists whatsapp_messages_registration_id_idx
  on public.whatsapp_messages(registration_id, created_at desc);

create index if not exists whatsapp_messages_status_idx
  on public.whatsapp_messages(status, created_at desc);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'whatsapp_messages_registration_id_fkey') then
    alter table public.whatsapp_messages add constraint whatsapp_messages_registration_id_fkey
      foreign key (registration_id) references public.registrations(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'whatsapp_messages_template_id_fkey') then
    alter table public.whatsapp_messages add constraint whatsapp_messages_template_id_fkey
      foreign key (template_id) references public.whatsapp_templates(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'whatsapp_messages_status_check') then
    alter table public.whatsapp_messages add constraint whatsapp_messages_status_check
      check (status in ('pending','sent','failed'));
  end if;
end $$;

alter table public.whatsapp_templates enable row level security;
alter table public.whatsapp_messages enable row level security;

revoke all on public.whatsapp_templates from anon;
revoke all on public.whatsapp_messages from anon;

grant select, insert, update, delete on public.whatsapp_templates to authenticated;
grant select, insert, update on public.whatsapp_messages to authenticated;

drop policy if exists "Admins can manage whatsapp templates" on public.whatsapp_templates;
create policy "Admins can manage whatsapp templates" on public.whatsapp_templates
for all to authenticated
using (private.has_role((select auth.uid()), 'admin'::app_role))
with check (private.has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Admins can view whatsapp messages" on public.whatsapp_messages;
create policy "Admins can view whatsapp messages" on public.whatsapp_messages
for select to authenticated
using (private.has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Admins can insert whatsapp messages" on public.whatsapp_messages;
create policy "Admins can insert whatsapp messages" on public.whatsapp_messages
for insert to authenticated
with check (private.has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "Admins can update whatsapp messages" on public.whatsapp_messages;
create policy "Admins can update whatsapp messages" on public.whatsapp_messages
for update to authenticated
using (private.has_role((select auth.uid()), 'admin'::app_role))
with check (private.has_role((select auth.uid()), 'admin'::app_role));

insert into public.whatsapp_templates
  (name, description, body, meta_template_name, meta_language_code, is_active, is_auto_reply)
select v.name, v.description, v.body, v.meta_template_name, 'id', true, v.is_auto_reply
from (values
  ('Pendaftaran Berhasil','Otomatis dikirim setelah pendaftaran berhasil.','Selamat {{nama}}! Pendaftaran Akun Salut Malang berhasil. Data Anda telah kami terima, dan tim Sentra Layanan UT akan segera menghubungi Anda untuk proses selanjutnya.','pendaftaran_berhasil',true),
  ('Greetings Admin','Sapaan awal admin sebelum memberikan pengarahan.','Halo {{nama}}, saya Admin Sentra Layanan UT Salut Malang. Terima kasih sudah melakukan pendaftaran. Saya akan membantu memberikan pengarahan terkait proses selanjutnya.','greetings_admin',false),
  ('Pendaftaran Gagal / Kendala','Pemberitahuan ketika pendaftaran mengalami kendala.','Halo {{nama}}, pendaftaran Anda belum dapat kami proses karena terdapat kendala pada data atau proses pengiriman. Tim Sentra Layanan UT akan membantu melakukan pengecekan. Silakan balas pesan ini agar kami dapat membantu.','pendaftaran_gagal_kendala',false),
  ('Pengarahan Selanjutnya','Pesan tindak lanjut setelah admin menghubungi pendaftar.','Halo {{nama}}, berikut pengarahan selanjutnya dari Sentra Layanan UT Salut Malang. Silakan ikuti informasi yang kami sampaikan dan hubungi kami jika ada yang perlu ditanyakan.','pengarahan_selanjutnya',false)
) as v(name,description,body,meta_template_name,is_auto_reply)
where not exists (
  select 1 from public.whatsapp_templates t where t.meta_template_name = v.meta_template_name
);
