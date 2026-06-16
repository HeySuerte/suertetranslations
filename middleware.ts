import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { rateLimit, checkScraper } from "@/lib/rate-limit";

// Paths that receive general rate limiting (auth + API abuse prevention).
const RATE_LIMITED_PREFIXES = ["/api/", "/login", "/signup"];

// Scraper detection: >30 chapter requests per minute from the same IP triggers
// a 10-minute block on all /read/* access.
const SCRAPER_LIMIT = 30;
const SCRAPER_WINDOW_MS = 60_000;       // 1 minute sliding window
const SCRAPER_BLOCK_MS = 10 * 60_000;  // 10 minute block

function getIp(request: NextRequest): string {
  // x-forwarded-for may contain a comma-separated list; the first entry is the client IP.
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function tooManyRequestsResponse(retryAfterSeconds: number): NextResponse {
  return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfterSeconds),
    },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getIp(request);

  // ── Scraper detection for /read/* ─────────────────────────────────────────
  // Checked before updateSession to block scrapers before any Supabase call.
  if (pathname.startsWith("/read/")) {
    const result = checkScraper(
      `scraper:${ip}`,
      SCRAPER_LIMIT,
      SCRAPER_WINDOW_MS,
      SCRAPER_BLOCK_MS
    );

    if (result.blocked) {
      if (result.newlyBlocked) {
        // Log on the first blocked request only to avoid flooding server logs.
        console.warn(
          `[SCRAPER] IP blocked — ${ip} | path=${pathname} | time=${new Date().toISOString()}`
        );
      }
      return tooManyRequestsResponse(600); // 10 minutes
    }
  }

  // ── Session refresh (calls getUser() once, returns userId for rate limiting) ─
  const { response, userId } = await updateSession(request);

  // ── General rate limiting for auth + API paths ────────────────────────────
  const isRateLimitedPath = RATE_LIMITED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isRateLimitedPath) {
    // Authenticated users get a higher allowance keyed on their stable user ID.
    // Anonymous users are keyed on IP address.
    const key = userId ? `rl:user:${userId}` : `rl:ip:${ip}`;
    const limit = userId ? 60 : 20;

    if (!rateLimit(key, limit, 60_000)) {
      return tooManyRequestsResponse(60);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
