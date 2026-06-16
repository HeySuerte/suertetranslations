-- Grant full privileges to service_role on all application tables.
--
-- ROOT CAUSE:
-- service_role bypasses RLS (BYPASSRLS attribute) but is still a normal
-- PostgreSQL role subject to GRANT/REVOKE like any other. All tables in this
-- project were created via raw SQL (SQL Editor, running as the `postgres`
-- owner role), not through the Supabase dashboard UI — which is the only path
-- that auto-grants privileges to anon, authenticated, AND service_role.
-- 0005_grants.sql, 0006_grants_write.sql, and 0007_engagement_grants.sql only
-- ever granted to anon/authenticated, leaving service_role with zero
-- privileges on every table in the project. Any code path using
-- createServiceClient() (lib/data/chapters.ts, lib/data/admin.ts chapter
-- functions, app/api/chapter/route.ts, app/api/import/route.ts) has been
-- failing with "permission denied" since service role was introduced.

grant select, insert, update, delete on public.chapters         to service_role;
grant select, insert, update, delete on public.novels           to service_role;
grant select, insert, update, delete on public.profiles         to service_role;
grant select, insert, update, delete on public.genres           to service_role;
grant select, insert, update, delete on public.novel_genres     to service_role;
grant select, insert, update, delete on public.bookmarks        to service_role;
grant select, insert, update, delete on public.reading_history  to service_role;
grant select, insert, update, delete on public.comments         to service_role;
grant select, insert, update, delete on public.ratings          to service_role;

-- Schema-level USAGE is required for service_role to resolve any of the
-- tables above; Supabase grants this by default on project creation, but
-- it's included here so this migration is self-sufficient if ever replayed
-- on a fresh database.
grant usage on schema public to service_role;
