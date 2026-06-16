import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const profile = profileData as Pick<Profile, "role"> | null;

  if (!profile || !["staff", "admin"].includes(profile.role ?? "")) redirect("/");

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <span
          className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ background: "rgba(124,58,237,0.2)", color: "var(--accent-light)", border: "1px solid rgba(124,58,237,0.3)" }}
        >
          Admin
        </span>
      </div>
      {children}
    </div>
  );
}
