"use client";

import { useEffect, useState } from "react";
import ReadingTracker from "./ReadingTracker";
import ChapterComments from "./ChapterComments";

interface ChapterPayload {
  id: string;
  novel_id: string;
  chapter_number: number;
  keys: string[];
  map: number[];
  [bucket: string]: unknown;
}

interface ChapterContentProps {
  slug: string;
  chapter: number;
  token: string;
  currentUserId: string | null;
}

export default function ChapterContent({ slug, chapter, token, currentUserId }: ChapterContentProps) {
  const [paragraphs, setParagraphs] = useState<string[] | null>(null);
  const [meta, setMeta] = useState<{ id: string; novelId: string; chapterNumber: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `/api/chapter?slug=${encodeURIComponent(slug)}&chapter=${chapter}&token=${encodeURIComponent(token)}`;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<ChapterPayload>;
      })
      .then((data) => {
        const pointers = new Array(data.keys.length).fill(0);
        const reconstructed = data.map.map((idx: number) => {
          const key = data.keys[idx];
          const bucket = data[key] as string[];
          const para = bucket[pointers[idx]];
          pointers[idx]++;
          return para;
        });
        setParagraphs(reconstructed);
        setMeta({ id: data.id, novelId: data.novel_id, chapterNumber: data.chapter_number });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load chapter");
      });
  }, [slug, chapter, token]);

  if (error) {
    return (
      <div style={{ padding: "3rem 0", textAlign: "center", color: "#ef4444" }}>
        <p>Could not load chapter content.</p>
        <p style={{ fontSize: "0.8rem", marginTop: "0.5rem", color: "#6b7280" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "1rem",
            padding: "0.4rem 1rem",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#d1d5db",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!paragraphs) {
    return (
      <div style={{ padding: "3rem 0", textAlign: "center", color: "#6b7280" }}>
        <p>Loading chapter…</p>
      </div>
    );
  }

  return (
    <>
      <article style={{ margin: "3rem 0" }}>
        {paragraphs.map((para, i) => (
          <p key={i} style={{ marginBottom: "1.25em" }}>
            {para}
          </p>
        ))}
      </article>

      {meta && (
        <>
          <ReadingTracker
            chapterId={meta.id}
            novelId={meta.novelId}
            chapterNumber={meta.chapterNumber}
          />
          <ChapterComments
            novelId={meta.novelId}
            novelSlug={slug}
            chapterId={meta.id}
            chapterNumber={meta.chapterNumber}
            currentUserId={currentUserId}
          />
        </>
      )}
    </>
  );
}
