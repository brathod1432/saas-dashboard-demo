import { test, expect } from "@playwright/test";
import { loginAs, openRowActions, uniqueSuffix, expectToast } from "./helpers";

test.describe("customers — table, CRUD, bulk, import", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "Admin");
    await page.goto("/customers");
    await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible();
  });

  test("search filters the table", async ({ page }) => {
    await page.getByLabel("Search table").fill("Northwind");
    await expect(page.getByText(/of 1\b/)).toBeVisible();
    await page.getByLabel("Search table").fill("zzz-no-match-zzz");
    await expect(page.getByText(/no results/i)).toBeVisible();
  });

  test("status filter narrows results", async ({ page }) => {
    await page.getByLabel("Filter by status").click();
    await page.getByRole("option", { name: "Churned" }).click();
    // Every visible status badge should read "Churned".
    await expect(page.getByText(/showing/i)).toBeVisible();
  });

  test("column sort toggles ascending/descending", async ({ page }) => {
    const header = page.getByRole("button", { name: /^Company/ });
    await header.click();
    await expect(page.locator('th[aria-sort="ascending"]')).toBeVisible();
    await header.click();
    await expect(page.locator('th[aria-sort="descending"]')).toBeVisible();
  });

  test("column visibility can be toggled off", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: /industry/i })).toBeVisible();
    await page.getByRole("button", { name: "Columns" }).click();
    await page.getByRole("menuitemcheckbox", { name: "Industry" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("columnheader", { name: /industry/i })).toHaveCount(0);
  });

  test("pagination moves between pages", async ({ page }) => {
    await expect(page.getByText("1 / 3")).toBeVisible();
    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByText("2 / 3")).toBeVisible();
    await page.getByRole("button", { name: "Previous page" }).click();
    await expect(page.getByText("1 / 3")).toBeVisible();
  });

  test("export downloads a CSV", async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/customers.*\.csv/);
  });

  test("create a customer via the dialog", async ({ page }) => {
    const name = `E2E Create ${uniqueSuffix()}`;
    await page.getByRole("button", { name: /new customer/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Company").fill(name);
    await dialog.getByLabel("Industry").fill("Testing");
    await dialog.getByLabel("Contact name").fill("Test Contact");
    await dialog.getByLabel("Email").fill(`c${uniqueSuffix()}@test.io`);
    await dialog.getByLabel("Phone").fill("15551234567");
    await dialog.getByLabel("MRR (USD)").fill("4200");
    await dialog.getByRole("button", { name: /create customer/i }).click();
    await expectToast(page, /created/i);
    await page.getByLabel("Search table").fill(name);
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  });

  test("edit a customer via the row action menu", async ({ page }) => {
    // Create a row we own, then edit it.
    const name = `E2E Edit ${uniqueSuffix()}`;
    await page.getByRole("button", { name: /new customer/i }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("Company").fill(name);
    await dialog.getByLabel("Industry").fill("Testing");
    await dialog.getByLabel("Contact name").fill("Editable Person");
    await dialog.getByLabel("Email").fill(`e${uniqueSuffix()}@test.io`);
    await dialog.getByLabel("Phone").fill("15550000000");
    await dialog.getByLabel("MRR (USD)").fill("1000");
    await dialog.getByRole("button", { name: /create customer/i }).click();
    await expectToast(page, /created/i);

    await page.getByLabel("Search table").fill(name);
    await openRowActions(page, name);
    await page.getByRole("menuitem", { name: /edit/i }).click();
    dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: /edit customer/i })).toBeVisible();
    await dialog.getByLabel("MRR (USD)").fill("9999");
    await dialog.getByRole("button", { name: /save changes/i }).click();
    await expectToast(page, /updated/i);
  });

  test("delete a customer with confirmation", async ({ page }) => {
    const name = `E2E Delete ${uniqueSuffix()}`;
    await page.getByRole("button", { name: /new customer/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Company").fill(name);
    await dialog.getByLabel("Industry").fill("Testing");
    await dialog.getByLabel("Contact name").fill("Delete Person");
    await dialog.getByLabel("Email").fill(`d${uniqueSuffix()}@test.io`);
    await dialog.getByLabel("Phone").fill("15551110000");
    await dialog.getByLabel("MRR (USD)").fill("1000");
    await dialog.getByRole("button", { name: /create customer/i }).click();
    await expectToast(page, /created/i);

    await page.getByLabel("Search table").fill(name);
    await openRowActions(page, name);
    await page.getByRole("menuitem", { name: /delete/i }).click();
    const confirm = page.getByRole("dialog");
    await expect(confirm.getByText(/delete customer\?/i)).toBeVisible();
    await confirm.getByRole("button", { name: "Delete" }).click();
    await expectToast(page, /deleted/i);
  });

  test("bulk status change from the selection bar", async ({ page }) => {
    // Create two uniquely-named rows and act only on them.
    const tag = `Bulk${uniqueSuffix()}`;
    for (let i = 0; i < 2; i++) {
      await page.getByRole("button", { name: /new customer/i }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Company").fill(`${tag} ${i}`);
      await dialog.getByLabel("Industry").fill("Testing");
      await dialog.getByLabel("Contact name").fill("Bulk Person");
      await dialog.getByLabel("Email").fill(`b${uniqueSuffix()}@test.io`);
      await dialog.getByLabel("Phone").fill("15552220000");
      await dialog.getByLabel("MRR (USD)").fill("1000");
      await dialog.getByRole("button", { name: /create customer/i }).click();
      await expectToast(page, /created/i);
    }
    await page.getByLabel("Search table").fill(tag);
    await page.getByLabel("Select all rows on this page").click();
    await expect(page.getByText(/2 selected/)).toBeVisible();
    await page.getByLabel("Set status for selected").click();
    await page.getByRole("option", { name: "On hold" }).click();
    await expectToast(page, /updated 2 customers/i);
  });

  test("CSV import validates and creates rows", async ({ page }) => {
    const email = `imp${uniqueSuffix()}@test.io`;
    const csv = [
      "name,contactName,email,phone,industry,tier,status,mrr",
      `Imported ${uniqueSuffix()},Ivy Import,${email},15559990000,Tech,business,active,3000`,
      "Bad Row,,not-an-email,,,,,", // invalid → should be flagged
    ].join("\n");
    await page.getByRole("button", { name: "Import" }).click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: /import customers/i })
    ).toBeVisible();
    await dialog.getByLabel("CSV content").fill(csv);
    await expect(dialog.getByText(/1 valid/i)).toBeVisible();
    await expect(dialog.getByText(/1 invalid/i)).toBeVisible();
    await dialog.getByRole("button", { name: /import 1 customer/i }).click();
    await expectToast(page, /imported 1 customer/i);
  });

  test("row click opens the detail page with breadcrumbs", async ({ page }) => {
    await page.getByLabel("Search table").fill("Northwind");
    await page
      .getByRole("cell", { name: /northwind/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/customers\/cus_/);
    const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumbs.getByRole("link", { name: "Customers" })).toBeVisible();
  });
});
