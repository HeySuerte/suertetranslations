import { createClient } from "@/lib/supabase/server";

export type BookmarkStatus = "reading" | "completed" | "plan_to_read" | "dropped" | "on_hold";

export interface Bookmark {
  id: string;
  user_id: string;
  novel_id: string;
  status: BookmarkStatus;
  last_read_chapter: number | null;
  last_read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  novel_id: string | null;
  chapter_id: string | null;
  body: string;
  created_at: string;
  profiles?: { username: string | null; avatar_url: string | null } | null;
}

export interface Rating {
  id: string;
  user_id: string;
  novel_id: string;
  score: number;
}

// ── Bookmarks ────────────────────────────────────────────────────────────────

export async function getBookmark(
  userId: string,
  novelId: string
): Promise<Bookmark | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .eq("novel_id", novelId)
    .single();
  return (data as Bookmark) ?? null;
}

export async function getUserLibrary(userId: string): Promise<
  (Bookmark & { novels: { id: string; title: string; slug: string; cover_url: string | null; status: string } | null })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*, novels(id, title, slug, cover_url, status)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  console.log("[DEBUG library] getUserLibrary — user_id:", userId, "count:", data?.length ?? 0, "error:", error);
  return (data as never) ?? [];
}

// ── Reading history ───────────────────────────────────────────────────────────

export async function getLastReadChapter(
  userId: string,
  novelId: string
): Promise<number | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookmarks")
    .select("last_read_chapter")
    .eq("user_id", userId)
    .eq("novel_id", novelId)
    .single();
  return (data as { last_read_chapter: number | null } | null)?.last_read_chapter ?? null;
}

// ── Comments ─────────────────────────────────────────────────────────────────

export async function getNovelComments(novelId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(username, avatar_url)")
    .eq("novel_id", novelId)
    .is("chapter_id", null)
    .order("created_at", { ascending: false });
  console.log("[DEBUG comments] getNovelComments — error:", error);
  console.log("[DEBUG comments] getNovelComments — data:", JSON.stringify(data, null, 2));
  return (data as Comment[]) ?? [];
}

export async function getChapterComments(chapterId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(username, avatar_url)")
    .eq("chapter_id", chapterId)
    .order("created_at", { ascending: false });
  console.log("[DEBUG comments] getChapterComments — error:", error);
  console.log("[DEBUG comments raw]", JSON.stringify(data, null, 2));
  return (data as Comment[]) ?? [];
}

// ── Ratings ──────────────────────────────────────────────────────────────────

export async function getUserRating(
  userId: string,
  novelId: string
): Promise<number | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ratings")
    .select("score")
    .eq("user_id", userId)
    .eq("novel_id", novelId)
    .single();
  return (data as { score: number } | null)?.score ?? null;
}

// ── Public profile ────────────────────────────────────────────────────────────

export async function getPublicProfile(username: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, created_at, role")
    .eq("username", username)
    .single();
  return (profile as { id: string; username: string | null; avatar_url: string | null; bio: string | null; created_at: string; role: string } | null);
}
