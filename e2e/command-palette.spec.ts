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
});
