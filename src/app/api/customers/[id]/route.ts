import { NextResponse, type NextRequest } from "next/server";
import { customersService } from "@/lib/api/services/customers.service";
import { handle, requireActor } from "@/lib/api/route-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handle("customers.get", async () => {
    const actor = await requireActor(request);
    const { id } = await params;
    return NextResponse.json(customersService.get(actor, id));
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handle("customers.update", async () => {
    const actor = await requireActor(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(customersService.update(actor, id, body));
  });
}
