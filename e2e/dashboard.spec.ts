import { test, expect, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Admin", exact: true }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30000 });
}

test.describe("dashboard & data flows", () => {
  test("renders KPIs, charts, and activity", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByText("Monthly Revenue")).toBeVisible();
    await expect(page.getByText("Active Users")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /revenue vs\. target/i })
    ).toBeVisible();
    await expect(page.getByLabel("Recent activity")).toBeVisible();
  });

  test("customers table supports search and pagination", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/customers");
    const search = page.getByLabel("Search table");
    await expect(search).toBeVisible();
    await search.fill("Northwind");
    await expect(page.getByText(/of 1\b/)).toBeVisible();
  });

  test("can create a customer via the dialog", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/customers");
    await page.getByRole("button", { name: /new customer/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel("Company").fill("E2E Test Corp");
    await page.getByLabel("Industry").fill("Testing");
    await page.getByLabel("Contact name").fill("Test Contact");
    await page.getByLabel("Email").fill("e2e@testcorp.com");
    await page.getByLabel("Phone").fill("15551234567");
    await page.getByLabel("MRR (USD)").fill("5000");
    await page.getByRole("button", { name: /create customer/i }).click();
    await expect(page.getByText(/created/i)).toBeVisible();
  });

  test("theme toggle switches to dark mode", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("button", { name: /toggle color theme/i }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
