import { NextResponse, type NextRequest } from "next/server";
import { settingsService } from "@/lib/api/services/settings.service";
import { handle, requireActor } from "@/lib/api/route-helpers";

export async function GET(request: NextRequest) {
  return handle("settings.get", async () => {
    const actor = await requireActor(request);
    return NextResponse.json(settingsService.get(actor));
  });
}

export async function PATCH(request: NextRequest) {
  return handle("settings.update", async () => {
    const actor = await requireActor(request);
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(settingsService.update(actor, body));
  });
}
