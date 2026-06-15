import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  console.log("========================================");
  console.log("[ADMIN_LAYOUT] entered");

  const supabase = await createClient();
  console.log("[ADMIN_LAYOUT] supabase client created");

  console.log("[ADMIN_LAYOUT] before getSession()");
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log("[ADMIN_LAYOUT] after getSession() → session user =", session?.user?.id ?? null, "| error =", sessionError?.message ?? null);
  console.log("[ADMIN_LAYOUT] session expires_at =", session?.expires_at ?? null);
  console.log("[ADMIN_LAYOUT] access_token present =", !!session?.access_token);

  const user = session?.user ?? null;

  if (!user) {
    console.log("[ADMIN_LAYOUT] no user — redirecting to /login");
    redirect("/login");
  }

  console.log("[ADMIN_LAYOUT] user.id =", user.id);

  console.log("[ADMIN_LAYOUT] before profiles query");
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  console.log("[ADMIN_LAYOUT] after profiles query → profileData =", JSON.stringify(profileData), "| error =", profileError?.message ?? null);

  const profile = profileData as Pick<Profile, "role"> | null;

  if (!profile || !["staff", "admin"].includes(profile.role ?? "")) {
    console.log("[ADMIN_LAYOUT] role check FAILED — profile =", JSON.stringify(profile), "— redirecting to /");
    redirect("/");
  }

  console.log("[ADMIN_LAYOUT] role check PASSED — role =", profile.role);

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
