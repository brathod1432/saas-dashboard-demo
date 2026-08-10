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
import { Errors } from "@/lib/api/errors";
import { handle } from "@/lib/api/route-helpers";

export async function POST(request: NextRequest) {
  return handle("auth.login", async () => {
    const body = await request.json().catch(() => ({}));
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) throw Errors.badRequest(parsed.error.issues[0]?.message);

    const user = findUserByEmail(parsed.data.email);
    // Demo auth: any seeded user + the shared demo password.
    if (!user || parsed.data.password !== DEMO_PASSWORD) {
      throw Errors.unauthorized("Invalid email or password");
    }

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
