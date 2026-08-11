import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("notifications center", () => {
  test("mark all read clears the unread count", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.getByRole("button", { name: /notifications/i }).click();
    // Mark all read, then the button label should report no unread.
    const markAll = page.getByRole("button", { name: /mark all read/i });
    if (await markAll.isVisible()) {
      await markAll.click();
    }
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: /^Notifications$/ })).toBeVisible();
  });

  test("an alert can be dismissed", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.getByRole("button", { name: /notifications/i }).click();
    const dismissButtons = page.getByRole("button", { name: /^Dismiss / });
    const before = await dismissButtons.count();
    test.skip(before === 0, "no alerts to dismiss in seed");
    await dismissButtons.first().click();
    await expect(dismissButtons).toHaveCount(before - 1);
  });
});
