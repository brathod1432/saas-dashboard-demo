import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { recordAudit } from "@/lib/audit";
import { handle } from "@/lib/api/route-helpers";

export async function POST(request: NextRequest) {
  return handle("auth.logout", async () => {
    const session = await getSession();
    const store = await cookies();
    store.delete(SESSION_COOKIE_NAME);
    if (session) {
      recordAudit({
        action: "auth.logout",
        actorId: session.userId,
        actorName: session.name,
        target: "session",
        ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      });
    }
    return NextResponse.json({ ok: true });
  });
}
