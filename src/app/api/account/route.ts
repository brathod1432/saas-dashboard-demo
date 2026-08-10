import { NextResponse, type NextRequest } from "next/server";
import { usersService } from "@/lib/api/services/users.service";
import { handle, requireActor } from "@/lib/api/route-helpers";

/** Self-service profile update for the currently authenticated user. */
export async function PATCH(request: NextRequest) {
  return handle("account.update_profile", async () => {
    const actor = await requireActor(request);
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(usersService.updateProfile(actor, body));
  });
}
