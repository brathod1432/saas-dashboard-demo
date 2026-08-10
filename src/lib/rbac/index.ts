import type { Role } from "@/lib/types";
import { ROLE_PERMISSIONS, type Permission, ROLE_DEFINITIONS } from "./permissions";

export { PERMISSIONS, ROLE_PERMISSIONS, ROLE_DEFINITIONS } from "./permissions";
export type { Permission } from "./permissions";

/** Return all effective permissions for a role. */
export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/** Check whether a role holds a single permission. */
export function hasPermission(role: Role, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}

/** Check whether a role holds ALL of the given permissions. */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/** Check whether a role holds ANY of the given permissions. */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/** Compare role seniority (higher rank = more privileged). */
export function isAtLeast(role: Role, minimum: Role): boolean {
  return ROLE_DEFINITIONS[role].rank >= ROLE_DEFINITIONS[minimum].rank;
}
