import {
  getPermissionsForRole,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  isAtLeast,
  ROLE_PERMISSIONS,
} from "@/lib/rbac";

describe("rbac", () => {
  it("grants admin every permission", () => {
    expect(hasPermission("admin", "users:manage")).toBe(true);
    expect(hasPermission("admin", "invoices:void")).toBe(true);
    expect(getPermissionsForRole("admin").length).toBeGreaterThan(
      getPermissionsForRole("viewer").length
    );
  });

  it("restricts viewer to read-only permissions", () => {
    expect(hasPermission("viewer", "customers:view")).toBe(true);
    expect(hasPermission("viewer", "customers:create")).toBe(false);
    expect(hasPermission("viewer", "users:manage")).toBe(false);
  });

  it("does not let manager manage users", () => {
    expect(hasPermission("manager", "users:manage")).toBe(false);
    expect(hasPermission("manager", "invoices:void")).toBe(true);
  });

  it("evaluates all/any permission sets", () => {
    expect(hasAllPermissions("manager", ["customers:view", "projects:view"])).toBe(true);
    expect(hasAllPermissions("user", ["customers:view", "invoices:void"])).toBe(false);
    expect(hasAnyPermission("viewer", ["users:manage", "reports:view"])).toBe(true);
  });

  it("compares role seniority", () => {
    expect(isAtLeast("admin", "manager")).toBe(true);
    expect(isAtLeast("user", "manager")).toBe(false);
    expect(isAtLeast("manager", "manager")).toBe(true);
  });

  it("keeps user permissions free of destructive actions", () => {
    expect(ROLE_PERMISSIONS.user).not.toContain("customers:delete");
    expect(ROLE_PERMISSIONS.user).not.toContain("invoices:void");
  });
});
