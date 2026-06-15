"use client";

import { useRouter } from "next/navigation";

interface ChapterOption {
  chapter_number: number;
  title: string;
}

interface ChapterDropdownProps {
  novelSlug: string;
  chapters: ChapterOption[];
  currentChapter: number;
}

export default function ChapterDropdown({
  novelSlug,
  chapters,
  currentChapter,
}: ChapterDropdownProps) {
  const router = useRouter();

  if (chapters.length === 0) return null;

  return (
    <select
      value={currentChapter}
      onChange={(e) => router.push(`/read/${novelSlug}/${e.target.value}`)}
      style={{
        padding: "0.4rem 0.75rem",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(19,19,26,0.9)",
        color: "#d1d5db",
        fontSize: "0.8rem",
        cursor: "pointer",
        maxWidth: "200px",
      }}
    >
      {chapters.map((ch) => (
        <option key={ch.chapter_number} value={ch.chapter_number}>
          Ch. {ch.chapter_number}: {ch.title}
        </option>
      ))}
    </select>
  );
}
