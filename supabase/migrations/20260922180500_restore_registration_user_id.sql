-- Restore the registration ownership column expected by the frontend and RLS policies.
alter table public.registrations
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists registrations_user_id_idx
  on public.registrations(user_id);
