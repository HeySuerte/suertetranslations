import { createHmac, timingSafeEqual } from "crypto";

// Each window is 10 seconds. Accepting current + previous window gives
// 10–20 second effective token validity — a legitimate browser loads the shell
// page and immediately fires the API fetch, so this is plenty of headroom.
const WINDOW_SECONDS = 10;

function windowIndex(offset = 0): number {
  return Math.floor(Date.now() / 1000 / WINDOW_SECONDS) + offset;
}

function hmac(
  secret: string,
  slug: string,
  chapter: string,
  window: number,
  ua: string,
  ip: string
): string {
  return createHmac("sha256", secret)
    .update(`${slug}:${chapter}:${window}:${ua}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

export function generateToken(
  slug: string,
  chapter: number,
  ua: string,
  ip: string
): string {
  return hmac(
    process.env.CHAPTER_TOKEN_SECRET!,
    slug,
    String(chapter),
    windowIndex(),
    ua,
    ip
  );
}

export function validateToken(
  slug: string,
  chapter: string,
  token: string,
  ua: string,
  ip: string
): boolean {
  if (token.length !== 32) return false;
  const secret = process.env.CHAPTER_TOKEN_SECRET!;
  const tokenBuf = Buffer.from(token);
  for (const offset of [0, -1]) {
    const expected = hmac(secret, slug, chapter, windowIndex(offset), ua, ip);
    try {
      if (timingSafeEqual(Buffer.from(expected), tokenBuf)) return true;
    } catch {
      // length mismatch — can't happen given the length check above, but guard anyway
    }
  }
  return false;
}
