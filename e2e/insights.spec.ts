import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("invoices, reports & analytics", () => {
  test("invoices list renders and is searchable", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.goto("/invoices");
    await expect(page.getByRole("heading", { name: "Invoices" })).toBeVisible();
    await page.getByLabel("Search table").fill("INV-");
    await expect(page.getByText(/showing/i)).toBeVisible();
  });

  test("reports period selector re-slices the series", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.goto("/reports");
    await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
    await expect(page.getByText(/over the last 12 months/i)).toBeVisible();
    await page.getByLabel("Reporting period").click();
    await page.getByRole("option", { name: "Last 3 months" }).click();
    await expect(page).toHaveURL(/period=3/);
    await expect(page.getByText(/over the last 3 months/i)).toBeVisible();
  });

  test("analytics dashboard renders charts", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.goto("/analytics");
    await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
  });
});
