import { usersService } from "@/lib/api/services/users.service";
import { ApiError } from "@/lib/api/errors";
import type { Actor } from "@/lib/api/services/authorize";

const admin: Actor = { id: "usr_admin", name: "Admin", role: "admin" };
const manager: Actor = { id: "usr_manager", name: "Manager", role: "manager" };

describe("usersService", () => {
  it("only admins can list users", () => {
    expect(() => usersService.list(manager)).toThrow(ApiError);
    expect(usersService.list(admin).length).toBeGreaterThan(0);
  });

  it("admin can change another user's role", () => {
    const updated = usersService.updateRole(admin, "usr_kai", "viewer");
    expect(updated.role).toBe("viewer");
  });

  it("prevents an admin from changing their own admin role (self-lockout)", () => {
    expect(() => usersService.updateRole(admin, "usr_admin", "viewer")).toThrow(ApiError);
  });

  it("rejects an invalid role", () => {
    expect(() => usersService.updateRole(admin, "usr_kai", "superuser" as never)).toThrow(
      ApiError
    );
  });

  it("blocks non-admins from changing roles", () => {
    expect(() => usersService.updateRole(manager, "usr_kai", "admin")).toThrow(ApiError);
  });
});
