import { NextResponse, type NextRequest } from "next/server";
import { usersService } from "@/lib/api/services/users.service";
import { handle, requireActor } from "@/lib/api/route-helpers";

export async function GET(request: NextRequest) {
  return handle("users.list", async () => {
    const actor = await requireActor(request);
    return NextResponse.json({ data: usersService.list(actor) });
  });
}
