import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("user & team management", () => {
  test("admin can change another member's role", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.goto("/users");
    await expect(page.getByRole("heading", { name: /users & team/i })).toBeVisible();
    await page.getByLabel("Role for Kai Tanaka").click();
    await page.getByRole("option", { name: "Viewer" }).click();
    await expect(page.getByText(/kai tanaka is now viewer/i)).toBeVisible();
  });

  test("admin cannot demote their own admin role (self-lockout guard)", async ({
    page,
  }) => {
    await loginAs(page, "Admin");
    await page.goto("/users");
    await page.getByLabel("Role for Priya Sharma").click();
    await page.getByRole("option", { name: "Viewer" }).click();
    await expect(page.getByText(/cannot change your own admin role/i)).toBeVisible();
  });

  test("non-admins are redirected away from /users", async ({ page }) => {
    await loginAs(page, "Manager");
    await page.goto("/users");
    await expect(page).toHaveURL(/\/dashboard/);
    // And the nav never shows the Users link for them.
    await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);
  });
});
