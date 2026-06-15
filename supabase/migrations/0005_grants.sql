-- Restore missing SELECT privileges across all application tables.
--
-- ROOT CAUSE:
-- Migrations 0001–0004 created every table via raw SQL (CREATE TABLE). In
-- PostgreSQL, CREATE TABLE grants ownership to the executing role (postgres /
-- service_role) but grants nothing to other roles. The Supabase dashboard
-- works around this automatically — when you create a table through the UI it
-- runs GRANT SELECT, INSERT, UPDATE, DELETE behind the scenes. That implicit
-- step never happens when tables are created through migration files, so every
-- table in this project ended up with TRUNCATE, REFERENCES, and TRIGGER for
-- anon/authenticated (Supabase defaults for FK/trigger support) but no SELECT.
--
-- SCOPE:
-- Only SELECT is granted here. INSERT/UPDATE/DELETE are intentionally omitted
-- and will be addressed in a separate migration once read access is confirmed
-- working. RLS policies already define row-level restrictions for each table;
-- these grants operate at the table level, one layer below RLS.

grant select on public.profiles     to anon, authenticated;
grant select on public.novels       to anon, authenticated;
grant select on public.chapters     to anon, authenticated;
grant select on public.genres       to anon, authenticated;
grant select on public.novel_genres to anon, authenticated;
