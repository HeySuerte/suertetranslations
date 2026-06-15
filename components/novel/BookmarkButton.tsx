"use client";

import { useState, useTransition } from "react";
import { upsertBookmark, removeBookmark } from "@/lib/actions/engagement";
import type { BookmarkStatus } from "@/lib/data/engagement";

const STATUS_LABELS: Record<BookmarkStatus, string> = {
  reading: "Reading",
  completed: "Completed",
  plan_to_read: "Plan to Read",
  dropped: "Dropped",
  on_hold: "On Hold",
};

interface BookmarkButtonProps {
  novelId: string;
  novelSlug: string;
  initialStatus: BookmarkStatus | null;
}

export default function BookmarkButton({
  novelId,
  novelSlug,
  initialStatus,
}: BookmarkButtonProps) {
  const [status, setStatus] = useState<BookmarkStatus | null>(initialStatus);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function select(s: BookmarkStatus) {
    setStatus(s);
    setOpen(false);
    startTransition(async () => {
      await upsertBookmark(novelId, novelSlug, s);
    });
  }

  function remove() {
    setStatus(null);
    setOpen(false);
    startTransition(async () => {
      await removeBookmark(novelId, novelSlug);
    });
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        style={{
          padding: "0.5rem 1.25rem",
          borderRadius: "10px",
          fontSize: "0.875rem",
          fontWeight: 600,
          cursor: "pointer",
          border: "1px solid var(--border)",
          background: status ? "rgba(124,58,237,0.15)" : "var(--surface-2)",
          color: status ? "var(--accent-light)" : "var(--muted)",
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {status ? `★ ${STATUS_LABELS[status]}` : "+ Add to Library"}
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 50 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              left: 0,
              zIndex: 51,
              background: "#13131a",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              padding: "0.5rem",
              minWidth: "160px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {(Object.entries(STATUS_LABELS) as [BookmarkStatus, string][]).map(([s, label]) => (
              <button
                key={s}
                onClick={() => select(s)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  border: "none",
                  background: status === s ? "rgba(124,58,237,0.2)" : "transparent",
                  color: status === s ? "var(--accent-light)" : "#d1d5db",
                }}
              >
                {status === s ? "✓ " : ""}{label}
              </button>
            ))}
            {status && (
              <button
                onClick={remove}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  marginTop: "0.25rem",
                  paddingTop: "0.75rem",
                  background: "transparent",
                  color: "#ef4444",
                }}
              >
                Remove from Library
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
