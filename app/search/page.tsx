import { searchNovels } from "@/lib/data/novels";
import NovelCard from "@/components/novel/NovelCard";
import SearchBar from "@/components/search/SearchBar";
import type { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  return {
    title: params.q ? `Search: "${params.q}"` : "Search",
    description: "Search for web novel translations on Suerte Translations.",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const results = query ? await searchNovels(query) : [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-black text-white mb-6">Search</h1>

      <div className="mb-10">
        <SearchBar defaultValue={query} />
      </div>

      {query && (
        <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
          {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
          <span className="text-white font-medium">&quot;{query}&quot;</span>
        </p>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {results.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      ) : query ? (
        <p className="text-center py-20" style={{ color: "var(--muted)" }}>
          No novels found for &quot;{query}&quot;
        </p>
      ) : (
        <p className="text-center py-20" style={{ color: "var(--muted)" }}>
          Enter a title to search the library.
        </p>
      )}
    </div>
  );
}
