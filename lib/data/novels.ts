import { createClient } from "@/lib/supabase/server";
import type { Novel } from "@/lib/database.types";

export async function getPublishedNovels(): Promise<Novel[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("novels")
    .select("*")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export async function getTrendingNovels(limit = 6): Promise<Novel[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("novels")
    .select("*")
    .eq("is_published", true)
    .order("views", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getLatestNovels(limit = 12): Promise<Novel[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("novels")
    .select("*")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getNovelBySlug(slug: string): Promise<Novel | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("novels")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data ?? null;
}

export async function searchNovels(query: string): Promise<Novel[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("novels")
    .select("*")
    .eq("is_published", true)
    .ilike("title", `%${query}%`)
    .order("title");
  return data ?? [];
}

export async function getNovelsWithFilters(opts: {
  status?: string;
  genre?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ novels: Novel[]; total: number }> {
  const supabase = await createClient();
  const { status, page = 1, pageSize = 12 } = opts;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("novels")
    .select("*", { count: "exact" })
    .eq("is_published", true);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, count } = await query
    .order("updated_at", { ascending: false })
    .range(from, to);

  return { novels: data ?? [], total: count ?? 0 };
}
