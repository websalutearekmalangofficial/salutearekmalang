-- Use a guarded admin RPC for WhatsApp template reads.
-- The frontend still listens to whatsapp_templates through Supabase Realtime.

create or replace function public.get_admin_whatsapp_templates()
returns setof public.whatsapp_templates
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.has_role((select auth.uid()), 'admin'::app_role) then
    raise exception 'Admin access required';
  end if;

  return query
    select *
    from public.whatsapp_templates
    order by created_at asc;
end;
$$;

revoke all on function public.get_admin_whatsapp_templates() from public;
grant execute on function public.get_admin_whatsapp_templates() to authenticated;
