"use client";

import { useEffect, useState } from "react";
import { fetchChapterComments } from "@/lib/actions/engagement";
import type { Comment } from "@/lib/data/engagement";
import CommentSection from "@/components/novel/CommentSection";

interface ChapterCommentsProps {
  novelId: string;
  novelSlug: string;
  chapterId: string;
  chapterNumber: number;
  currentUserId: string | null;
}

export default function ChapterComments({
  novelId,
  novelSlug,
  chapterId,
  chapterNumber,
  currentUserId,
}: ChapterCommentsProps) {
  const [comments, setComments] = useState<Comment[] | null>(null);

  useEffect(() => {
    fetchChapterComments(chapterId)
      .then(setComments)
      .catch(() => setComments([]));
  }, [chapterId]);

  if (comments === null) return null;

  return (
    <div
      style={{
        marginTop: "3rem",
        padding: "1.5rem",
        borderRadius: "16px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <CommentSection
        novelId={novelId}
        novelSlug={novelSlug}
        initialComments={comments}
        currentUserId={currentUserId}
        chapterId={chapterId}
        chapterNumber={chapterNumber}
      />
    </div>
  );
}
