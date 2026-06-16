import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/chapter-token";
import { getChapterForDelivery } from "@/lib/data/chapters";

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

function randomKey(): string {
  return Math.random().toString(36).slice(2, 8);
}

function fragmentParagraphs(paragraphs: string[]): {
  keys: string[];
  buckets: Record<string, string[]>;
  map: number[];
} {
  const bucketCount = Math.min(Math.max(3, Math.ceil(paragraphs.length / 6)), 5);
  const keys = Array.from({ length: bucketCount }, randomKey);
  const buckets: Record<string, string[]> = {};
  keys.forEach((k) => (buckets[k] = []));
  const map: number[] = [];

  paragraphs.forEach((para) => {
    const idx = Math.floor(Math.random() * bucketCount);
    buckets[keys[idx]].push(para);
    map.push(idx);
  });

  return { keys, buckets, map };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const chapterParam = searchParams.get("chapter");
  const token = searchParams.get("token");

  if (!slug || !chapterParam || !token) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const chapterNumber = Number(chapterParam);
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
    return NextResponse.json({ error: "Invalid chapter" }, { status: 400 });
  }

  const ua = request.headers.get("user-agent") ?? "";
  const ip = getIp(request);

  if (!validateToken(slug, chapterParam, token, ua, ip)) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const chapter = await getChapterForDelivery(slug, chapterNumber);
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const paragraphs = chapter.content
    .split(/\n+/)
    .map((p: string) => p.trim())
    .filter(Boolean);

  const { keys, buckets, map } = fragmentParagraphs(paragraphs);

  return NextResponse.json(
    {
      id: chapter.id,
      novel_id: chapter.novel_id,
      chapter_number: chapter.chapter_number,
      keys,
      map,
      ...buckets,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}
