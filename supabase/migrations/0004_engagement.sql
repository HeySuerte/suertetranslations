-- Phase 3 engagement tables: bookmarks, reading_history, comments, ratings.

-- ── bookmarks / library ──────────────────────────────────────────────────────

do $$ begin
  create type public.bookmark_status as enum (
    'reading', 'completed', 'plan_to_read', 'dropped', 'on_hold'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.bookmarks (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  novel_id          uuid not null references public.novels(id) on delete cascade,
  status            public.bookmark_status not null default 'plan_to_read',
  last_read_chapter integer,
  last_read_at      timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique (user_id, novel_id)
);

-- ── reading_history ──────────────────────────────────────────────────────────

create table if not exists public.reading_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  chapter_id  uuid not null references public.chapters(id) on delete cascade,
  novel_id    uuid not null references public.novels(id) on delete cascade,
  read_at     timestamptz default now(),
  unique (user_id, chapter_id)
);

-- ── comments ─────────────────────────────────────────────────────────────────

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  novel_id   uuid references public.novels(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  body       text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint comment_has_target check (novel_id is not null or chapter_id is not null)
);

-- ── ratings ──────────────────────────────────────────────────────────────────

create table if not exists public.ratings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  novel_id   uuid not null references public.novels(id) on delete cascade,
  score      smallint not null check (score between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, novel_id)
);

-- ── trigger: auto-update novels.rating_avg + rating_count ────────────────────

create or replace function public.update_novel_rating()
returns trigger language plpgsql as $$
begin
  update public.novels
  set
    rating_avg   = (select coalesce(avg(score::numeric), 0) from public.ratings where novel_id = coalesce(new.novel_id, old.novel_id)),
    rating_count = (select count(*) from public.ratings where novel_id = coalesce(new.novel_id, old.novel_id)),
    updated_at   = now()
  where id = coalesce(new.novel_id, old.novel_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_update_novel_rating on public.ratings;
create trigger trg_update_novel_rating
  after insert or update or delete on public.ratings
  for each row execute function public.update_novel_rating();

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.bookmarks       enable row level security;
alter table public.reading_history enable row level security;
alter table public.comments        enable row level security;
alter table public.ratings         enable row level security;

-- bookmarks: users manage their own; public can't see others' libraries
drop policy if exists "Users manage own bookmarks" on public.bookmarks;
create policy "Users manage own bookmarks"
  on public.bookmarks for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- reading_history: private to the user
drop policy if exists "Users manage own history" on public.reading_history;
create policy "Users manage own history"
  on public.reading_history for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- comments: public read, authenticated write own rows
drop policy if exists "Anyone can read comments"    on public.comments;
drop policy if exists "Users create own comments"   on public.comments;
drop policy if exists "Users delete own comments"   on public.comments;

create policy "Anyone can read comments"
  on public.comments for select using (true);

create policy "Users create own comments"
  on public.comments for insert
  with check (user_id = auth.uid());

create policy "Users delete own comments"
  on public.comments for delete
  using (user_id = auth.uid());

-- ratings: public read, authenticated write own rows
drop policy if exists "Anyone can read ratings"  on public.ratings;
drop policy if exists "Users manage own ratings" on public.ratings;

create policy "Anyone can read ratings"
  on public.ratings for select using (true);

create policy "Users manage own ratings"
  on public.ratings for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
