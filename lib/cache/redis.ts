const REDIS_TIMEOUT_MS = 2000;

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** Wrapper stored in Redis — includes metadata for stale-while-revalidate */
interface CacheEnvelope<T> {
  data: T;
  cachedAt: number; // epoch ms
  ttl: number;      // original TTL in seconds
}

export async function getCachedJson<T = unknown>(key: string): Promise<T | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const resp = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { result?: string };
    return data.result ? JSON.parse(data.result) : null;
  } catch (err) {
    console.warn("[redis] getCachedJson failed:", errMsg(err));
    return null;
  }
}

export async function setCachedJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  try {
    await fetch(
      `${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}/EX/${ttlSeconds}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
      }
    );
  } catch (err) {
    console.warn("[redis] setCachedJson failed:", errMsg(err));
  }
}

/** Delete a specific cache key */
export async function deleteCachedKey(key: string): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  try {
    await fetch(`${url}/del/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
    });
  } catch (err) {
    console.warn("[redis] deleteCachedKey failed:", errMsg(err));
  }
}

const inflight = new Map<string, Promise<unknown>>();

/**
 * Stale-While-Revalidate cache pattern.
 *
 * - Returns cached data immediately if within TTL.
 * - If data is past TTL but within grace period (2x TTL), returns stale data
 *   AND triggers a background revalidation.
 * - If no cache or past grace period, fetches fresh synchronously.
 * - Deduplicates concurrent fetches via in-flight map.
 */
export async function cachedFetch<T extends object>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T | null>,
  options?: { forceRefresh?: boolean }
): Promise<T | null> {
  // Allow force-bypass of cache
  if (!options?.forceRefresh) {
    const envelope = await getCachedJson<CacheEnvelope<T>>(key);

    if (envelope?.data != null && envelope.cachedAt) {
      const ageMs = Date.now() - envelope.cachedAt;
      const ttlMs = (envelope.ttl || ttlSeconds) * 1000;
      const graceMs = ttlMs * 3; // 3x TTL grace for stale-while-revalidate

      if (ageMs < ttlMs) {
        // Fresh — return immediately
        return envelope.data;
      }

      if (ageMs < graceMs) {
        // Stale but within grace — return stale, revalidate in background
        console.log(`[cache] SWR: serving stale data for "${key}" (age: ${Math.round(ageMs / 1000)}s, ttl: ${ttlSeconds}s)`);
        triggerBackgroundRevalidation(key, ttlSeconds, fetcher);
        return envelope.data;
      }

      // Past grace period — fall through to fresh fetch
      console.log(`[cache] Data for "${key}" too stale (age: ${Math.round(ageMs / 1000)}s), fetching fresh`);
    }

    // Try legacy format (no envelope) - backwards compat
    const legacyData = await getCachedJson<T>(key);
    if (legacyData !== null && typeof legacyData === "object" && !("cachedAt" in legacyData)) {
      // Old-format data — serve it but schedule revalidation
      triggerBackgroundRevalidation(key, ttlSeconds, fetcher);
      return legacyData;
    }
  }

  // No cache or force refresh — fetch fresh (deduplicated)
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T | null>;

  const promise = fetcher()
    .then(async (result) => {
      if (result != null) {
        const envelope: CacheEnvelope<T> = {
          data: result,
          cachedAt: Date.now(),
          ttl: ttlSeconds,
        };
        // Store with 3x TTL so stale data is available during grace period
        await setCachedJson(key, envelope, ttlSeconds * 3);
      }
      return result;
    })
    .catch((err: unknown) => {
      console.warn(`[cache] cachedFetch failed for "${key}":`, errMsg(err));
      return null;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

/** Fire-and-forget revalidation (non-blocking) */
function triggerBackgroundRevalidation<T extends object>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T | null>
): void {
  if (inflight.has(key)) return; // Already revalidating

  const promise = fetcher()
    .then(async (result) => {
      if (result != null) {
        const envelope: CacheEnvelope<T> = {
          data: result,
          cachedAt: Date.now(),
          ttl: ttlSeconds,
        };
        await setCachedJson(key, envelope, ttlSeconds * 3);
        console.log(`[cache] SWR revalidated "${key}" successfully`);
      }
    })
    .catch((err: unknown) => {
      console.warn(`[cache] SWR revalidation failed for "${key}":`, errMsg(err));
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
}
