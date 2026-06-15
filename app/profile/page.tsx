"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/database.types";

interface LibraryStats {
  reading: number;
  completed: number;
  total: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [libraryStats, setLibraryStats] = useState<LibraryStats | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email ?? null);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setUsername(data.username ?? "");
        setBio(data.bio ?? "");
        setAvatarUrl(data.avatar_url ?? "");
      }

      // Library stats
      const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("status")
        .eq("user_id", user.id);

      if (bookmarks) {
        setLibraryStats({
          reading: bookmarks.filter((b: { status: string }) => b.status === "reading").length,
          completed: bookmarks.filter((b: { status: string }) => b.status === "completed").length,
          total: bookmarks.length,
        });
      }
    })();
  }, []);

  async function uploadAvatar(file: File) {
    if (!userId) return;
    const supabase = createClient();
    const fileName = `${userId}-${Date.now()}`;
    const { error } = await supabase.storage.from("avatars").upload(fileName, file);
    if (error) { alert(error.message); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    setAvatarUrl(data.publicUrl);
  }

  async function saveProfile() {
    if (!userId) return;
    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ username, bio, avatar_url: avatarUrl })
      .eq("id", userId);
    setStatus(error ? "error" : "saved");
    setTimeout(() => setStatus("idle"), 3000);
  }

  if (!userId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ color: "var(--muted)" }}>
        You must be logged in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-white mb-8">Your Profile</h1>

      <div
        className="p-8 rounded-2xl flex flex-col gap-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* AVATAR */}
        <div className="flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              <span className="text-2xl font-black" style={{ color: "var(--accent-light)" }}>
                {(username[0] ?? email?.[0] ?? "?").toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-white">{username || email}</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>{email}</p>
            {profile?.role && (
              <span
                className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                style={{ background: "rgba(124,58,237,0.2)", color: "var(--accent-light)" }}
              >
                {profile.role}
              </span>
            )}
          </div>
        </div>

        {/* USERNAME */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Username</label>
          <input
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
          />
        </div>

        {/* BIO */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Bio</label>
          <textarea
            rows={3}
            className="px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself…"
          />
        </div>

        {/* AVATAR UPLOAD */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Avatar</label>
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]); }}
          />
        </div>

        {/* SAVE */}
        <button
          onClick={saveProfile}
          disabled={status === "saving"}
          className="py-3 rounded-xl font-bold transition-colors disabled:opacity-60"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : status === "error" ? "Error — try again" : "Save Profile"}
        </button>
      </div>

      {/* LIBRARY STATS */}
      {libraryStats && (
        <div className="mt-6 p-6 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Library</h2>
            <a href="/library" className="text-sm" style={{ color: "var(--accent-light)" }}>View all →</a>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Total", value: libraryStats.total },
              { label: "Reading", value: libraryStats.reading },
              { label: "Completed", value: libraryStats.completed },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-2xl font-black text-white">{value}</span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
