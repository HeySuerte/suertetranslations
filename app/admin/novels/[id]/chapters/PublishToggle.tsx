"use client";

import { useTransition } from "react";
import { toggleChapterPublished } from "@/lib/actions/chapters";
import { useRouter } from "next/navigation";

interface Props {
  chapterId: string;
  novelSlug: string;
  isPublished: boolean;
}

export default function PublishToggle({ chapterId, novelSlug, isPublished }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    startTransition(async () => {
      await toggleChapterPublished(chapterId, novelSlug, !isPublished);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
      style={
        isPublished
          ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" }
          : { background: "rgba(107,114,128,0.15)", color: "#9ca3af", border: "1px solid rgba(107,114,128,0.2)" }
      }
    >
      {isPending ? "…" : isPublished ? "Published" : "Draft"}
    </button>
  );
}
