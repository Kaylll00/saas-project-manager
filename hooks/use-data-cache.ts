"use client"

// In-memory cache with TTL
const cache = new Map<string, { data: unknown; timestamp: number }>()
const DEFAULT_TTL = 30_000 // 30 seconds

function getCached<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() })
}

/**
 * Fetch wrapper with in-memory caching.
 * Returns cached data immediately if available, otherwise fetches and caches.
 * Cache key is based on URL only — only suitable for idempotent GET requests.
 */
export async function fetchWithCache<T>(
  url: string,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const cached = getCached<T>(url, ttl)
  if (cached) return cached

  let data: T
  try {
    const res = await fetch(url)
    if (!res.ok) {
      // Try to parse error body, fall back to status text
      let errorMessage = `Request failed: ${res.status}`
      try { const body = await res.json(); errorMessage = body.error || errorMessage } catch { /* ignore */ }
      throw new Error(errorMessage)
    }
    data = (await res.json()) as T
  } catch (err) {
    // Re-throw fetch/network errors so callers can handle them
    throw err
  }

  setCache(url, data)
  return data
}

/**
 * Manually invalidate a cached entry (useful after mutations).
 */
export function invalidateCache(url: string) {
  cache.delete(url)
}
