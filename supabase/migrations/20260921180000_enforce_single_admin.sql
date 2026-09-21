-- Prevent concurrent first-admin claims from creating multiple admin roles.
create unique index if not exists user_roles_single_admin_idx
on public.user_roles (role)
where role = 'admin';
