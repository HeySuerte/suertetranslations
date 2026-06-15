-- Enable RLS and define access policies.

-- ── novels ──────────────────────────────────────────────────────────────────

alter table public.novels enable row level security;

create policy "Public read published novels"
  on public.novels for select
  using (is_published = true);

create policy "Staff/admin can manage novels"
  on public.novels for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff', 'admin')
    )
  );

-- ── chapters ────────────────────────────────────────────────────────────────

alter table public.chapters enable row level security;

create policy "Public read published chapters"
  on public.chapters for select
  using (is_published = true);

create policy "Staff/admin can manage chapters"
  on public.chapters for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff', 'admin')
    )
  );

-- ── profiles ────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;

create policy "Anyone can read profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- ── genres / novel_genres ────────────────────────────────────────────────────

alter table public.genres enable row level security;

create policy "Anyone can read genres"
  on public.genres for select
  using (true);

create policy "Staff/admin can manage genres"
  on public.genres for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff', 'admin')
    )
  );

alter table public.novel_genres enable row level security;

create policy "Anyone can read novel_genres"
  on public.novel_genres for select
  using (true);

create policy "Staff/admin can manage novel_genres"
  on public.novel_genres for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff', 'admin')
    )
  );

-- ── storage policies ────────────────────────────────────────────────────────

create policy "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and auth.uid() is not null
  );

create policy "Public read covers"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "Staff/admin can upload covers"
  on storage.objects for insert
  with check (
    bucket_id = 'covers' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff', 'admin')
    )
  );
