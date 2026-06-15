-- Grant write privileges for staff/admin content management.
--
-- SELECT was granted in 0005_grants.sql. These grants unlock INSERT, UPDATE,
-- DELETE for the authenticated role on content tables so that server actions
-- in lib/actions/novels.ts and lib/actions/chapters.ts can execute. RLS
-- policies (defined in 0003_rls.sql and 0004_engagement.sql) enforce that only
-- staff/admin rows are actually affected — these grants are a prerequisite for
-- RLS to even run; without them PostgreSQL rejects the query before checking RLS.

grant insert, update, delete on public.novels       to authenticated;
grant insert, update, delete on public.chapters     to authenticated;
grant insert, update, delete on public.genres       to authenticated;
grant insert, update, delete on public.novel_genres to authenticated;

-- profiles: authenticated users may update their own row (avatar, username, bio).
-- Staff-level role changes go through the service_role key, not the anon client.
grant update on public.profiles to authenticated;
