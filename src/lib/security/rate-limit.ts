/**
 * In-memory rate limiter with temporary lockout.
 *
 * Demo-grade (per-process). In production, back this with Redis/Upstash so limits
 * hold across instances. Used to throttle authentication attempts (credential
 * stuffing / brute force). See docs/security-implementation.md.
 */

interface Attempt {
  count: number;
  windowStart: number;
  lockedUntil?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

export interface RateLimiterOptions {
  /** Max attempts allowed within the window before lockout. */
  max: number;
  /** Rolling window length in milliseconds. */
  windowMs: number;
  /** Lockout duration in milliseconds once `max` is exceeded. */
  lockoutMs: number;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const store = new Map<string, Attempt>();

  function check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = store.get(key);

    if (entry?.lockedUntil && entry.lockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil((entry.lockedUntil - now) / 1000),
      };
    }
    if (!entry || now - entry.windowStart > options.windowMs) {
      return { allowed: true, remaining: options.max };
    }
    return { allowed: true, remaining: Math.max(0, options.max - entry.count) };
  }

  /** Record a failed attempt; returns the post-failure state (may be locked). */
  function fail(key: string): RateLimitResult {
    const now = Date.now();
    let entry = store.get(key);
    if (!entry || now - entry.windowStart > options.windowMs) {
      entry = { count: 0, windowStart: now };
      store.set(key, entry);
    }
    entry.count += 1;
    if (entry.count >= options.max) {
      entry.lockedUntil = now + options.lockoutMs;
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil(options.lockoutMs / 1000),
      };
    }
    return { allowed: true, remaining: options.max - entry.count };
  }

  /** Clear the counter for a key (e.g. after a successful login). */
  function reset(key: string): void {
    store.delete(key);
  }

  return { check, fail, reset };
}

/** Shared limiter for login: 5 failures per 15 min → 15 min lockout. */
export const loginRateLimiter = createRateLimiter({
  max: 5,
  windowMs: 15 * 60_000,
  lockoutMs: 15 * 60_000,
});
