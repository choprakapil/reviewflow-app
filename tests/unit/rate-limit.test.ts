import { describe, it, expect, beforeEach } from "vitest";
import { inMemoryLimiter } from "@/lib/rate-limit";

describe("Rate Limiter (Token Bucket)", () => {
  beforeEach(() => {
    inMemoryLimiter.clear();
  });

  it("allows requests under the configured threshold", () => {
    const config = { limit: 5, windowSeconds: 60 };
    const res1 = inMemoryLimiter.check("test-ip-1", config);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(4);

    const res2 = inMemoryLimiter.check("test-ip-1", config);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(3);
  });

  it("blocks requests once token bucket is exhausted", () => {
    const config = { limit: 2, windowSeconds: 60 };
    
    // 1st request
    const r1 = inMemoryLimiter.check("test-ip-blocked", config);
    expect(r1.success).toBe(true);

    // 2nd request
    const r2 = inMemoryLimiter.check("test-ip-blocked", config);
    expect(r2.success).toBe(true);

    // 3rd request (should fail)
    const r3 = inMemoryLimiter.check("test-ip-blocked", config);
    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
    expect(r3.reset).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("tracks identifiers independently", () => {
    const config = { limit: 1, windowSeconds: 60 };

    const userA = inMemoryLimiter.check("user-a", config);
    expect(userA.success).toBe(true);

    const userABlocked = inMemoryLimiter.check("user-a", config);
    expect(userABlocked.success).toBe(false);

    const userB = inMemoryLimiter.check("user-b", config);
    expect(userB.success).toBe(true);
  });
});

