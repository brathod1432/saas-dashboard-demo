import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("audit log page", () => {
  test("admin can search, filter, and export the audit trail", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.goto("/audit");
    await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible();

    // Search by action.
    await page.getByLabel("Search table").fill("auth.login");
    await expect(page.getByText(/showing/i)).toBeVisible();
    await page.getByLabel("Search table").fill("");

    // Filter by severity.
    await page.getByLabel("Filter by status").click();
    await page.getByRole("option", { name: "Critical" }).click();
    await expect(page.getByText(/showing/i)).toBeVisible();

    // Export CSV.
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/audit-log.*\.csv/);
  });

  test("viewer is redirected away from /audit", async ({ page }) => {
    await loginAs(page, "Viewer");
    await page.goto("/audit");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("link", { name: "Audit log" })).toHaveCount(0);
  });
});
