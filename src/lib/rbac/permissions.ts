import type { Role } from "@/lib/types";

/**
 * Permission catalogue. Permissions are `resource:action` strings so the set is
 * easy to scan and extend. See docs/rbac.md for the full matrix.
 */
export const PERMISSIONS = [
  "dashboard:view",
  "customers:view",
  "customers:create",
  "customers:edit",
  "customers:delete",
  "projects:view",
  "projects:create",
  "projects:edit",
  "projects:delete",
  "invoices:view",
  "invoices:create",
  "invoices:edit",
  "invoices:void",
  "reports:view",
  "analytics:view",
  "audit:view",
  "settings:view",
  "settings:edit",
  "users:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Human-readable role metadata for UI display. */
export const ROLE_DEFINITIONS: Record<
  Role,
  { label: string; description: string; rank: number }
> = {
  admin: {
    label: "Admin",
    description: "Full access including user management and settings.",
    rank: 4,
  },
  manager: {
    label: "Manager",
    description: "Manage customers, projects, invoices, and view reports.",
    rank: 3,
  },
  user: {
    label: "User",
    description: "Create and edit their own work; no destructive actions.",
    rank: 2,
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access to dashboards and reports.",
    rank: 1,
  },
};

/**
 * Role → permission matrix. Kept explicit (not inherited) so the effective
 * permissions of every role are auditable at a glance.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [...PERMISSIONS],
  manager: [
    "dashboard:view",
    "customers:view",
    "customers:create",
    "customers:edit",
    "projects:view",
    "projects:create",
    "projects:edit",
    "invoices:view",
    "invoices:create",
    "invoices:edit",
    "invoices:void",
    "reports:view",
    "analytics:view",
    "audit:view",
    "settings:view",
  ],
  user: [
    "dashboard:view",
    "customers:view",
    "customers:create",
    "customers:edit",
    "projects:view",
    "projects:create",
    "projects:edit",
    "invoices:view",
    "invoices:create",
    "reports:view",
    "settings:view",
  ],
  viewer: [
    "dashboard:view",
    "customers:view",
    "projects:view",
    "invoices:view",
    "reports:view",
    "analytics:view",
  ],
};
