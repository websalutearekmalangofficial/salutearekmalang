-- Move the authorization helper out of the exposed public schema.
-- It remains SECURITY DEFINER because it is called by RLS policies on user_roles;
-- the function itself only returns true for the current authenticated user.

create schema if not exists private;

create or replace function private.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
      and _user_id = (select auth.uid())
  );
$function$;

revoke all on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
grant execute on function private.has_role(uuid, public.app_role) to authenticated;

-- All admin policies use private.has_role instead of the exposed RPC.
-- Public SELECT policies remain unchanged except where they are intentionally
-- split by anon/authenticated role to avoid duplicate permissive policies.
