"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserButton from "@/components/auth/UserButton";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/search", label: "Search" },
  { href: "/library", label: "Library" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 glass border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-wide text-white">
          SUERTE<span style={{ color: "var(--accent-light)" }}>TL</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition-colors ${
                pathname === href
                  ? "text-white font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <UserButton />
      </div>
    </nav>
  );
}
