/**
 * Token-bucket & sliding-window rate limiting utility.
 * Supports both high-performance in-memory tracking (default/fallback)
 * and distributed Upstash Redis when environment variables are configured.
 */

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
}

interface MemoryStoreEntry {
  tokens: number;
  lastRefill: number;
}

class InMemoryRateLimiter {
  private store = new Map<string, MemoryStoreEntry>();
  private readonly sweepIntervalMs = 60_000;

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
      // Basic REST invocation to Upstash Redis
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
      // Fail open to in-memory rate limiter on Redis timeout/error
    }
  }

  // In-memory token bucket execution
  return inMemoryLimiter.check(identifier, config);
}

export { inMemoryLimiter };
