import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { handle } from "@/lib/api/route-helpers";

export async function GET() {
  return handle("auth.session", async () => {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ user: null }, { status: 200 });
    return NextResponse.json({ user });
  });
}
