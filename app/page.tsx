import Link from "next/link";
import NovelGrid from "@/components/novel/NovelGrid";
import SearchBar from "@/components/search/SearchBar";
import { getTrendingNovels, getLatestNovels } from "@/lib/data/novels";

export const revalidate = 1800;

export default async function HomePage() {
  const [trending, latest] = await Promise.all([
    getTrendingNovels(6),
    getLatestNovels(12),
  ]);

  const featured = trending[0] ?? null;

  return (
    <div>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #0b0b0f 0%, #1a0a2e 50%, #0b0b0f 100%)`,
          minHeight: "500px",
        }}
      >
        {featured?.cover_url && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${featured.cover_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(40px)",
            }}
          />
        )}

        <div className="relative max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-6">
          <div
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: "rgba(124,58,237,0.2)", color: "var(--accent-light)", border: "1px solid rgba(124,58,237,0.4)" }}
          >
            Web Novel Translations
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-none">
            Suerte<br />
            <span style={{ color: "var(--accent-light)" }}>Translations</span>
          </h1>

          <p className="text-lg max-w-lg" style={{ color: "var(--muted)" }}>
            Premium quality web novel translations. Catch up on the latest chapters — updated regularly.
          </p>

          <SearchBar placeholder="Search novels..." />

          <div className="flex gap-4 mt-2">
            <Link
              href="/browse"
              className="px-6 py-3 rounded-xl font-semibold transition-colors"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Browse Library
            </Link>
            {featured && (
              <Link
                href={`/series/${featured.slug}`}
                className="px-6 py-3 rounded-xl font-semibold transition-colors"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              >
                Featured: {featured.title}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <NovelGrid novels={trending} title="🔥 Trending" emptyMessage="No novels yet — check back soon!" />
      </section>

      {/* LATEST UPDATES */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <NovelGrid novels={latest} title="🕐 Latest Updates" emptyMessage="No novels yet — check back soon!" />
      </section>
    </div>
  );
}
