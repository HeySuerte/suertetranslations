-- Grant missing privileges on engagement tables.
--
-- ROOT CAUSE:
-- 0004_engagement.sql created bookmarks, reading_history, comments, and ratings
-- via raw SQL. PostgreSQL grants ownership to the executing role (postgres /
-- service_role) but grants nothing to anon or authenticated.
-- 0005_grants.sql and 0006_grants_write.sql only covered content tables
-- (profiles, novels, chapters, genres, novel_genres).
-- Without these grants, every query on engagement tables is rejected with
-- "permission denied" before RLS even runs, causing silent failures throughout
-- the bookmark / library / comment / rating flows.

-- bookmarks: authenticated users read and write their own rows (RLS enforces user_id = auth.uid())
grant select, insert, update, delete on public.bookmarks       to authenticated;

-- reading_history: same pattern
grant select, insert, update, delete on public.reading_history to authenticated;

-- comments: public read (anyone can see comments), authenticated write own rows
grant select                          on public.comments        to anon;
grant select, insert, update, delete  on public.comments        to authenticated;

-- ratings: public read, authenticated write own rows
grant select                          on public.ratings         to anon;
grant select, insert, update, delete  on public.ratings         to authenticated;
