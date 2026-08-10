import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { findUserByEmail, DEMO_PASSWORD } from "@/lib/auth/users";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { LoginSchema } from "@/lib/validation/schemas";
import { recordAudit } from "@/lib/audit";
import { ApiError, Errors } from "@/lib/api/errors";
import { handle } from "@/lib/api/route-helpers";
import { assertSameOrigin } from "@/lib/security/origin";
import { loginRateLimiter } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  return handle("auth.login", async () => {
    // CSRF / cross-site defense in depth (cookie is SameSite=Lax too).
    assertSameOrigin(request);

    const body = await request.json().catch(() => ({}));
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) throw Errors.badRequest(parsed.error.issues[0]?.message);

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
    const rateKey = `${ip}:${parsed.data.email.toLowerCase()}`;

    // Reject early if this IP+email is currently locked out.
    const gate = loginRateLimiter.check(rateKey);
    if (!gate.allowed) {
      recordAudit({
        action: "access.denied",
        actorId: "anonymous",
        actorName: parsed.data.email,
        target: "auth.login:rate_limited",
        ip,
        severity: "warning",
      });
      throw new ApiError(
        429,
        "Too many attempts. Please try again later.",
        "rate_limited"
      );
    }

    const user = findUserByEmail(parsed.data.email);
    // Demo auth: any seeded user + the shared demo password.
    if (!user || parsed.data.password !== DEMO_PASSWORD) {
      // Count the failure (may trigger a lockout); message stays generic.
      loginRateLimiter.fail(rateKey);
      throw Errors.unauthorized("Invalid email or password");
    }

    // Successful login clears the counter.
    loginRateLimiter.reset(rateKey);

    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    const store = await cookies();
    store.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    recordAudit({
      action: "auth.login",
      actorId: user.id,
      actorName: user.name,
      target: "session",
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });
}
