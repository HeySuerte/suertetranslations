import { getNovelsWithFilters } from "@/lib/data/novels";
import NovelGrid from "@/components/novel/NovelGrid";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Browse",
  description: "Browse all web novel translations. Filter by status and genre.",
};

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "hiatus", label: "Hiatus" },
  { value: "dropped", label: "Dropped" },
];

interface BrowsePageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}


export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const status = params.status ?? "all";
  const page = Number(params.page ?? 1);
  const pageSize = 12;

  const { novels, total } = await getNovelsWithFilters({ status, page, pageSize });
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-black text-white mb-8">Browse Library</h1>

      {/* STATUS FILTERS */}
      <div className="flex flex-wrap gap-2 mb-10">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/browse?status=${opt.value}`}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={
              status === opt.value
                ? { background: "var(--accent)", color: "#fff" }
                : { background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }
            }
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <NovelGrid novels={novels} emptyMessage="No novels match the selected filters." />

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/browse?status=${status}&page=${p}`}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors"
              style={
                p === page
                  ? { background: "var(--accent)", color: "#fff" }
                  : { background: "var(--surface-2)", color: "var(--muted)" }
              }
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
