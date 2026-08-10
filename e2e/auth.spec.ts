import { test, expect } from "@playwright/test";

test.describe("authentication & routing", () => {
  test("landing page renders and links to sign in", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /secure, accessible foundation/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /explore the demo/i })).toBeVisible();
  });

  test("unauthenticated access to a protected route redirects to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  });

  test("admin can sign in via quick login and reach the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Admin", exact: true }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  });

  test("sign in with credentials then sign out", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("manager@nexusops.demo");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });

    await page.getByRole("button", { name: /account menu/i }).click();
    await page.getByRole("menuitem", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("invalid credentials show an error toast", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@nexusops.demo");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });
});
