import { test, expect } from "@playwright/test";

test.describe("auth forms — validation & flows", () => {
  test("login shows inline validation errors", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("x");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/enter a valid email address/i)).toBeVisible();
    await expect(page.getByText(/password must be at least 6/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("register validates then simulates account creation", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: /create your account/i })
    ).toBeVisible();

    // Empty submit surfaces field errors.
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/enter your full name/i)).toBeVisible();

    // Password mismatch is caught.
    await page.getByLabel("Full name").fill("Test User");
    await page.getByLabel("Work email").fill("test.user@example.com");
    await page.getByLabel("Company").fill("Acme Inc.");
    await page.getByLabel(/^Password/).fill("Password1");
    await page.getByLabel("Confirm password").fill("Password2");
    await page.getByLabel(/terms of service/i).check();
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();

    // Fix it → simulated success + redirect to login.
    await page.getByLabel("Confirm password").fill("Password1");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/account created/i)).toBeVisible();
    await page.waitForURL(/\/login/, { timeout: 15_000 });
  });

  test("forgot password shows the confirmation state", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("someone@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.getByRole("heading", { name: /check your inbox/i })).toBeVisible();
  });
});
