/**
 * Simple in-memory rate limiter for API routes.
 * Limits requests per IP per window.
 */
const store = new Map();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now - entry.start > windowMs * 2) store.delete(key);
  }
}

export function rateLimit({ windowMs = 60_000, max = 30 } = {}) {
  return function check(request) {
    cleanup(windowMs);

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now - entry.start > windowMs) {
      store.set(ip, { start: now, count: 1 });
      return { ok: true, remaining: max - 1 };
    }

    entry.count++;
    if (entry.count > max) {
      return { ok: false, remaining: 0 };
    }

    return { ok: true, remaining: max - entry.count };
  };
}

// Pre-configured limiters
export const apiLimiter = rateLimit({ windowMs: 60_000, max: 60 });
export const searchLimiter = rateLimit({ windowMs: 60_000, max: 30 });
export const aiLimiter = rateLimit({ windowMs: 60_000, max: 10 });
