import { createRateLimiter } from "@/lib/security/rate-limit";

describe("rate limiter", () => {
  it("allows attempts under the limit and reports remaining", () => {
    const rl = createRateLimiter({ max: 3, windowMs: 60_000, lockoutMs: 60_000 });
    expect(rl.check("k").allowed).toBe(true);
    rl.fail("k");
    expect(rl.check("k").remaining).toBe(2);
  });

  it("locks out after exceeding the max and surfaces retryAfter", () => {
    const rl = createRateLimiter({ max: 3, windowMs: 60_000, lockoutMs: 60_000 });
    rl.fail("k");
    rl.fail("k");
    const third = rl.fail("k"); // hits max => locked
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
    expect(rl.check("k").allowed).toBe(false);
  });

  it("resets the counter (e.g. on success)", () => {
    const rl = createRateLimiter({ max: 2, windowMs: 60_000, lockoutMs: 60_000 });
    rl.fail("k");
    rl.fail("k");
    expect(rl.check("k").allowed).toBe(false);
    rl.reset("k");
    expect(rl.check("k").allowed).toBe(true);
  });

  it("isolates counters per key", () => {
    const rl = createRateLimiter({ max: 1, windowMs: 60_000, lockoutMs: 60_000 });
    rl.fail("a");
    expect(rl.check("a").allowed).toBe(false);
    expect(rl.check("b").allowed).toBe(true);
  });
});
