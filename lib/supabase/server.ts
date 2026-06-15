import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const all = cookieStore.getAll();
          console.log("[SERVER_CLIENT] getAll() →", all.map((c) => c.name));
          return all;
        },
        setAll(cookiesToSet) {
          console.log("[SERVER_CLIENT] setAll() called with →", cookiesToSet.map((c) => c.name));
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              console.log("[SERVER_CLIENT] writing cookie →", name);
              cookieStore.set(name, value, options);
              console.log("[SERVER_CLIENT] cookie write succeeded →", name);
            });
          } catch (err) {
            console.log("[SERVER_CLIENT] cookie write FAILED (server component context) →", cookiesToSet.map((c) => c.name), String(err));
          }
        },
      },
    }
  );
}
