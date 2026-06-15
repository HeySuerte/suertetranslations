"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BookmarkStatus } from "@/lib/data/engagement";

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

  await supabase
    .from("bookmarks")
    .upsert(
      { user_id: user.id, novel_id: novelId, status, updated_at: new Date().toISOString() },
      { onConflict: "user_id,novel_id" }
    );

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

export async function trackChapterRead(chapterId: string, novelId: string) {
  const { supabase, user } = await getAuthUser();

  // upsert so re-reading a chapter just updates the timestamp
  await supabase
    .from("reading_history")
    .upsert(
      { user_id: user.id, chapter_id: chapterId, novel_id: novelId, read_at: new Date().toISOString() },
      { onConflict: "user_id,chapter_id" }
    );

  // also update bookmark's last_read_chapter if one exists
  const { data: ch } = await supabase
    .from("chapters")
    .select("chapter_number")
    .eq("id", chapterId)
    .single();

  if (ch) {
    await supabase
      .from("bookmarks")
      .update({
        last_read_chapter: (ch as { chapter_number: number }).chapter_number,
        last_read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("novel_id", novelId);
  }
}

// ── Comments ─────────────────────────────────────────────────────────────────

export async function addComment(
  novelId: string,
  novelSlug: string,
  body: string,
  chapterId?: string
) {
  const { supabase, user } = await getAuthUser();

  const { error } = await supabase.from("comments").insert({
    user_id: user.id,
    novel_id: novelId,
    chapter_id: chapterId ?? null,
    body: body.trim(),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/series/${novelSlug}`);
}

export async function deleteComment(commentId: string, novelSlug: string) {
  const { supabase, user } = await getAuthUser();

  await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  revalidatePath(`/series/${novelSlug}`);
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
