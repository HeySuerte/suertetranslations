"use client";

import { useState, useTransition } from "react";
import { rateNovel } from "@/lib/actions/engagement";

interface RatingWidgetProps {
  novelId: string;
  novelSlug: string;
  initialScore: number | null;
  avgRating: number;
  ratingCount: number;
}

export default function RatingWidget({
  novelId,
  novelSlug,
  initialScore,
  avgRating,
  ratingCount,
}: RatingWidgetProps) {
  const [hover, setHover] = useState(0);
  const [score, setScore] = useState(initialScore ?? 0);
  const [isPending, startTransition] = useTransition();

  function handleRate(s: number) {
    setScore(s);
    startTransition(async () => {
      await rateNovel(novelId, novelSlug, s);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {/* Aggregate display */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span style={{ color: "#fbbf24", fontSize: "1rem" }}>★</span>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>
          {ratingCount > 0 ? avgRating.toFixed(1) : "—"}
        </span>
        {ratingCount > 0 && (
          <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
            ({ratingCount.toLocaleString()})
          </span>
        )}
      </div>

      {/* User rating stars */}
      <div
        style={{ display: "flex", gap: "0.2rem", cursor: isPending ? "wait" : "pointer" }}
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            disabled={isPending}
            onClick={() => handleRate(s)}
            onMouseEnter={() => setHover(s)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 1px",
              fontSize: "1.1rem",
              color: s <= (hover || score) ? "#fbbf24" : "#374151",
              transition: "color 0.1s",
              lineHeight: 1,
            }}
          >
            ★
          </button>
        ))}
      </div>

      <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
        {score > 0 ? `Your rating: ${score}/5` : "Rate this novel"}
      </span>
    </div>
  );
}
