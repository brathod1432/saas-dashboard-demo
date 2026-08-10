import { customersService } from "@/lib/api/services/customers.service";
import { invoicesService } from "@/lib/api/services/invoices.service";
import { projectsService } from "@/lib/api/services/projects.service";
import { ApiError } from "@/lib/api/errors";
import type { Actor } from "@/lib/api/services/authorize";

const admin: Actor = { id: "usr_admin", name: "Admin", role: "admin" };
const manager: Actor = { id: "usr_manager", name: "Manager", role: "manager" };
const viewer: Actor = { id: "usr_viewer", name: "Viewer", role: "viewer" };

const customerInput = {
  name: "Test Co",
  contactName: "Test Person",
  email: "test@example.com",
  phone: "1234567",
  industry: "Tech",
  tier: "business" as const,
  status: "active" as const,
  mrr: 1000,
};

describe("service authorization (defense in depth)", () => {
  it("allows a viewer to list customers", () => {
    expect(() => customersService.list(viewer, {})).not.toThrow();
  });

  it("blocks a viewer from creating a customer with 403", () => {
    expect.assertions(2);
    try {
      customersService.create(viewer, customerInput);
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(403);
    }
  });

  it("allows an admin to create a customer", () => {
    const created = customersService.create(admin, customerInput);
    expect(created.id).toMatch(/^cus_/);
    expect(created.ownerId).toBe("usr_admin");
  });

  it("blocks a viewer from voiding an invoice", () => {
    expect(() => invoicesService.void(viewer, "inv_001")).toThrow(ApiError);
  });

  it("rejects invalid customer input for an authorized actor", () => {
    expect(() =>
      customersService.create(admin, { ...customerInput, email: "not-an-email" })
    ).toThrow(ApiError);
  });

  it("only admins can delete a customer (delete is admin-only)", () => {
    // manager lacks customers:delete
    expect(() => customersService.remove(manager, "cus_001")).toThrow(ApiError);
    // admin can delete a freshly created customer
    const created = customersService.create(admin, customerInput);
    expect(customersService.remove(admin, created.id)).toEqual({ id: created.id });
  });

  it("only admins can delete a project", () => {
    expect(() => projectsService.remove(manager, "prj_001")).toThrow(ApiError);
    const created = projectsService.create(admin, {
      name: "Temp Project",
      customerId: "cus_001",
      status: "planning",
      priority: "low",
      budget: 1000,
      dueDate: "2026-12-31",
    });
    expect(projectsService.remove(admin, created.id)).toEqual({ id: created.id });
  });
});
