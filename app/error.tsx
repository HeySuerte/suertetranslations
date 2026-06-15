"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <p className="text-5xl mb-4">⚠️</p>
      <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="mb-8" style={{ color: "var(--muted)" }}>
        {error.message ?? "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-xl font-semibold transition-colors"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        Try again
      </button>
    </div>
  );
}
