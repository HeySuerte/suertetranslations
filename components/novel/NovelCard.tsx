import Link from "next/link";
import Image from "next/image";
import type { Novel } from "@/lib/database.types";

interface NovelCardProps {
  novel: Novel;
}

export default function NovelCard({ novel }: NovelCardProps) {
  const statusColors: Record<string, string> = {
    ongoing: "#22c55e",
    completed: "#3b82f6",
    hiatus: "#f59e0b",
    dropped: "#ef4444",
  };

  return (
    <Link
      href={`/series/${novel.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
      style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
    >
      <div className="aspect-[3/4] overflow-hidden relative" style={{ background: "var(--surface-2)" }}>
        {novel.cover_url ? (
          <Image
            src={novel.cover_url}
            alt={novel.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
            <span className="text-4xl text-gray-600">📖</span>
          </div>
        )}
        <div
          className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: statusColors[novel.status] ?? "#6b7280", color: "#fff" }}
        >
          {novel.status}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-1">
        <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">{novel.title}</h3>
        {novel.translator && (
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            by {novel.translator}
          </p>
        )}
        {novel.views > 0 && (
          <p className="text-xs mt-1" style={{ color: "var(--accent-light)" }}>
            {novel.views.toLocaleString()} views
          </p>
        )}
      </div>
    </Link>
  );
}
