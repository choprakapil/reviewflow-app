/**
 * Token-bucket & sliding-window rate limiting utility.
 * Supports both high-performance in-memory tracking (single-node default)
 * and distributed Upstash Redis when environment variables are configured.
 *
 * PROXY ARCHITECTURE ASSUMPTIONS:
 * When deployed behind edge CDNs (Vercel Edge, Cloudflare, CloudFront, AWS ALB),
 * client IP addresses are prioritized from trusted platform headers (cf-connecting-ip, x-real-ip)
 * before parsing x-forwarded-for. Arbitrary values in x-forwarded-for are sanitized
 * against strict IPv4/IPv6 patterns to prevent spoofing and identifier pollution.
 */

export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
}

interface MemoryStoreEntry {
  tokens: number;
  lastRefill: number;
}

// Strict IPv4 and IPv6 validation regex
const IPV4_REGEX = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6_REGEX = /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$|^::1$|^::$/;

/**
 * Extracts and sanitizes the client IP address from request headers.
 * Protects against IP spoofing and invalid identifier injection.
 */
export function extractClientIp(
  headers: Headers | { get(name: string): string | null }
): string {
  // 1. Check direct edge-provided trusted client IP headers
  const cfConnectingIp = headers.get("cf-connecting-ip")?.trim();
  if (cfConnectingIp && (IPV4_REGEX.test(cfConnectingIp) || IPV6_REGEX.test(cfConnectingIp))) {
    return cfConnectingIp;
  }

  const xRealIp = headers.get("x-real-ip")?.trim();
  if (xRealIp && (IPV4_REGEX.test(xRealIp) || IPV6_REGEX.test(xRealIp))) {
    return xRealIp;
  }

  // 2. Parse X-Forwarded-For header
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // In typical reverse-proxy setups, the first entry is the client address
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    for (const rawIp of ips) {
      // Strip optional port if present (e.g., "192.0.2.1:443")
      const sanitized = rawIp.replace(/:\d+$/, "");
      if (IPV4_REGEX.test(sanitized) || IPV6_REGEX.test(sanitized)) {
        return sanitized;
      }
    }
  }

  // Safe fallback for local development or unidentified clients
  return "127.0.0.1";
}

class InMemoryRateLimiter {
  private store = new Map<string, MemoryStoreEntry>();
  private readonly sweepIntervalMs = 60_000;
  private readonly maxCapacity = 10_000; // Bound memory footprint

  constructor() {
    // Periodically sweep expired entries to prevent memory leaks
    if (typeof setInterval !== "undefined") {
      const timer = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
          // If inactive for > 1 hour, purge
          if (now - entry.lastRefill > 3_600_000) {
            this.store.delete(key);
          }
        }
      }, this.sweepIntervalMs);
      if (typeof timer.unref === "function") {
        timer.unref();
      }
    }
  }

  public check(identifier: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const refillRate = config.limit / (config.windowSeconds * 1000); // tokens per ms

    // Guard against unbounded memory exhaustion: prune oldest if capacity reached
    if (this.store.size >= this.maxCapacity && !this.store.has(identifier)) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }

    let entry = this.store.get(identifier);

    if (!entry) {
      entry = {
        tokens: config.limit - 1,
        lastRefill: now,
      };
      this.store.set(identifier, entry);
      return {
        success: true,
        limit: config.limit,
        remaining: config.limit - 1,
        reset: Math.ceil((now + config.windowSeconds * 1000) / 1000),
      };
    }

    // Refill tokens based on elapsed time
    const timePassed = now - entry.lastRefill;
    const tokensToAdd = timePassed * refillRate;
    entry.tokens = Math.min(config.limit, entry.tokens + tokensToAdd);
    entry.lastRefill = now;

    if (entry.tokens >= 1) {
      entry.tokens -= 1;
      return {
        success: true,
        limit: config.limit,
        remaining: Math.floor(entry.tokens),
        reset: Math.ceil((now + ((config.limit - entry.tokens) / refillRate)) / 1000),
      };
    } else {
      const waitTimeMs = (1 - entry.tokens) / refillRate;
      return {
        success: false,
        limit: config.limit,
        remaining: 0,
        reset: Math.ceil((now + waitTimeMs) / 1000),
      };
    }
  }

  public reset(identifier: string): void {
    this.store.delete(identifier);
  }

  public clear(): void {
    this.store.clear();
  }

  public get size(): number {
    return this.store.size;
  }
}

// Global in-memory singleton
const inMemoryLimiter = new InMemoryRateLimiter();

/**
 * Standard presets for ReviewFlow routes
 */
export const RateLimitPresets = {
  /** Public QR landing page scans: 60 requests per minute per IP */
  QR_LANDING: { limit: 60, windowSeconds: 60 },
  /** Telemetry beacon tracking: 120 requests per minute per IP */
  TRACKING_BEACON: { limit: 120, windowSeconds: 60 },
  /** Authentication login attempts: 5 requests per 15 minutes per IP */
  AUTH_LOGIN: { limit: 5, windowSeconds: 15 * 60 },
  /** Admin API operations: 100 requests per minute per user */
  ADMIN_API: { limit: 100, windowSeconds: 60 },
  /** AI Generation endpoint: 20 requests per minute per business */
  AI_GENERATE: { limit: 20, windowSeconds: 60 },
} as const;

/**
 * Rate limit checker with Upstash Redis support and seamless in-memory fallback.
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = RateLimitPresets.QR_LANDING
): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const key = `ratelimit:${identifier}`;
      const response = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, config.windowSeconds, "NX"],
          ["TTL", key],
        ]),
        signal: AbortSignal.timeout(1000), // Strict 1s guard
      });

      if (response.ok) {
        const data = await response.json();
        const currentCount = Number(data[0]?.result || 1);
        const ttl = Number(data[2]?.result || config.windowSeconds);
        const resetTime = Math.ceil((Date.now() + Math.max(0, ttl) * 1000) / 1000);

        if (currentCount > config.limit) {
          return {
            success: false,
            limit: config.limit,
            remaining: 0,
            reset: resetTime,
          };
        }

        return {
          success: true,
          limit: config.limit,
          remaining: Math.max(0, config.limit - currentCount),
          reset: resetTime,
        };
      }
    } catch {
      // Fail open to in-memory rate limiter on Redis timeout/network fault
    }
  }

  // In-memory token bucket execution
  return inMemoryLimiter.check(identifier, config);
}

export { inMemoryLimiter };
