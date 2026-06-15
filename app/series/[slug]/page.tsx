import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getNovelBySlug } from "@/lib/data/novels";
import { getChaptersByNovelSlug } from "@/lib/data/chapters";
import { getBookmark, getNovelComments, getUserRating } from "@/lib/data/engagement";
import ChapterList from "@/components/novel/ChapterList";
import BookmarkButton from "@/components/novel/BookmarkButton";
import RatingWidget from "@/components/novel/RatingWidget";
import CommentSection from "@/components/novel/CommentSection";
import JsonLd from "@/components/seo/JsonLd";
import type { Metadata } from "next";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suertetranslations.com";

export async function generateStaticParams() {
  const { createBuildClient } = await import("@/lib/supabase/build");
  const supabase = createBuildClient();
  const { data } = await supabase
    .from("novels")
    .select("slug")
    .eq("is_published", true);
  return (data ?? []).map((n: { slug: string }) => ({ slug: n.slug }));
}

interface SeriesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const novel = await getNovelBySlug(slug);
  if (!novel) return { title: "Not Found" };

  const description = novel.description
    ?? `Read ${novel.title} on Suerte Translations. Translated by ${novel.translator ?? "our team"}.`;

  return {
    title: novel.title,
    description,
    keywords: [novel.title, novel.author ?? "", novel.translator ?? "", "web novel", "translation"].filter(Boolean),
    openGraph: {
      type: "book",
      title: novel.title,
      description,
      url: `${SITE_URL}/series/${slug}`,
      images: novel.cover_url ? [{ url: novel.cover_url, alt: novel.title }] : [],
      authors: novel.author ? [novel.author] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: novel.title,
      description,
      images: novel.cover_url ? [novel.cover_url] : [],
    },
  };
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [novel, chapters] = await Promise.all([
    getNovelBySlug(slug),
    getChaptersByNovelSlug(slug),
  ]);

  if (!novel) notFound();

  const [bookmark, userRating, novelComments] = await Promise.all([
    user ? getBookmark(user.id, novel.id) : Promise.resolve(null),
    user ? getUserRating(user.id, novel.id) : Promise.resolve(null),
    getNovelComments(novel.id),
  ]);

  const statusLabel: Record<string, string> = {
    ongoing: "Ongoing",
    completed: "Completed",
    hiatus: "Hiatus",
    dropped: "Dropped",
  };

  const continueChapter = bookmark?.last_read_chapter
    ? bookmark.last_read_chapter + 1
    : null;
  const continueTarget = continueChapter
    ? chapters.find((c) => c.chapter_number === continueChapter) ?? chapters[chapters.length - 1]
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: novel.title,
    author: novel.author ? { "@type": "Person", name: novel.author } : undefined,
    description: novel.description ?? undefined,
    image: novel.cover_url ?? undefined,
    url: `${SITE_URL}/series/${slug}`,
    numberOfPages: chapters.length,
    inLanguage: "en",
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <JsonLd data={jsonLd} />
      {/* HERO */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="shrink-0 w-48 mx-auto md:mx-0">
          <div
            className="w-48 aspect-[3/4] rounded-2xl overflow-hidden relative"
            style={{ border: "1px solid var(--border)" }}
          >
            {novel.cover_url ? (
              <Image
                src={novel.cover_url}
                alt={novel.title}
                fill
                sizes="192px"
                className="object-cover"
                priority
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-4xl"
                style={{ background: "var(--surface-2)" }}
              >
                📖
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <h1 className="text-4xl font-black text-white leading-tight">{novel.title}</h1>

          {novel.original_title && (
            <p className="text-sm" style={{ color: "var(--muted)" }}>{novel.original_title}</p>
          )}

          <div className="flex flex-wrap gap-2 text-sm">
            {novel.author && (
              <span
                className="px-3 py-1 rounded-full"
                style={{ background: "var(--surface-2)", color: "var(--muted)" }}
              >
                Author: {novel.author}
              </span>
            )}
            {novel.translator && (
              <span
                className="px-3 py-1 rounded-full"
                style={{ background: "var(--surface-2)", color: "var(--accent-light)" }}
              >
                TL: {novel.translator}
              </span>
            )}
            <span
              className="px-3 py-1 rounded-full font-semibold"
              style={{ background: "rgba(124,58,237,0.15)", color: "var(--accent-light)", border: "1px solid rgba(124,58,237,0.3)" }}
            >
              {statusLabel[novel.status] ?? novel.status}
            </span>
          </div>

          {/* Rating */}
          {user && (
            <RatingWidget
              novelId={novel.id}
              novelSlug={slug}
              initialScore={userRating}
              avgRating={novel.rating_avg ?? 0}
              ratingCount={novel.rating_count ?? 0}
            />
          )}
          {!user && novel.rating_avg > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ color: "#fbbf24" }}>★</span>
              <span style={{ color: "#fff", fontWeight: 700 }}>
                {novel.rating_avg.toFixed(1)}
              </span>
            </div>
          )}

          {novel.description && (
            <p className="leading-relaxed" style={{ color: "#9ca3af" }}>{novel.description}</p>
          )}

          <div className="flex gap-4 text-sm mt-2" style={{ color: "var(--muted)" }}>
            <span>{chapters.length} chapter{chapters.length !== 1 ? "s" : ""}</span>
            {novel.views > 0 && <span>{novel.views.toLocaleString()} views</span>}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {/* Continue Reading */}
            {continueTarget && bookmark && (
              <Link
                href={`/read/${slug}/${continueTarget.chapter_number}`}
                className="px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Continue → Ch. {continueTarget.chapter_number}
              </Link>
            )}

            {/* Start Reading */}
            {chapters.length > 0 && !bookmark && (
              <Link
                href={`/read/${slug}/${chapters[0].chapter_number}`}
                className="px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Start Reading →
              </Link>
            )}

            {/* Bookmark */}
            {user && (
              <BookmarkButton
                novelId={novel.id}
                novelSlug={slug}
                initialStatus={bookmark?.status ?? null}
              />
            )}
          </div>
        </div>
      </div>

      {/* CHAPTERS */}
      <h2 className="text-2xl font-bold text-white mb-4">Chapters</h2>
      <ChapterList novelSlug={slug} chapters={chapters} />

      {/* COMMENTS */}
      <div
        className="mt-12 p-6 rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <CommentSection
          novelId={novel.id}
          novelSlug={slug}
          initialComments={novelComments}
          currentUserId={user?.id ?? null}
        />
      </div>
    </div>
  );
}
