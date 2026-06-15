"use client";

import { useState, useTransition } from "react";
import type { Chapter } from "@/lib/database.types";

interface Props {
  chapter: Chapter;
  updateAction: (formData: FormData) => Promise<void>;
}

export default function ChapterEditClient({ chapter, updateAction }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateAction(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      <div
        className="p-6 rounded-2xl flex flex-col gap-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Title</label>
          <input
            name="title"
            defaultValue={chapter.title}
            required
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Content</label>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              {chapter.word_count?.toLocaleString() ?? 0} words (saved)
            </span>
          </div>
          <textarea
            name="content"
            rows={24}
            defaultValue={chapter.content}
            className="px-4 py-3 rounded-xl text-sm font-mono outline-none resize-y"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              lineHeight: 1.7,
            }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {isPending ? "Saving…" : saved ? "Saved ✓" : "Save Chapter"}
        </button>
      </div>
    </form>
  );
}
