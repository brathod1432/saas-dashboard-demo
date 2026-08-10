import type { NextRequest } from "next/server";
import { Errors } from "@/lib/api/errors";

/**
 * Same-origin / CSRF guard for state-changing requests.
 *
 * Cookies are SameSite=Lax, but this adds defense in depth: it rejects
 * cross-site mutations using the Fetch Metadata `Sec-Fetch-Site` header (modern
 * browsers) with an `Origin` host fallback. Call at the top of POST/PATCH/DELETE
 * route handlers. See docs/security-implementation.md.
 */
export function assertSameOrigin(request: NextRequest): void {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite) {
    // "same-origin"/"none" (address bar) are safe; "same-site"/"cross-site" are not.
    if (secFetchSite === "same-origin" || secFetchSite === "none") return;
    throw Errors.forbidden("Cross-site request blocked");
  }

  // Fallback for clients that don't send Fetch Metadata: compare Origin host.
  const origin = request.headers.get("origin");
  if (!origin) return; // e.g. same-origin GET-like tools; mutations still gated by auth
  try {
    const originHost = new URL(origin).host;
    const requestHost = request.headers.get("host") ?? request.nextUrl.host;
    if (originHost !== requestHost) {
      throw Errors.forbidden("Cross-origin request blocked");
    }
  } catch {
    throw Errors.forbidden("Invalid origin");
  }
}
