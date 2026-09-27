-- Keep exactly one WhatsApp default template and align the configured default.
create unique index if not exists whatsapp_templates_single_default_idx
  on public.whatsapp_templates (is_auto_reply)
  where is_auto_reply = true;

update public.admin_settings s
set value = t.id::text,
    updated_at = now()
from public.whatsapp_templates t
where s.key = 'whatsapp_default_template_id'
  and t.is_auto_reply = true
  and t.is_active = true;

do $$
begin
  if not exists (
    select 1 from public.admin_settings
    where key = 'whatsapp_default_template_id'
  ) then
    insert into public.admin_settings(key,value,description)
    select 'whatsapp_default_template_id', t.id::text, 'Template WhatsApp default untuk tombol Chat.'
    from public.whatsapp_templates t
    where t.is_auto_reply = true and t.is_active = true
    limit 1;
  end if;
end $$;
