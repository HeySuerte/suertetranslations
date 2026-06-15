import type { MetadataRoute } from "next";
import { createBuildClient } from "@/lib/supabase/build";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suertetranslations.com";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createBuildClient();

  const [{ data: novels }, { data: chapters }] = await Promise.all([
    supabase
      .from("novels")
      .select("slug, updated_at")
      .eq("is_published", true),
    supabase
      .from("chapters")
      .select("novel_slug, chapter_number, updated_at")
      .eq("is_published", true),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/browse`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  const novelRoutes: MetadataRoute.Sitemap = (novels ?? []).map((n) => ({
    url: `${SITE_URL}/series/${n.slug}`,
    lastModified: new Date(n.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const chapterRoutes: MetadataRoute.Sitemap = (chapters ?? []).map((c) => ({
    url: `${SITE_URL}/read/${c.novel_slug}/${c.chapter_number}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...novelRoutes, ...chapterRoutes];
}
