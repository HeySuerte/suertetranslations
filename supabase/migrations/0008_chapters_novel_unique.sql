-- Add unique constraint on (novel_id, chapter_number).
--
-- The bulk import route uses onConflict: "novel_id,chapter_number" for upserts.
-- PostgREST requires a unique index covering exactly those columns; the existing
-- constraint from 0001_init.sql covers (novel_slug, chapter_number) instead,
-- causing a schema cache error when the import tries to resolve the conflict target.

alter table public.chapters
  add constraint chapters_novel_id_chapter_number_key
  unique (novel_id, chapter_number);
