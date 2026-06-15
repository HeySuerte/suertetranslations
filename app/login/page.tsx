"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      setError("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div
        className="w-full max-w-md p-8 rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h1 className="text-3xl font-black text-white mb-8">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />

          {error && (
            <p className="text-sm px-4 py-2 rounded-lg"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold transition-colors disabled:opacity-60"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {loading ? "Loading…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: "var(--muted)" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
            className="underline transition-colors hover:text-white"
          >
            {mode === "login" ? "Register" : "Login"}
          </button>
        </p>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm transition-colors" style={{ color: "var(--muted)" }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
