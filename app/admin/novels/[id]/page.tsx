import { notFound } from "next/navigation";
import Link from "next/link";
import { getNovelById, getAllGenres, getNovelGenreIds } from "@/lib/data/admin";
import { updateNovel } from "@/lib/actions/novels";
import NovelEditClient from "./NovelEditClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const novel = await getNovelById(id);
  return { title: novel ? `Edit — ${novel.title}` : "Not Found" };
}

export default async function EditNovelPage({ params }: Props) {
  const { id } = await params;

  const [novel, genres, assignedGenreIds] = await Promise.all([
    getNovelById(id),
    getAllGenres(),
    getNovelGenreIds(id),
  ]);

  if (!novel) notFound();

  const updateAction = updateNovel.bind(null, id);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/novels"
          className="text-sm transition-colors"
          style={{ color: "var(--muted)" }}
        >
          ← Novels
        </Link>
        <h1 className="text-3xl font-black text-white">{novel.title}</h1>
      </div>

      <div className="flex gap-3 mb-8">
        <Link
          href={`/admin/novels/${id}/chapters`}
          className="px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
        >
          Manage Chapters →
        </Link>
        {novel.slug && (
          <Link
            href={`/series/${novel.slug}`}
            target="_blank"
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            View Series ↗
          </Link>
        )}
      </div>

      <NovelEditClient
        novel={novel}
        genres={genres}
        assignedGenreIds={assignedGenreIds}
        updateAction={updateAction}
      />
    </div>
  );
}
