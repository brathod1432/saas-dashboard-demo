"use client";

import type { ReactNode } from "react";
import { hasPermission, type Permission } from "@/lib/rbac";
import { useCurrentUser } from "./session-context";

/** Client hook: does the current user hold this permission? */
export function useCan(permission: Permission): boolean {
  const user = useCurrentUser();
  return hasPermission(user.role, permission);
}

/**
 * Conditionally render children based on the current user's permission.
 * UI gating is a UX convenience — the service layer enforces the real boundary.
 */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useCan(permission) ? <>{children}</> : <>{fallback}</>;
}
