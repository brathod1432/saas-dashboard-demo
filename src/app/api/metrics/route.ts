import { NextResponse, type NextRequest } from "next/server";
import { metrics } from "@/lib/observability/metrics";
import { handle, requireActor } from "@/lib/api/route-helpers";
import { isAtLeast } from "@/lib/rbac";
import { Errors } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

/** Metrics are operational data — restricted to managers and admins. */
export async function GET(request: NextRequest) {
  return handle("metrics", async () => {
    const actor = await requireActor(request);
    if (!isAtLeast(actor.role, "manager")) throw Errors.forbidden();
    return NextResponse.json({ metrics: metrics.snapshot() });
  });
}
