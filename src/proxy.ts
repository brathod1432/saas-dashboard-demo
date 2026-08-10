import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

/**
 * Edge route guard (Next.js 16 `proxy` convention, formerly `middleware`).
 *
 * First line of defense for protected routes. Note: authorization is ALSO
 * enforced in the service layer (defense in depth) — the proxy only gates
 * authentication + coarse routing. See docs/security-implementation.md.
 */

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/customers",
  "/projects",
  "/invoices",
  "/reports",
  "/analytics",
  "/settings",
  "/account",
  "/help",
];

const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Unauthenticated users hitting a protected page → login (preserve intended path).
  if (isProtected && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated users hitting an auth page → dashboard.
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets, images, and API routes.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
