import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { parseChapters } from "@/lib/import/parser";
import { rateLimit } from "@/lib/rate-limit";
import type { Profile } from "@/lib/database.types";

const BODY_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  // Reject oversized payloads before touching the database
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > BODY_SIZE_LIMIT) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 10 import requests per minute per user
  if (!rateLimit(`import:${user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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

  let body: { novel_slug?: unknown; novel_id?: unknown; content?: unknown; publish?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { novel_slug, novel_id, content, publish = false } = body;

  if (
    typeof novel_slug !== "string" || !novel_slug ||
    typeof novel_id !== "string" || !novel_id ||
    typeof content !== "string" || !content
  ) {
    return NextResponse.json({ error: "Missing or invalid novel_slug, novel_id, or content" }, { status: 400 });
  }

  if (content.length > BODY_SIZE_LIMIT) {
    return NextResponse.json({ error: "Content too large" }, { status: 413 });
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
    is_published: !!publish,
    published_at: publish ? new Date().toISOString() : null,
  }));

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  console.log("[DEBUG service]", {
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: !!serviceKey,
    serviceKeyLength: serviceKey.length,
    serviceKeyEqualsAnonKey: serviceKey !== "" && serviceKey === anonKey,
  });

  const service = createServiceClient();
  const test = await service.from("chapters").select("id").limit(1);
  console.log("[DEBUG service test]", test);

  const { data, error } = await service
    .from("chapters")
    .upsert(rows, { onConflict: "novel_id,chapter_number" })
    .select("id, chapter_number, title");
  console.log("[DEBUG import] upsert result — rows:", data?.length, "error:", error);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    inserted: data?.length ?? 0,
    chapters: data,
    parseWarnings: errors,
  });
}
