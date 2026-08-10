import { NextResponse } from "next/server";
import { getHealth } from "@/lib/observability/health";

// Health checks must always run at request time.
export const dynamic = "force-dynamic";

export function GET() {
  const health = getHealth();
  return NextResponse.json(health, {
    status: health.status === "down" ? 503 : 200,
  });
}
