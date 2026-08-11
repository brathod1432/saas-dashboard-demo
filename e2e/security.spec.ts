import { test, expect } from "@playwright/test";

test.describe("security controls", () => {
  test("security headers are present on responses", async ({ request }) => {
    const res = await request.get("/login");
    const headers = res.headers();
    expect(headers["content-security-policy"]).toBeTruthy();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("authenticated API responses are marked no-store", async ({ request }) => {
    // Log in to obtain a session cookie on the request context.
    const login = await request.post("/api/auth/login", {
      data: { email: "admin@nexusops.demo", password: "password" },
    });
    expect(login.ok()).toBeTruthy();
    const res = await request.get("/api/customers");
    expect(res.headers()["cache-control"]).toContain("no-store");
  });

  test("login is rate-limited with a Retry-After header", async ({ request }) => {
    const email = `rl-${Date.now()}@nexusops.demo`;
    let last = await request.post("/api/auth/login", {
      data: { email, password: "wrongpass" },
    });
    // 5 failures are allowed (401); the 6th is locked out (429).
    for (let i = 0; i < 5; i++) {
      last = await request.post("/api/auth/login", {
        data: { email, password: "wrongpass" },
      });
    }
    expect(last.status()).toBe(429);
    expect(Number(last.headers()["retry-after"])).toBeGreaterThan(0);
  });

  test("cross-site mutations are blocked (CSRF guard)", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { email: "admin@nexusops.demo", password: "password" },
      headers: { "sec-fetch-site": "cross-site" },
    });
    expect(res.status()).toBe(403);
  });
});
