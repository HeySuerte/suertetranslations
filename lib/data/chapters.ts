import { createClient } from "@/lib/supabase/server";
import type { Chapter } from "@/lib/database.types";

export async function getChaptersByNovelSlug(novelSlug: string): Promise<Chapter[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chapters")
    .select("*")
    .eq("novel_slug", novelSlug)
    .eq("is_published", true)
    .order("chapter_number", { ascending: true });
  return data ?? [];
}

export async function getChapter(
  novelSlug: string,
  chapterNumber: number
): Promise<Chapter | null> {
  const supabase = await createClient();
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
  const supabase = await createClient();

  const [prevResult, nextResult] = await Promise.all([
    supabase
      .from("chapters")
      .select("*")
      .eq("novel_slug", novelSlug)
      .eq("is_published", true)
      .lt("chapter_number", chapterNumber)
      .order("chapter_number", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("chapters")
      .select("*")
      .eq("novel_slug", novelSlug)
      .eq("is_published", true)
      .gt("chapter_number", chapterNumber)
      .order("chapter_number", { ascending: true })
      .limit(1)
      .single(),
  ]);

  return {
    prev: prevResult.data ?? null,
    next: nextResult.data ?? null,
  };
}
