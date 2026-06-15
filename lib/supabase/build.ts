import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Lightweight anon client for build-time calls (generateStaticParams, sitemap).
// Cannot use @supabase/ssr here because cookies() requires an HTTP request context.
export function createBuildClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
