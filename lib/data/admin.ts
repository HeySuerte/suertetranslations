import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Chapter, Genre, Novel } from "@/lib/database.types";

export async function getAllNovels(): Promise<Novel[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("novels")
    .select("*")
    .order("updated_at", { ascending: false });
  return (data as Novel[]) ?? [];
}

export async function getNovelById(id: string): Promise<Novel | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("novels")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Novel) ?? null;
}

export async function getAllChaptersForNovel(novelSlug: string): Promise<Chapter[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("chapters")
    .select("*")
    .eq("novel_slug", novelSlug)
    .order("chapter_number", { ascending: true });
  return (data as Chapter[]) ?? [];
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Chapter) ?? null;
}

export async function getAllGenres(): Promise<Genre[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("genres")
    .select("*")
    .order("name");
  return (data as Genre[]) ?? [];
}

export async function getNovelGenreIds(novelId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("novel_genres")
    .select("genre_id")
    .eq("novel_id", novelId);
  return ((data as { genre_id: string }[]) ?? []).map((r) => r.genre_id);
}
