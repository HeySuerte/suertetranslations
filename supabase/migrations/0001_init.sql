-- Baseline schema capturing the existing state of the database.
-- Run this first to establish version control over the schema.

create table if not exists public.novels (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  description text,
  cover       text,
  created_at  timestamptz default now()
);

create table if not exists public.chapters (
  id             uuid primary key default gen_random_uuid(),
  novel_slug     text not null references public.novels(slug) on delete cascade,
  chapter_number integer not null,
  title          text not null,
  content        text,
  created_at     timestamptz default now(),
  unique (novel_slug, chapter_number)
);

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text,
  avatar_url text
);
