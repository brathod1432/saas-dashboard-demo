import { NextResponse, type NextRequest } from "next/server";
import { projectsService } from "@/lib/api/services/projects.service";
import { handle, parseListQuery, requireActor } from "@/lib/api/route-helpers";

export async function GET(request: NextRequest) {
  return handle("projects.list", async () => {
    const actor = await requireActor(request);
    return NextResponse.json(projectsService.list(actor, parseListQuery(request)));
  });
}

export async function POST(request: NextRequest) {
  return handle("projects.create", async () => {
    const actor = await requireActor(request);
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(projectsService.create(actor, body), { status: 201 });
  });
}
