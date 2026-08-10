import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Permission } from "@/lib/rbac";
import { hasPermission } from "@/lib/rbac";
import type { User } from "@/lib/types";
import { findUserById } from "./users";
import { SESSION_COOKIE_NAME, verifySessionToken, type Session } from "./session";

/** Read + verify the session from the request cookies (RSC / route handlers). */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/** Resolve the full current user record, or null if unauthenticated. */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  return findUserById(session.userId) ?? null;
}

/** Require a session or redirect to login. Use at the top of protected pages. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require a specific permission or redirect to an access-denied view. */
export async function requirePermission(permission: Permission): Promise<User> {
  const user = await requireUser();
  if (!hasPermission(user.role, permission)) redirect("/dashboard?denied=1");
  return user;
}
