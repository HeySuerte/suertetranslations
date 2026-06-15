"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (data as { role?: string } | null)?.role ?? "";
  if (!["staff", "admin"].includes(role)) throw new Error("Forbidden");
  return supabase;
}

export async function updateChapter(
  chapterId: string,
  novelSlug: string,
  formData: FormData
) {
  const supabase = await requireStaff();

  const fields = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    updated_at: new Date().toISOString(),
    word_count: computeWordCount(formData.get("content") as string),
  };

  const { error } = await supabase
    .from("chapters")
    .update(fields)
    .eq("id", chapterId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/novels`);
  revalidatePath(`/series/${novelSlug}`);
}

export async function toggleChapterPublished(
  chapterId: string,
  novelSlug: string,
  publish: boolean
) {
  const supabase = await requireStaff();

  const { error } = await supabase
    .from("chapters")
    .update({
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", chapterId);

  if (error) throw new Error(error.message);

  revalidatePath(`/series/${novelSlug}`);
}

function computeWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
