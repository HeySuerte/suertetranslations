"use client";

import { useState, useTransition } from "react";
import { addComment, deleteComment } from "@/lib/actions/engagement";
import type { Comment } from "@/lib/data/engagement";

interface CommentSectionProps {
  novelId: string;
  novelSlug: string;
  initialComments: Comment[];
  currentUserId: string | null;
}

export default function CommentSection({
  novelId,
  novelSlug,
  initialComments,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);

    const optimistic: Comment = {
      id: crypto.randomUUID(),
      user_id: currentUserId ?? "",
      novel_id: novelId,
      chapter_id: null,
      body: body.trim(),
      created_at: new Date().toISOString(),
      profiles: null,
    };

    setComments((prev) => [optimistic, ...prev]);
    setBody("");

    startTransition(async () => {
      try {
        await addComment(novelId, novelSlug, body.trim());
      } catch (err) {
        setError((err as Error).message);
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      }
    });
  }

  function handleDelete(commentId: string) {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    startTransition(async () => {
      await deleteComment(commentId, novelSlug);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>
        Comments ({comments.length})
      </h3>

      {/* Form */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Share your thoughts…"
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--foreground)",
              fontSize: "0.875rem",
              resize: "vertical",
              outline: "none",
            }}
          />
          {error && (
            <p style={{ color: "#f87171", fontSize: "0.8rem" }}>{error}</p>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={isPending || !body.trim()}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "10px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                opacity: isPending || !body.trim() ? 0.5 : 1,
              }}
            >
              {isPending ? "Posting…" : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
          <a href="/login" style={{ color: "var(--accent-light)" }}>Log in</a> to leave a comment.
        </p>
      )}

      {/* List */}
      {comments.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", textAlign: "center", padding: "2rem 0" }}>
          No comments yet. Be the first!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {comments.map((c) => (
            <div
              key={c.id}
              style={{
                padding: "1rem",
                borderRadius: "12px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "var(--surface-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "var(--accent-light)",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {c.profiles?.avatar_url ? (
                      <img src={c.profiles.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    ) : (
                      (c.profiles?.username?.[0] ?? "?").toUpperCase()
                    )}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: "0.8rem", color: "#e5e7eb" }}>
                    {c.profiles?.username ?? "Anonymous"}
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                {currentUserId === c.user_id && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted)",
                      fontSize: "0.75rem",
                      padding: "0.2rem 0.4rem",
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
              <p style={{ color: "#d1d5db", fontSize: "0.875rem", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
