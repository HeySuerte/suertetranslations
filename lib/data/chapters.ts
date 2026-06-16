import { createServiceClient } from "@/lib/supabase/service";
import type { Chapter } from "@/lib/database.types";

export async function getChaptersByNovelSlug(novelSlug: string): Promise<Chapter[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("chapters")
    .select("*")
    .eq("novel_slug", novelSlug)
    .eq("is_published", true)
    .order("chapter_number", { ascending: true });
  return data ?? [];
}

// Lightweight metadata fetch — no content field returned.
// Used by generateMetadata and the reader shell page.
export async function getChapterMeta(
  novelSlug: string,
  chapterNumber: number
): Promise<Pick<Chapter, "id" | "title" | "chapter_number" | "novel_id" | "word_count"> | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("chapters")
    .select("id, title, chapter_number, novel_id, word_count")
    .eq("novel_slug", novelSlug)
    .eq("chapter_number", chapterNumber)
    .eq("is_published", true)
    .single();
  return data ?? null;
}

// Full chapter including content — used exclusively by /api/chapter.
// Never call this from a server component or SSR path.
export async function getChapterForDelivery(
  novelSlug: string,
  chapterNumber: number
): Promise<Chapter | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("chapters")
    .select("*")
    .eq("novel_slug", novelSlug)
    .eq("chapter_number", chapterNumber)
    .eq("is_published", true)
    .single();
  return data ?? null;
}

export async function getAdjacentChapters(
  novelSlug: string,
  chapterNumber: number
): Promise<{ prev: Chapter | null; next: Chapter | null }> {
  const supabase = createServiceClient();

  const [prevResult, nextResult] = await Promise.all([
    supabase
      .from("chapters")
      .select("chapter_number")
      .eq("novel_slug", novelSlug)
      .eq("is_published", true)
      .lt("chapter_number", chapterNumber)
      .order("chapter_number", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("chapters")
      .select("chapter_number")
      .eq("novel_slug", novelSlug)
      .eq("is_published", true)
      .gt("chapter_number", chapterNumber)
      .order("chapter_number", { ascending: true })
      .limit(1)
      .single(),
  ]);

  return {
    prev: (prevResult.data as Chapter | null) ?? null,
    next: (nextResult.data as Chapter | null) ?? null,
  };
}
