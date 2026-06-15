"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { Profile } from "@/lib/database.types";

// Created once at module level — not inside useEffect or render.
// createBrowserClient is already a singleton keyed by URL+key,
// but calling it here makes the single instance explicit.
const supabase = createClient();

export default function UserButton() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string, userEmail: string | null) {
    setEmail(userEmail);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile((data as Profile) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    // getSession() reads the JWT from the cookie — no network request, no token rotation.
    // Safe to call in a client component without triggering server-side side effects.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setLoading(false);
        return;
      }
      loadProfile(session.user.id, session.user.email ?? null);
    });

    // onAuthStateChange fires when session changes (login, logout, token refresh).
    // We use the `session` argument the event already provides — no additional
    // getUser() call, which would make a second network round-trip and could
    // race with middleware's token rotation cookie writes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setEmail(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        loadProfile(session.user.id, session.user.email ?? null);
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: "var(--surface-2)" }} />;
  }

  if (!email) {
    return (
      <Link
        href="/login"
        className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        Login
      </Link>
    );
  }

  const isStaff = profile?.role === "staff" || profile?.role === "admin";

  return (
    <div className="flex items-center gap-3">
      {isStaff && (
        <Link
          href="/admin"
          className="text-xs px-2.5 py-1 rounded-lg font-semibold"
          style={{ background: "rgba(124,58,237,0.2)", color: "var(--accent-light)", border: "1px solid rgba(124,58,237,0.3)" }}
        >
          Admin
        </Link>
      )}
      <Link href="/profile" className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: "var(--surface-2)" }}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
          ) : (
            <span className="text-xs font-bold" style={{ color: "var(--accent-light)" }}>
              {(profile?.username?.[0] ?? email[0]).toUpperCase()}
            </span>
          )}
        </div>
        <span className="hidden sm:block text-sm text-gray-300">
          {profile?.username ?? email}
        </span>
      </Link>
      <button
        onClick={logout}
        className="text-xs text-gray-500 hover:text-white transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
