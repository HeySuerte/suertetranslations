import { NextResponse } from "next/server";
import { getLatestChaptersForFeed } from "@/lib/data/feed";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suertetranslations.com";
const SITE_NAME = "Suerte Translations";

// Force per-request execution. With only `revalidate` set and no dynamic
// API usage, Next.js statically prerenders this route at build time and
// serves that frozen snapshot forever — new chapters never appear because
// the DB is never queried again. `force-dynamic` makes every request run
// getLatestChaptersForFeed(); the Cache-Control header below still lets
// Vercel's CDN cache the response for 5 minutes to limit DB load.
export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const chapters = await getLatestChaptersForFeed(50);

  const items = chapters
    .map((ch) => {
      // Bot-friendly title for Novel Updates auto-detection: "Novel Name Chapter 12"
      const title = `${ch.novel_title} Chapter ${ch.chapter_number}`;
      const link = `${SITE_URL}/read/${ch.novel_slug}/${ch.chapter_number}`;
      const pubDate = new Date(ch.published_at).toUTCString();
      // Only emit a description when the chapter has its own distinct title
      const description = ch.title && ch.title !== title ? ch.title : "";

      return [
        "    <item>",
        `      <title>${escapeXml(title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        description ? `      <description>${escapeXml(description)}</description>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>Latest chapter releases from ${escapeXml(SITE_NAME)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
