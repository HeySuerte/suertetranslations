import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  console.log("========================================");
  console.log("[MIDDLEWARE] path =", request.nextUrl.pathname);
  console.log("[MIDDLEWARE] incoming cookies =", request.cookies.getAll().map((c) => c.name));

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const all = request.cookies.getAll();
          console.log("[MIDDLEWARE] cookies.getAll() →", all.map((c) => c.name));
          return all;
        },
        setAll(cookiesToSet) {
          console.log("[MIDDLEWARE] cookies.setAll() called →", cookiesToSet.map((c) => c.name));
          cookiesToSet.forEach(({ name, value }) => {
            console.log("[MIDDLEWARE] request.cookies.set →", name);
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log("[MIDDLEWARE] response.cookies.set →", name, "options →", JSON.stringify(options));
            supabaseResponse.cookies.set(name, value, options);
          });
          console.log("[MIDDLEWARE] supabaseResponse replaced — new response created with rotated cookie");
        },
      },
    }
  );

  console.log("[MIDDLEWARE] before getUser()");
  const { data: { user }, error } = await supabase.auth.getUser();
  console.log("[MIDDLEWARE] after getUser() → user =", user?.id ?? null, "| error =", error?.message ?? null);

  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    console.log("[MIDDLEWARE] /admin blocked — no user — redirecting to /login");
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  console.log("[MIDDLEWARE] PASS — returning supabaseResponse");
  console.log("[MIDDLEWARE] response Set-Cookie headers →", supabaseResponse.headers.getSetCookie?.() ?? "(getSetCookie not available)");
  return supabaseResponse;
}
