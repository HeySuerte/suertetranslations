import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseChapters } from "@/lib/import/parser";
import type { Profile } from "@/lib/database.types";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const profile = profileData as Pick<Profile, "role"> | null;

  if (!profile || !["staff", "admin"].includes(profile.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { novel_slug, novel_id, content, publish = false } = body;

  if (!novel_slug || !novel_id || !content) {
    return NextResponse.json({ error: "Missing novel_slug, novel_id, or content" }, { status: 400 });
  }

  const { chapters, errors } = parseChapters(content);

  if (errors.length > 0 && chapters.length === 0) {
    return NextResponse.json({ error: "Parse failed", details: errors }, { status: 422 });
  }

  const rows = chapters.map((ch) => ({
    novel_id,
    novel_slug,
    chapter_number: ch.chapter_number,
    title: ch.title,
    slug: ch.slug,
    content: ch.content,
    content_format: "text" as const,
    word_count: ch.word_count,
    is_published: publish,
    published_at: publish ? new Date().toISOString() : null,
  }));

  const { data, error } = await supabase
    .from("chapters")
    .upsert(rows, { onConflict: "novel_id,chapter_number" })
    .select("id, chapter_number, title");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    inserted: data?.length ?? 0,
    chapters: data,
    parseWarnings: errors,
  });
}
