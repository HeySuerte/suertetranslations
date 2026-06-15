import Link from "next/link";
import type { Chapter } from "@/lib/database.types";

interface ChapterListProps {
  novelSlug: string;
  chapters: Chapter[];
}

export default function ChapterList({ novelSlug, chapters }: ChapterListProps) {
  if (chapters.length === 0) {
    return (
      <p className="text-center py-10" style={{ color: "var(--muted)" }}>
        No chapters published yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {chapters.map((ch) => (
        <Link
          key={ch.id}
          href={`/read/${novelSlug}/${ch.chapter_number}`}
          className="flex items-center justify-between p-4 rounded-xl transition-colors group"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-4">
            <span
              className="text-xs font-mono w-10 text-center py-1 rounded"
              style={{ background: "var(--surface-2)", color: "var(--accent-light)" }}
            >
              {ch.chapter_number}
            </span>
            <span className="text-sm text-white group-hover:text-purple-300 transition-colors">
              {ch.title}
            </span>
          </div>
          {ch.word_count && (
            <span className="text-xs hidden sm:block" style={{ color: "var(--muted)" }}>
              {ch.word_count.toLocaleString()} words
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
