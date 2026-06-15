"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
}

export default function SearchBar({ defaultValue = "", placeholder = "Search novels..." }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
      />
      <button
        type="submit"
        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        Search
      </button>
    </form>
  );
}
