import { NextResponse, type NextRequest } from "next/server";
import { invoicesService } from "@/lib/api/services/invoices.service";
import { handle, parseListQuery, requireActor } from "@/lib/api/route-helpers";

export async function GET(request: NextRequest) {
  return handle("invoices.list", async () => {
    const actor = await requireActor(request);
    return NextResponse.json(invoicesService.list(actor, parseListQuery(request)));
  });
}

export async function POST(request: NextRequest) {
  return handle("invoices.create", async () => {
    const actor = await requireActor(request);
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(invoicesService.create(actor, body), { status: 201 });
  });
}
