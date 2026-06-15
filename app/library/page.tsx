import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserLibrary } from "@/lib/data/engagement";
import type { BookmarkStatus } from "@/lib/data/engagement";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Library",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<BookmarkStatus, string> = {
  reading: "Reading",
  plan_to_read: "Plan to Read",
  completed: "Completed",
  on_hold: "On Hold",
  dropped: "Dropped",
};

const STATUS_ORDER: BookmarkStatus[] = ["reading", "plan_to_read", "completed", "on_hold", "dropped"];

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const library = await getUserLibrary(user.id);

  const grouped = STATUS_ORDER.reduce<Record<BookmarkStatus, typeof library>>(
    (acc, s) => {
      acc[s] = library.filter((b) => b.status === s);
      return acc;
    },
    {} as Record<BookmarkStatus, typeof library>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-black text-white mb-2">My Library</h1>
      <p className="text-sm mb-10" style={{ color: "var(--muted)" }}>
        {library.length} title{library.length !== 1 ? "s" : ""} tracked
      </p>

      {library.length === 0 && (
        <div
          className="p-12 rounded-2xl text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-lg font-semibold text-white mb-2">Your library is empty</p>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            Visit a series page and add it to your library.
          </p>
          <Link
            href="/browse"
            className="px-6 py-2.5 rounded-xl font-semibold text-sm"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Browse Series
          </Link>
        </div>
      )}

      {STATUS_ORDER.map((status) => {
        const items = grouped[status];
        if (items.length === 0) return null;
        return (
          <section key={status} className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              {STATUS_LABELS[status]}
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--surface-2)", color: "var(--muted)" }}
              >
                {items.length}
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((b) => {
                const novel = b.novels;
                if (!novel) return null;
                return (
                  <Link
                    key={b.id}
                    href={`/series/${novel.slug}`}
                    className="group flex flex-col gap-2"
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="aspect-[3/4] rounded-xl overflow-hidden"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                    >
                      {novel.cover_url ? (
                        <img
                          src={novel.cover_url}
                          alt={novel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          📖
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {novel.title}
                      </p>
                      {b.last_read_chapter && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                          Ch. {b.last_read_chapter}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
