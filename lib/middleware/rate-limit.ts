const windowMs = 60_000;
const maxRequests = 60;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 60_000);

export function checkRateLimit(
  ip: string,
  limit: number = maxRequests,
  window: number = windowMs
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const key = ip;

  let entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + window };
    store.set(key, entry);
  }

  entry.count++;

  if (entry.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: limit - entry.count,
    retryAfter: 0,
  };
}

export function rateLimitHeaders(result: ReturnType<typeof checkRateLimit>): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    ...(result.retryAfter > 0 ? { "Retry-After": String(result.retryAfter) } : {}),
  };
}
