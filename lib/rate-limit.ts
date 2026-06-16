/**
 * Sliding-window in-memory rate limiter + scraper block store.
 *
 * Works per-instance. State is not shared across serverless instances, which is
 * acceptable for a small deployment — it provides meaningful burst protection
 * within each warm instance.
 */

// ── Sliding-window rate limiter ───────────────────────────────────────────────

const store = new Map<string, number[]>();

/**
 * Returns true if the request is allowed, false if the limit is exceeded.
 * Timestamps older than `windowMs` are evicted on every call.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;

  const timestamps = (store.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= limit) {
    store.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return true;
}

// ── Scraper detection ─────────────────────────────────────────────────────────

// Maps a key (typically IP) to the Unix timestamp when the block expires.
const blockStore = new Map<string, number>();

export type ScraperCheckResult =
  | { blocked: false }
  | { blocked: true; newlyBlocked: boolean };

/**
 * Tracks requests in a sliding window. If `requestLimit` is exceeded within
 * `windowMs`, the key is blocked for `blockMs` and cannot make further requests
 * until the block expires.
 *
 * Returns `{ blocked: false }` when the request is allowed.
 * Returns `{ blocked: true, newlyBlocked: true }` on the first blocked request
 *   (use this to trigger a log entry).
 * Returns `{ blocked: true, newlyBlocked: false }` on subsequent blocked requests.
 */
export function checkScraper(
  key: string,
  requestLimit: number,
  windowMs: number,
  blockMs: number
): ScraperCheckResult {
  const now = Date.now();

  // ── Check existing block ──
  const unblockAt = blockStore.get(key);
  if (unblockAt !== undefined) {
    if (now < unblockAt) {
      return { blocked: true, newlyBlocked: false };
    }
    // Block expired — clean up both stores so the IP starts fresh.
    blockStore.delete(key);
    store.delete(key);
  }

  // ── Sliding window ──
  const cutoff = now - windowMs;
  const timestamps = (store.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= requestLimit) {
    blockStore.set(key, now + blockMs);
    store.delete(key);
    return { blocked: true, newlyBlocked: true };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { blocked: false };
}
