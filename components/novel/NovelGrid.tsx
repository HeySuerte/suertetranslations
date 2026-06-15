import type { Novel } from "@/lib/database.types";
import NovelCard from "./NovelCard";

interface NovelGridProps {
  novels: Novel[];
  title?: string;
  emptyMessage?: string;
}

export default function NovelGrid({ novels, title, emptyMessage = "No novels found." }: NovelGridProps) {
  return (
    <section>
      {title && (
        <h2 className="text-2xl font-black text-white mb-6">{title}</h2>
      )}
      {novels.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {novels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      )}
    </section>
  );
}
