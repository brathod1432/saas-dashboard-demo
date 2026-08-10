import { settingsService } from "@/lib/api/services/settings.service";
import { auditService } from "@/lib/api/services/audit.service";
import { usersService } from "@/lib/api/services/users.service";
import { ApiError } from "@/lib/api/errors";
import type { Actor } from "@/lib/api/services/authorize";

const admin: Actor = { id: "usr_admin", name: "Admin", role: "admin" };
const manager: Actor = { id: "usr_manager", name: "Manager", role: "manager" };
const viewer: Actor = { id: "usr_viewer", name: "Viewer", role: "viewer" };

const validSettings = {
  organizationName: "Acme Corp",
  timezone: "UTC",
  weeklyDigest: false,
  securityAlerts: true,
  twoFactor: true,
};

describe("settingsService", () => {
  it("managers can read settings but not edit them", () => {
    expect(settingsService.get(manager).organizationName).toBeTruthy();
    expect(() => settingsService.update(manager, validSettings)).toThrow(ApiError);
    // viewers cannot even read settings
    expect(() => settingsService.get(viewer)).toThrow(ApiError);
  });

  it("admins can update settings and changes are returned", () => {
    const updated = settingsService.update(admin, validSettings);
    expect(updated.organizationName).toBe("Acme Corp");
    expect(updated.twoFactor).toBe(true);
  });

  it("rejects invalid settings payloads", () => {
    expect(() =>
      settingsService.update(admin, { ...validSettings, organizationName: "" })
    ).toThrow(ApiError);
  });
});

describe("auditService", () => {
  it("allows roles with audit:view and blocks those without", () => {
    expect(Array.isArray(auditService.list(manager))).toBe(true);
    expect(() => auditService.list(viewer)).toThrow(ApiError);
  });
});

describe("usersService.updateProfile", () => {
  it("updates the caller's own profile", () => {
    const updated = usersService.updateProfile(admin, {
      name: "Renamed Admin",
      title: "Chief",
      department: "Executive",
    });
    expect(updated.name).toBe("Renamed Admin");
    expect(updated.title).toBe("Chief");
  });

  it("rejects invalid profile input", () => {
    expect(() => usersService.updateProfile(admin, { name: "" })).toThrow(ApiError);
  });
});
