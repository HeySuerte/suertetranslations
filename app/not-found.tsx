import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <p className="text-7xl font-black mb-4" style={{ color: "var(--accent-light)" }}>404</p>
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="mb-8" style={{ color: "var(--muted)" }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-xl font-semibold transition-colors"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        Back to Home
      </Link>
    </div>
  );
}
