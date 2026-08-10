import { NextResponse, type NextRequest } from "next/server";
import { customersService } from "@/lib/api/services/customers.service";
import { handle, parseListQuery, requireActor } from "@/lib/api/route-helpers";

export async function GET(request: NextRequest) {
  return handle("customers.list", async () => {
    const actor = await requireActor(request);
    const result = customersService.list(actor, parseListQuery(request));
    return NextResponse.json(result);
  });
}

export async function POST(request: NextRequest) {
  return handle("customers.create", async () => {
    const actor = await requireActor(request);
    const body = await request.json().catch(() => ({}));
    const customer = customersService.create(actor, body);
    return NextResponse.json(customer, { status: 201 });
  });
}
