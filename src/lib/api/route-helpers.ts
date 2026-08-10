import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/server";
import { findUserById } from "@/lib/auth/users";
import { ApiError, Errors } from "@/lib/api/errors";
import type { Actor } from "@/lib/api/services/authorize";
import type { ListQuery } from "@/lib/types";
import { metrics } from "@/lib/observability/metrics";
import { logger } from "@/lib/observability/logger";

/** Resolve the authenticated actor from the request, or throw 401. */
export async function requireActor(request: NextRequest): Promise<Actor> {
  const session = await getSession();
  if (!session) throw Errors.unauthorized();
  const user = findUserById(session.userId);
  if (!user) throw Errors.unauthorized();
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1",
  };
}

/** Parse standard list query params from the URL. */
export function parseListQuery(request: NextRequest): ListQuery {
  const p = request.nextUrl.searchParams;
  return {
    page: p.get("page") ? Number(p.get("page")) : undefined,
    pageSize: p.get("pageSize") ? Number(p.get("pageSize")) : undefined,
    search: p.get("search") ?? undefined,
    sortBy: p.get("sortBy") ?? undefined,
    sortDir: (p.get("sortDir") as "asc" | "desc" | null) ?? undefined,
    status: p.get("status") ?? undefined,
  };
}

/** Convert any thrown value into a JSON error response with the right status. */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      {
        status: error.status,
      }
    );
  }
  logger.error("route.unhandled", {
    error: error instanceof Error ? error.message : String(error),
  });
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

/** Wrap a route handler with metrics + centralized error handling. */
export function handle(
  name: string,
  fn: () => Promise<NextResponse>
): Promise<NextResponse> {
  metrics.increment("http.request", { route: name });
  return fn().catch((error) => {
    metrics.increment("http.error", { route: name });
    return toErrorResponse(error);
  });
}
