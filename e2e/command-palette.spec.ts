import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("global command palette (⌘K)", () => {
  test("opens with the keyboard shortcut and navigates to a customer", async ({
    page,
  }) => {
    await loginAs(page, "Admin");
    await page.keyboard.press("ControlOrMeta+k");
    const search = page.getByLabel("Command palette search");
    await expect(search).toBeVisible();
    await search.fill("Northwind");
    const option = page.getByRole("option", { name: /northwind/i }).first();
    await expect(option).toBeVisible();
    await option.click();
    await expect(page).toHaveURL(/\/customers\/cus_/);
  });

  test("opens from the topbar search button", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.getByRole("button", { name: /open search/i }).click();
    await expect(page.getByLabel("Command palette search")).toBeVisible();
    // Empty query shows results; a nonsense query shows the empty state.
    await page.getByLabel("Command palette search").fill("zzz-nothing-zzz");
    await expect(page.getByText(/no results/i)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByLabel("Command palette search")).toHaveCount(0);
  });

  test("jump-to-page navigation works", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.keyboard.press("ControlOrMeta+k");
    await page.getByLabel("Command palette search").fill("Audit");
    await page
      .getByRole("option", { name: /audit log/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/audit$/);
  });

  test("quick-create action opens the new-customer dialog", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.keyboard.press("ControlOrMeta+k");
    await page.getByLabel("Command palette search").fill("New customer");
    await page
      .getByRole("option", { name: /new customer/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/customers\?new=1/);
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("navigation commands respect permissions (viewer has no Users)", async ({
    page,
  }) => {
    await loginAs(page, "Viewer");
    await page.keyboard.press("ControlOrMeta+k");
    await page.getByLabel("Command palette search").fill("Users");
    await expect(page.getByRole("option", { name: /^Users/ })).toHaveCount(0);
  });
});
