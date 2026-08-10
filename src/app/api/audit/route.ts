import { NextResponse, type NextRequest } from "next/server";
import { auditService } from "@/lib/api/services/audit.service";
import { handle, requireActor } from "@/lib/api/route-helpers";

export async function GET(request: NextRequest) {
  return handle("audit.list", async () => {
    const actor = await requireActor(request);
    return NextResponse.json({ data: auditService.list(actor) });
  });
}
