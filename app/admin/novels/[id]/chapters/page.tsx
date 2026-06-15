import { notFound } from "next/navigation";
import Link from "next/link";
import { getNovelById, getAllChaptersForNovel } from "@/lib/data/admin";
import PublishToggle from "./PublishToggle";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const novel = await getNovelById(id);
  return { title: novel ? `Chapters — ${novel.title}` : "Not Found" };
}

export default async function AdminChaptersPage({ params }: Props) {
  const { id } = await params;
  const novel = await getNovelById(id);
  if (!novel) notFound();

  const chapters = await getAllChaptersForNovel(novel.slug);

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/novels/${id}`} className="text-sm" style={{ color: "var(--muted)" }}>
          ← {novel.title}
        </Link>
        <h1 className="text-3xl font-black text-white">Chapters</h1>
      </div>

      <div className="flex gap-3 mb-6">
        <Link
          href={`/admin/import`}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          + Bulk Import
        </Link>
      </div>

      {chapters.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-white font-semibold mb-2">No chapters yet</p>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Use Bulk Import to add chapters.</p>
          <Link
            href="/admin/import"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Go to Bulk Import
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {chapters.map((ch) => (
            <div
              key={ch.id}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-4">
                <span
                  className="text-xs font-mono w-10 text-center py-1 rounded shrink-0"
                  style={{ background: "var(--surface-2)", color: "var(--accent-light)" }}
                >
                  {ch.chapter_number}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{ch.title}</p>
                  {ch.word_count && (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {ch.word_count.toLocaleString()} words
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <PublishToggle
                  chapterId={ch.id}
                  novelSlug={novel.slug}
                  isPublished={ch.is_published}
                />
                <Link
                  href={`/admin/novels/${id}/chapters/${ch.id}`}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: "var(--surface-2)", color: "var(--foreground)" }}
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
