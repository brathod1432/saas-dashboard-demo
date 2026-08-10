import { NextResponse, type NextRequest } from "next/server";
import { usersService } from "@/lib/api/services/users.service";
import { handle, requireActor } from "@/lib/api/route-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handle("users.update_role", async () => {
    const actor = await requireActor(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(usersService.updateRole(actor, id, body.role));
  });
}
