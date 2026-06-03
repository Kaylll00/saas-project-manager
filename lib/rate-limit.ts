type RateLimitRecord = {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitRecord>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store) {
    if (now > record.resetTime) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function rateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1, resetIn: windowMs }
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now }
  }

  record.count++
  return { allowed: true, remaining: maxAttempts - record.count, resetIn: record.resetTime - now }
}

/**
 * Extract a client IP from a Request object.
 * Handles various proxy headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  const realIp = req.headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }

  // Fall back to a placeholder if no IP is available
  return "unknown"
}
