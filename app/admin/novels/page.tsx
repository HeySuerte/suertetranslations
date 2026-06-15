import Link from "next/link";
import { getAllNovels } from "@/lib/data/admin";

export const metadata = { title: "Admin — Novels" };

export default async function AdminNovelsPage() {
  const novels = await getAllNovels();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white">Novels</h1>
        <Link
          href="/admin/novels/new"
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          + New Novel
        </Link>
      </div>

      {novels.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-4xl mb-4">📚</p>
          <p className="text-white font-semibold mb-2">No novels yet</p>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            Create your first novel to get started.
          </p>
          <Link
            href="/admin/novels/new"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Create Novel
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {novels.map((novel) => (
            <div
              key={novel.id}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-4">
                {novel.cover_url && (
                  <img
                    src={novel.cover_url}
                    alt=""
                    className="w-10 h-14 object-cover rounded-lg shrink-0"
                  />
                )}
                <div>
                  <p className="font-semibold text-white">{novel.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {novel.slug} · {novel.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={
                    novel.is_published
                      ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" }
                      : { background: "rgba(107,114,128,0.15)", color: "#9ca3af" }
                  }
                >
                  {novel.is_published ? "Published" : "Draft"}
                </span>
                <Link
                  href={`/admin/novels/${novel.id}`}
                  className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: "var(--surface-2)", color: "var(--foreground)" }}
                >
                  Edit
                </Link>
                <Link
                  href={`/admin/novels/${novel.id}/chapters`}
                  className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: "var(--surface-2)", color: "var(--foreground)" }}
                >
                  Chapters
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
