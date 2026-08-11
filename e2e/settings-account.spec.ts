import { test, expect } from "@playwright/test";
import { loginAs, uniqueSuffix } from "./helpers";

test.describe("settings", () => {
  test("admin can edit and save organization settings", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    const org = page.getByLabel("Organization name");
    const value = `Nexus Ops ${uniqueSuffix()}`;
    await org.fill(value);
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText(/settings saved/i)).toBeVisible();
  });

  test("tabs expose access matrix and audit log", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.goto("/settings");
    await page.getByRole("tab", { name: /access control/i }).click();
    await expect(page.getByText(/role-based access control/i)).toBeVisible();
    await page.getByRole("tab", { name: /audit log/i }).click();
    await expect(page.getByText(/security-relevant events/i)).toBeVisible();
  });

  test("manager sees a read-only settings notice", async ({ page }) => {
    await loginAs(page, "Manager");
    await page.goto("/settings");
    await expect(page.getByText(/read-only access to settings/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /save changes/i })).toHaveCount(0);
  });
});

test.describe("account profile", () => {
  test("updates the profile and shows a confirmation", async ({ page }) => {
    await loginAs(page, "Admin");
    await page.goto("/account");
    await expect(page.getByRole("heading", { name: /profile/i })).toBeVisible();
    await page.getByLabel("Job title").fill(`Chief ${uniqueSuffix()}`);
    await page.getByRole("button", { name: /save profile/i }).click();
    await expect(page.getByText(/profile updated/i)).toBeVisible();
  });
});
