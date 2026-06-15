import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getChapter, getAdjacentChapters, getChaptersByNovelSlug } from "@/lib/data/chapters";
import ReaderWrapper from "@/components/reader/ReaderWrapper";
import ReaderSettings from "@/components/reader/ReaderSettings";
import ChapterDropdown from "@/components/reader/ChapterDropdown";
import ReadingTracker from "@/components/reader/ReadingTracker";
import JsonLd from "@/components/seo/JsonLd";
import type { Metadata } from "next";

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suertetranslations.com";


interface ReadPageProps {
  params: Promise<{ slug: string; chapter: string }>;
}

export async function generateMetadata({ params }: ReadPageProps): Promise<Metadata> {
  const { slug, chapter } = await params;
  const ch = await getChapter(slug, Number(chapter));
  if (!ch) return { title: "Chapter Not Found" };
  const title = `Chapter ${ch.chapter_number}: ${ch.title}`;
  const description = `Read ${title} of ${slug.replace(/-/g, " ")} on Suerte Translations.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/read/${slug}/${chapter}`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ReadPage({ params }: ReadPageProps) {
  const { slug, chapter } = await params;
  const chapterNumber = Number(chapter);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [ch, { prev, next }, allChapters] = await Promise.all([
    getChapter(slug, chapterNumber),
    getAdjacentChapters(slug, chapterNumber),
    getChaptersByNovelSlug(slug),
  ]);

  if (!ch) notFound();

  const paragraphs = ch.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chapterList = allChapters.map((c) => ({
    chapter_number: c.chapter_number,
    title: c.title,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Chapter ${ch.chapter_number}: ${ch.title}`,
    name: ch.title,
    url: `${SITE_URL}/read/${slug}/${chapterNumber}`,
    isPartOf: { "@type": "Book", name: slug.replace(/-/g, " "), url: `${SITE_URL}/series/${slug}` },
    wordCount: ch.word_count ?? undefined,
    datePublished: ch.published_at ?? ch.created_at,
    inLanguage: "en",
  };

  return (
    <ReaderWrapper
      novelSlug={slug}
      currentChapter={chapterNumber}
      prevChapter={prev?.chapter_number ?? null}
      nextChapter={next?.chapter_number ?? null}
    >
      <JsonLd data={jsonLd} />
      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#6b7280" }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href={`/series/${slug}`} style={{ color: "inherit", textDecoration: "none" }} className="hover:text-white">
            {slug.replace(/-/g, " ")}
          </Link>
          <span>/</span>
          <span style={{ color: "#e5e7eb" }}>Chapter {chapterNumber}</span>
        </nav>

        {/* Chapter dropdown */}
        <ChapterDropdown
          novelSlug={slug}
          chapters={chapterList}
          currentChapter={chapterNumber}
        />
      </div>

      {/* CHAPTER HEADER */}
      <header style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--accent-light)", marginBottom: "0.5rem" }}>
          Chapter {ch.chapter_number}
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "inherit", margin: 0 }}>
          {ch.title}
        </h1>
        {ch.word_count && (
          <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.5rem" }}>
            {ch.word_count.toLocaleString()} words
          </p>
        )}
      </header>

      {/* NAV TOP */}
      <ChapterNav slug={slug} prev={prev} next={next} />

      {/* CONTENT */}
      <article style={{ margin: "3rem 0" }}>
        {paragraphs.map((para, i) => (
          <p key={i} style={{ marginBottom: "1.25em" }}>
            {para}
          </p>
        ))}
      </article>

      {/* NAV BOTTOM */}
      <ChapterNav slug={slug} prev={prev} next={next} showAllChapters />

      {/* Floating settings button */}
      <ReaderSettings />

      {/* Track reading progress for logged-in users */}
      {user && ch && (
        <ReadingTracker chapterId={ch.id} novelId={ch.novel_id} />
      )}
    </ReaderWrapper>
  );
}

function ChapterNav({
  slug,
  prev,
  next,
  showAllChapters = false,
}: {
  slug: string;
  prev: { chapter_number: number } | null;
  next: { chapter_number: number } | null;
  showAllChapters?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.5rem",
        padding: "1rem 0",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {prev ? (
        <Link
          href={`/read/${slug}/${prev.chapter_number}`}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "10px",
            fontSize: "0.85rem",
            fontWeight: 500,
            background: "rgba(255,255,255,0.06)",
            color: "inherit",
            border: "1px solid rgba(255,255,255,0.1)",
            textDecoration: "none",
          }}
        >
          ← Ch. {prev.chapter_number}
        </Link>
      ) : (
        <div />
      )}

      {showAllChapters && (
        <Link
          href={`/series/${slug}`}
          style={{ fontSize: "0.8rem", color: "#6b7280", textDecoration: "none" }}
        >
          All Chapters
        </Link>
      )}

      {next ? (
        <Link
          href={`/read/${slug}/${next.chapter_number}`}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "10px",
            fontSize: "0.85rem",
            fontWeight: 500,
            background: "var(--accent)",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          Ch. {next.chapter_number} →
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
