"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateNovelGenres, createGenre } from "@/lib/actions/novels";
import type { Genre, Novel } from "@/lib/database.types";

interface Props {
  novel: Novel;
  genres: Genre[];
  assignedGenreIds: string[];
  updateAction: (formData: FormData) => Promise<void>;
}

export default function NovelEditClient({ novel, genres, assignedGenreIds, updateAction }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedGenres, setSelectedGenres] = useState<string[]>(assignedGenreIds);
  const [coverUrl, setCoverUrl] = useState(novel.cover_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");
  const [genreList, setGenreList] = useState<Genre[]>(genres);
  const [saved, setSaved] = useState(false);

  async function processImage(file: File): Promise<Blob> {
    const MAX_W = 800;
    const MAX_H = 1200;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        let { width, height } = img;
        if (width > MAX_W || height > MAX_H) {
          const ratio = Math.min(MAX_W / width, MAX_H / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas toBlob failed"));
          },
          "image/webp",
          0.85
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image"));
      };

      img.src = objectUrl;
    });
  }

  async function handleUploadCover(file: File) {
    setUploading(true);
    try {
      const webpBlob = await processImage(file);
      const fileName = `${crypto.randomUUID()}.webp`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("covers").upload(fileName, webpBlob, {
        contentType: "image/webp",
        upsert: true,
      });
      if (error) { alert(error.message); return; }
      const { data } = supabase.storage.from("covers").getPublicUrl(fileName);
      setCoverUrl(data.publicUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function toggleGenre(id: string) {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  async function handleSaveGenres() {
    startTransition(async () => {
      await updateNovelGenres(novel.id, selectedGenres);
    });
  }

  async function handleAddGenre(e: React.FormEvent) {
    e.preventDefault();
    if (!newGenreName.trim()) return;
    const fd = new FormData();
    fd.set("name", newGenreName.trim());
    await createGenre(fd);
    // Optimistically add to list
    const slug = newGenreName.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-");
    setGenreList((prev) => [...prev, { id: Date.now().toString(), name: newGenreName, slug }]);
    setNewGenreName("");
  }

  async function handleSubmit(formData: FormData) {
    formData.set("cover_url", coverUrl);
    await updateAction(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      {/* Cover */}
      <div
        className="p-6 rounded-2xl flex flex-col gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="font-bold text-white">Cover Image</h2>
        <div className="flex items-start gap-4">
          <div
            className="w-24 h-32 rounded-xl overflow-hidden shrink-0"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            {coverUrl ? (
              <img src={coverUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">📖</div>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => { if (e.target.files?.[0]) handleUploadCover(e.target.files[0]); }}
              className="text-sm"
            />
            {uploading && <p className="text-xs" style={{ color: "var(--muted)" }}>Uploading…</p>}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Or paste URL</label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://…"
                className="px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div
        className="p-6 rounded-2xl flex flex-col gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="font-bold text-white">Metadata</h2>
        <Field label="Title *" name="title" defaultValue={novel.title} required />
        <Field label="Slug *" name="slug" defaultValue={novel.slug} required />
        <Field label="Original Title" name="original_title" defaultValue={novel.original_title ?? ""} />
        <Field label="Author" name="author" defaultValue={novel.author ?? ""} />
        <Field label="Translator" name="translator" defaultValue={novel.translator ?? ""} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Status</label>
          <select
            name="status"
            defaultValue={novel.status}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="hiatus">Hiatus</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Description</label>
          <textarea
            name="description"
            rows={5}
            defaultValue={novel.description ?? ""}
            className="px-4 py-3 rounded-xl text-sm outline-none resize-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
        </div>
      </div>

      {/* Publish toggle */}
      <div
        className="p-6 rounded-2xl flex items-center justify-between"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div>
          <p className="font-semibold text-white">Visibility</p>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {novel.is_published ? "Novel is publicly visible" : "Novel is a draft (hidden)"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            name="is_published"
            value="false"
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            Save Draft
          </button>
          <button
            type="submit"
            name="is_published"
            value="true"
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {saved ? "Saved ✓" : isPending ? "Saving…" : "Save & Publish"}
          </button>
        </div>
      </div>

      {/* Genres */}
      <div
        className="p-6 rounded-2xl flex flex-col gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="font-bold text-white">Genres</h2>

        {genreList.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>No genres yet — add one below.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {genreList.map((g) => (
              <button
                type="button"
                key={g.id}
                onClick={() => toggleGenre(g.id)}
                className="px-3 py-1 rounded-full text-sm transition-colors"
                style={
                  selectedGenres.includes(g.id)
                    ? { background: "var(--accent)", color: "#fff" }
                    : { background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }
                }
              >
                {g.name}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleSaveGenres}
          disabled={isPending}
          className="self-start px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
        >
          {isPending ? "Saving…" : "Save Genres"}
        </button>

        <form onSubmit={handleAddGenre} className="flex gap-2 mt-2">
          <input
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            placeholder="New genre name"
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Add Genre
          </button>
        </form>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>{label}</label>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="px-4 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
      />
    </div>
  );
}
