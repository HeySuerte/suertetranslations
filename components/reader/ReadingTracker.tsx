"use client";

import { useEffect } from "react";
import { trackChapterRead } from "@/lib/actions/engagement";

interface ReadingTrackerProps {
  chapterId: string;
  novelId: string;
  chapterNumber: number;
}

export default function ReadingTracker({ chapterId, novelId, chapterNumber }: ReadingTrackerProps) {
  useEffect(() => {
    trackChapterRead(chapterId, novelId, chapterNumber).catch(() => {
      // silently ignore — user may not be logged in
    });
  }, [chapterId, novelId, chapterNumber]);

  return null;
}
