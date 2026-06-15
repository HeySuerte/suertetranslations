"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { NovelStatus } from "@/lib/database.types";

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

export async function createNovel(formData: FormData) {
  const supabase = await requireStaff();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const author = formData.get("author") as string;
  const translator = formData.get("translator") as string;
  const status = (formData.get("status") as NovelStatus) ?? "ongoing";
  const is_published = formData.get("is_published") === "true";

  const { data, error } = await supabase
    .from("novels")
    .insert({ title, slug, description, author, translator, status, is_published })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/novels");
  revalidatePath("/");
  redirect(`/admin/novels/${(data as { id: string }).id}`);
}

export async function updateNovel(id: string, formData: FormData) {
  const supabase = await requireStaff();

  const fields = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    original_title: (formData.get("original_title") as string) || null,
    description: (formData.get("description") as string) || null,
    author: (formData.get("author") as string) || null,
    translator: (formData.get("translator") as string) || null,
    status: (formData.get("status") as NovelStatus) ?? "ongoing",
    is_published: formData.get("is_published") === "true",
    cover_url: (formData.get("cover_url") as string) || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("novels")
    .update(fields)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/novels/${id}`);
  revalidatePath(`/series/${fields.slug}`);
  revalidatePath("/");
}

export async function updateNovelGenres(novelId: string, genreIds: string[]) {
  const supabase = await requireStaff();

  await supabase.from("novel_genres").delete().eq("novel_id", novelId);

  if (genreIds.length > 0) {
    const rows = genreIds.map((genre_id) => ({ novel_id: novelId, genre_id }));
    const { error } = await supabase.from("novel_genres").insert(rows);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/admin/novels/${novelId}`);
}

export async function createGenre(formData: FormData) {
  const supabase = await requireStaff();

  const name = (formData.get("name") as string).trim();
  const slug = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-");

  const { error } = await supabase.from("genres").insert({ name, slug });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/novels");
}
