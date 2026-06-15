import Link from "next/link";
import { getAllNovels } from "@/lib/data/admin";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const novels = await getAllNovels();
  const published = novels.filter((n) => n.is_published).length;
  const drafts = novels.length - published;

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-8">Admin Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <Stat label="Total Novels" value={novels.length} />
        <Stat label="Published" value={published} accent />
        <Stat label="Drafts" value={drafts} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminCard
          href="/admin/novels"
          icon="📚"
          title="Novels"
          description="Create, edit, and manage novels. Upload covers, assign genres, publish or unpublish."
        />
        <AdminCard
          href="/admin/import"
          icon="📥"
          title="Bulk Import"
          description="Upload a multi-chapter markdown or text file to import chapters in bulk."
        />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className="p-5 rounded-2xl"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <p className="text-3xl font-black" style={{ color: accent ? "var(--accent-light)" : "#fff" }}>
        {value}
      </p>
      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{label}</p>
    </div>
  );
}

function AdminCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="p-6 rounded-2xl transition-colors block"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h2 className="font-bold text-white text-lg mb-1">{title}</h2>
      <p className="text-sm" style={{ color: "var(--muted)" }}>{description}</p>
    </Link>
  );
}
