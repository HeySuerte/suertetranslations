import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="border-t mt-20 py-10 text-sm"
      style={{ borderColor: "var(--border)", color: "var(--muted)" }}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Suerte Translations. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/browse" className="hover:text-white transition-colors">Browse</Link>
          <Link href="/search" className="hover:text-white transition-colors">Search</Link>
          <Link href="/login" className="hover:text-white transition-colors">Login</Link>
        </div>
      </div>
    </footer>
  );
}
