-- Auto-create a public.profiles row whenever a new user signs up.
--
-- ROOT CAUSE:
-- No migration or app code ever inserted into public.profiles on signup.
-- Users exist in auth.users but have no corresponding profiles row, so any
-- query embedding profiles(...) (comments, ratings authorship, etc.) returns
-- null and the UI falls back to "Anonymous".

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: create profiles for every existing user that's missing one.
insert into public.profiles (id, username)
select u.id, split_part(u.email, '@', 1)
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
