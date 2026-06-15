"use client";

import { useEffect } from "react";
import { trackChapterRead } from "@/lib/actions/engagement";

interface ReadingTrackerProps {
  chapterId: string;
  novelId: string;
}

export default function ReadingTracker({ chapterId, novelId }: ReadingTrackerProps) {
  useEffect(() => {
    trackChapterRead(chapterId, novelId).catch(() => {
      // silently ignore — user may not be logged in
    });
  }, [chapterId, novelId]);

  return null;
}
