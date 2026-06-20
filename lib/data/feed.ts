import { createServiceClient } from "@/lib/supabase/service";

export interface FeedChapter {
  id: string;
  novel_slug: string;
  novel_title: string;
  chapter_number: number;
  title: string;
  published_at: string;
}

// Latest published chapters across all published novels, newest first.
// Used exclusively by the public RSS feed (app/feed.xml/route.ts).
export async function getLatestChaptersForFeed(limit = 50): Promise<FeedChapter[]> {
  const supabase = createServiceClient();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, novel_slug, chapter_number, title, published_at, created_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!chapters || chapters.length === 0) return [];

  const novelSlugs = [...new Set(chapters.map((c) => c.novel_slug))];
  const { data: novels } = await supabase
    .from("novels")
    .select("slug, title, is_published")
    .in("slug", novelSlugs)
    .eq("is_published", true);

  const titleBySlug = new Map((novels ?? []).map((n) => [n.slug, n.title]));

  return chapters
    .filter((c) => titleBySlug.has(c.novel_slug))
    .map((c) => ({
      id: c.id,
      novel_slug: c.novel_slug,
      novel_title: titleBySlug.get(c.novel_slug)!,
      chapter_number: c.chapter_number,
      title: c.title,
      published_at: c.published_at ?? c.created_at,
    }));
}
