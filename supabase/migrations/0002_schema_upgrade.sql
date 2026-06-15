-- Schema upgrade: add timestamps, publish flags, novel metadata,
-- chapter improvements, genres table, profiles role, covers bucket.

-- ── novels ──────────────────────────────────────────────────────────────────

do $$ begin
  create type public.novel_status as enum ('ongoing', 'completed', 'hiatus', 'dropped');
exception when duplicate_object then null; end $$;

alter table public.novels
  add column if not exists original_title text,
  add column if not exists author         text,
  add column if not exists translator     text,
  add column if not exists cover_url      text,
  add column if not exists status         public.novel_status default 'ongoing',
  add column if not exists is_published   boolean default false,
  add column if not exists views          integer default 0,
  add column if not exists rating_avg     numeric(3,2) default 0,
  add column if not exists rating_count   integer default 0,
  add column if not exists updated_at     timestamptz default now();

-- Backfill cover_url from old cover column
update public.novels set cover_url = cover where cover_url is null and cover is not null;

-- ── chapters ────────────────────────────────────────────────────────────────

do $$ begin
  create type public.content_format as enum ('markdown', 'html', 'text');
exception when duplicate_object then null; end $$;

alter table public.chapters
  add column if not exists novel_id       uuid references public.novels(id),
  add column if not exists slug           text,
  add column if not exists content_format public.content_format default 'text',
  add column if not exists word_count     integer,
  add column if not exists is_published   boolean default true,
  add column if not exists published_at   timestamptz,
  add column if not exists updated_at     timestamptz default now();

-- Backfill novel_id from novel_slug
update public.chapters c
  set novel_id = n.id
  from public.novels n
  where c.novel_slug = n.slug
    and c.novel_id is null;

-- Backfill word_count
update public.chapters
  set word_count = array_length(string_to_array(trim(content), ' '), 1)
  where word_count is null and content is not null;

-- ── profiles ────────────────────────────────────────────────────────────────

do $$ begin
  create type public.profile_role as enum ('reader', 'staff', 'admin');
exception when duplicate_object then null; end $$;

alter table public.profiles
  add column if not exists role       public.profile_role default 'reader',
  add column if not exists bio        text,
  add column if not exists created_at timestamptz default now();

-- ── genres ──────────────────────────────────────────────────────────────────

create table if not exists public.genres (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table if not exists public.novel_genres (
  novel_id uuid not null references public.novels(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  primary key (novel_id, genre_id)
);

-- ── storage bucket: covers ───────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;
