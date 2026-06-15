import { notFound } from "next/navigation";
import Link from "next/link";
import { getChapterById, getNovelById } from "@/lib/data/admin";
import { updateChapter } from "@/lib/actions/chapters";
import ChapterEditClient from "./ChapterEditClient";

interface Props {
  params: Promise<{ id: string; chapterId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { chapterId } = await params;
  const ch = await getChapterById(chapterId);
  return { title: ch ? `Edit Chapter ${ch.chapter_number}` : "Not Found" };
}

export default async function EditChapterPage({ params }: Props) {
  const { id, chapterId } = await params;
  const [chapter, novel] = await Promise.all([
    getChapterById(chapterId),
    getNovelById(id),
  ]);

  if (!chapter || !novel) notFound();

  const updateAction = updateChapter.bind(null, chapterId, novel.slug);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/novels/${id}/chapters`} className="text-sm" style={{ color: "var(--muted)" }}>
          ← Chapters
        </Link>
        <h1 className="text-2xl font-black text-white">
          Chapter {chapter.chapter_number}: {chapter.title}
        </h1>
      </div>

      <ChapterEditClient chapter={chapter} updateAction={updateAction} />
    </div>
  );
}
