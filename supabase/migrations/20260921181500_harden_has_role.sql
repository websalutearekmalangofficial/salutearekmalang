-- Harden has_role so authenticated callers can only check their own role.
-- SECURITY DEFINER is intentionally retained because this function is used by
-- RLS policies on public.user_roles; making it invoker would cause recursive RLS evaluation.
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
      and _user_id = (select auth.uid())
  );
$function$;

revoke execute on function public.has_role(uuid, app_role) from anon;
grant execute on function public.has_role(uuid, app_role) to authenticated;
