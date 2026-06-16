"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getChapterComments } from "@/lib/data/engagement";
import type { BookmarkStatus, Comment } from "@/lib/data/engagement";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

// ── Bookmarks ────────────────────────────────────────────────────────────────

export async function upsertBookmark(
  novelId: string,
  novelSlug: string,
  status: BookmarkStatus
) {
  const { supabase, user } = await getAuthUser();

  console.log("[DEBUG bookmark] upsert — user_id:", user.id, "novel_id:", novelId, "status:", status);
  const { data, error } = await supabase
    .from("bookmarks")
    .upsert(
      { user_id: user.id, novel_id: novelId, status, updated_at: new Date().toISOString() },
      { onConflict: "user_id,novel_id" }
    )
    .select();
  console.log("[DEBUG bookmark] upsert result — data:", data, "error:", error);

  if (error) throw new Error(error.message);

  revalidatePath(`/series/${novelSlug}`);
  revalidatePath("/library");
}

export async function removeBookmark(novelId: string, novelSlug: string) {
  const { supabase, user } = await getAuthUser();

  await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("novel_id", novelId);

  revalidatePath(`/series/${novelSlug}`);
  revalidatePath("/library");
}

// ── Reading history ───────────────────────────────────────────────────────────

export async function trackChapterRead(
  chapterId: string,
  novelId: string,
  chapterNumber: number
) {
  const { supabase, user } = await getAuthUser();

  await Promise.all([
    supabase
      .from("reading_history")
      .upsert(
        { user_id: user.id, chapter_id: chapterId, novel_id: novelId, read_at: new Date().toISOString() },
        { onConflict: "user_id,chapter_id" }
      ),
    supabase
      .from("bookmarks")
      .update({
        last_read_chapter: chapterNumber,
        last_read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("novel_id", novelId),
  ]);
}

// ── Comments ─────────────────────────────────────────────────────────────────

export async function fetchChapterComments(chapterId: string): Promise<Comment[]> {
  return getChapterComments(chapterId);
}

export async function addComment(
  novelId: string,
  novelSlug: string,
  body: string,
  chapterId?: string,
  chapterNumber?: number
) {
  const { supabase, user } = await getAuthUser();

  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 2000) {
    throw new Error("Comment must be between 1 and 2000 characters");
  }

  const { error } = await supabase.from("comments").insert({
    user_id: user.id,
    novel_id: novelId,
    chapter_id: chapterId ?? null,
    body: trimmed,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/series/${novelSlug}`);
  if (chapterId && chapterNumber) {
    revalidatePath(`/read/${novelSlug}/${chapterNumber}`);
  }
}

export async function deleteComment(
  commentId: string,
  novelSlug: string,
  chapterNumber?: number
) {
  const { supabase, user } = await getAuthUser();

  await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  revalidatePath(`/series/${novelSlug}`);
  if (chapterNumber) {
    revalidatePath(`/read/${novelSlug}/${chapterNumber}`);
  }
}

// ── Ratings ──────────────────────────────────────────────────────────────────

export async function rateNovel(
  novelId: string,
  novelSlug: string,
  score: number
) {
  const { supabase, user } = await getAuthUser();

  await supabase
    .from("ratings")
    .upsert(
      { user_id: user.id, novel_id: novelId, score, updated_at: new Date().toISOString() },
      { onConflict: "user_id,novel_id" }
    );

  // trigger handles rating_avg update on novels table
  revalidatePath(`/series/${novelSlug}`);
}
