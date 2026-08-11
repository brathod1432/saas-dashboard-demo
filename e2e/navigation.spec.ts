import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

const ROUTES: { link: string; url: RegExp }[] = [
  { link: "Dashboard", url: /\/dashboard$/ },
  { link: "Customers", url: /\/customers$/ },
  { link: "Projects", url: /\/projects$/ },
  { link: "Invoices", url: /\/invoices$/ },
  { link: "Reports", url: /\/reports/ },
  { link: "Analytics", url: /\/analytics$/ },
  { link: "Users", url: /\/users$/ },
  { link: "Audit log", url: /\/audit$/ },
  { link: "Settings", url: /\/settings$/ },
  { link: "Account", url: /\/account$/ },
  { link: "Help", url: /\/help$/ },
  { link: "Showcase", url: /\/showcase$/ },
];

test.describe("navigation, landmarks & theme", () => {
  test("admin can navigate to every section via the sidebar", async ({ page }) => {
    await loginAs(page, "Admin");
    for (const route of ROUTES) {
      await page.getByRole("link", { name: route.link, exact: true }).first().click();
      await expect(page).toHaveURL(route.url);
      await expect(page.locator("#main-content")).toBeVisible();
    }
  });

  test("core landmarks and skip link exist", async ({ page }) => {
    await loginAs(page, "Admin");
    await expect(page.getByRole("complementary", { name: "Primary" })).toBeVisible();
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /skip to main content/i })
    ).toBeAttached();
  });

  test("theme preference persists across reloads", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.getByRole("button", { name: /toggle color theme/i }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
