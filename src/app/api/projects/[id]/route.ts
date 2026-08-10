import { NextResponse, type NextRequest } from "next/server";
import { projectsService } from "@/lib/api/services/projects.service";
import { handle, requireActor } from "@/lib/api/route-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handle("projects.get", async () => {
    const actor = await requireActor(request);
    const { id } = await params;
    return NextResponse.json(projectsService.get(actor, id));
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handle("projects.update", async () => {
    const actor = await requireActor(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(projectsService.update(actor, id, body));
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handle("projects.delete", async () => {
    const actor = await requireActor(request);
    const { id } = await params;
    return NextResponse.json(projectsService.remove(actor, id));
  });
}
