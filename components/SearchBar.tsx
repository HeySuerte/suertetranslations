"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-2xl mx-auto mt-10"
    >
      <input
        type="text"
        placeholder="Search novels..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500"
      />
    </form>
  );
}