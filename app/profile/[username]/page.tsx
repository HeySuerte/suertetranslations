import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/data/engagement";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username}'s Profile` };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) notFound();

  const joinDate = new Date(profile.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div
        className="p-8 rounded-2xl flex flex-col gap-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Avatar + name */}
        <div className="flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="text-2xl font-black" style={{ color: "var(--accent-light)" }}>
                {(profile.username?.[0] ?? "?").toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black text-white">{profile.username}</h1>
            {profile.role && profile.role !== "reader" && (
              <span
                className="text-xs px-2 py-0.5 rounded-full self-start"
                style={{ background: "rgba(124,58,237,0.2)", color: "var(--accent-light)" }}
              >
                {profile.role}
              </span>
            )}
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Member since {joinDate}
            </p>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p
            className="text-sm leading-relaxed"
            style={{ color: "#9ca3af", whiteSpace: "pre-wrap" }}
          >
            {profile.bio}
          </p>
        )}

        {!profile.bio && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            This user hasn&apos;t written a bio yet.
          </p>
        )}
      </div>
    </div>
  );
}
