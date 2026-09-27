-- Admin template reads use the table RLS policy directly.
-- Keep the RPC as a compatibility helper without elevated privileges.

create or replace function public.get_admin_whatsapp_templates()
returns setof public.whatsapp_templates
language sql
stable
security invoker
set search_path = public
as $$
  select *
  from public.whatsapp_templates
  order by created_at asc;
$$;

revoke all on function public.get_admin_whatsapp_templates() from public;
revoke all on function public.get_admin_whatsapp_templates() from anon;
grant execute on function public.get_admin_whatsapp_templates() to authenticated;
grant select on public.whatsapp_templates to authenticated;
