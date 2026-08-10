import { test, expect, type Page } from "@playwright/test";

async function loginAs(page: Page, role: "Admin" | "Manager" | "User" | "Viewer") {
  await page.goto("/login");
  await page.getByRole("button", { name: role, exact: true }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30000 });
}

test.describe("role-based access control", () => {
  test("viewer does not see create actions or the settings nav", async ({ page }) => {
    await loginAs(page, "Viewer");
    await page.goto("/customers");
    await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible();
    // Viewer lacks customers:create → no "New customer" button.
    await expect(page.getByRole("button", { name: /new customer/i })).toHaveCount(0);
    // Viewer lacks settings:view → no Settings nav link.
    await expect(page.getByRole("link", { name: "Settings" })).toHaveCount(0);
  });

  test("admin sees create actions and settings", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.goto("/customers");
    await expect(page.getByRole("button", { name: /new customer/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });

  test("viewer is redirected away from a page they lack permission for", async ({
    page,
  }) => {
    await loginAs(page, "Viewer");
    await page.goto("/settings");
    // requirePermission redirects viewers to the dashboard with a denied flag.
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
