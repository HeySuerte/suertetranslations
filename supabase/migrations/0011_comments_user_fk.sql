-- Add a second foreign key from comments.user_id to public.profiles.id.
--
-- ROOT CAUSE (confirmed via pg_get_constraintdef):
-- comments_user_id_fkey already exists, but it points to auth.users(id).
-- auth.users is never exposed via the PostgREST REST API, so
-- select("*, profiles(username, avatar_url)") has no relationship to resolve
-- the embed through -- profiles always comes back null regardless of RLS or
-- data state.
--
-- FIX: add a second FK on the same column, pointing to public.profiles(id).
-- Postgres allows multiple FK constraints on one column referencing different
-- tables; each is validated independently. Since profiles.id is now 1:1 with
-- auth.users.id (handle_new_user trigger + backfill from 0010), this can
-- never conflict with the existing auth.users FK. The original FK to
-- auth.users is left untouched -- this migration only adds, never drops.

alter table public.comments
  add constraint comments_user_id_profiles_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

notify pgrst, 'reload schema';
