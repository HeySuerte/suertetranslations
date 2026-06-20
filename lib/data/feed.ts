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
//
// Note: the live `chapters` table has no `created_at` column, despite it
// being declared in supabase/migrations/0001_init.sql and lib/database.types.ts —
// the production schema has drifted from the migration history. Do not
// reference chapters.created_at here; use published_at only.
export async function getLatestChaptersForFeed(limit = 50): Promise<FeedChapter[]> {
  const supabase = createServiceClient();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, novel_slug, chapter_number, title, published_at")
    .eq("is_published", true)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
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
      published_at: c.published_at!,
    }));
}
