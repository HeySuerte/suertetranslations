"use client";

import { useState } from "react";
import { parseChapters, type ParsedChapter } from "@/lib/import/parser";

export default function ImportPage() {
  const [novelSlug, setNovelSlug] = useState("");
  const [novelId, setNovelId] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<ParsedChapter[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [publish, setPublish] = useState(true);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ inserted: number; parseWarnings: string[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  function handlePreview() {
    const { chapters, errors } = parseChapters(content);
    setPreview(chapters);
    setParseErrors(errors);
  }

  async function handleImport() {
    setStatus("uploading");
    setErrorMsg("");
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novel_slug: novelSlug, novel_id: novelId, content, publish }),
    });

    const json = await res.json();
    if (!res.ok) {
      setStatus("error");
      setErrorMsg(json.error ?? "Upload failed");
      return;
    }
    setResult(json);
    setStatus("done");
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-8">Bulk Chapter Import</h1>

      <div
        className="p-8 rounded-2xl flex flex-col gap-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* NOVEL IDENTIFIERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Novel Slug</label>
            <input
              className="px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              placeholder="e.g. shadow-monarch"
              value={novelSlug}
              onChange={(e) => setNovelSlug(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Novel ID (UUID)</label>
            <input
              className="px-4 py-2.5 rounded-xl text-sm outline-none font-mono"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={novelId}
              onChange={(e) => setNovelId(e.target.value)}
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            Content (markdown or plain text)
          </label>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Each chapter must start with a heading like: <code className="font-mono">Chapter 1: Chapter Title</code>
          </p>
          <textarea
            rows={14}
            className="px-4 py-3 rounded-xl text-sm font-mono outline-none resize-y"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            placeholder={"Chapter 1: The Beginning\n\nContent here...\n\nChapter 2: The Awakening\n\nContent here..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* FILE UPLOAD */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Or upload a .txt / .md file</label>
          <input
            type="file"
            accept=".txt,.md"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => setContent((ev.target?.result as string) ?? "");
              reader.readAsText(file);
            }}
          />
        </div>

        {/* OPTIONS */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-white">Publish immediately (uncheck to save as drafts)</span>
        </label>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            disabled={!content.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            Preview Parse
          </button>
          <button
            onClick={handleImport}
            disabled={!content.trim() || !novelSlug || !novelId || status === "uploading"}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-40"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {status === "uploading" ? "Importing…" : "Import Chapters"}
          </button>
        </div>

        {/* PARSE ERRORS */}
        {parseErrors.length > 0 && (
          <div className="p-4 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
            {parseErrors.map((e, i) => <p key={i}>{e}</p>)}
          </div>
        )}

        {/* PREVIEW */}
        {preview && (
          <div>
            <p className="font-semibold text-white mb-3">{preview.length} chapters detected:</p>
            <div className="space-y-2">
              {preview.map((ch) => (
                <div
                  key={ch.chapter_number}
                  className="flex items-center justify-between px-4 py-2 rounded-lg text-sm"
                  style={{ background: "var(--surface-2)" }}
                >
                  <span className="text-white">Ch. {ch.chapter_number}: {ch.title}</span>
                  <span style={{ color: "var(--muted)" }}>{ch.word_count.toLocaleString()} words</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULT */}
        {status === "done" && result && (
          <div className="p-4 rounded-xl text-sm" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80" }}>
            ✓ Imported {result.inserted} chapter{result.inserted !== 1 ? "s" : ""} successfully.
            {result.parseWarnings.length > 0 && (
              <p className="mt-1" style={{ color: "#fbbf24" }}>Warnings: {result.parseWarnings.join("; ")}</p>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="p-4 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
