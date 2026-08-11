import { expect, type Page } from "@playwright/test";

export type Role = "Admin" | "Manager" | "User" | "Viewer";

/** Quick demo sign-in via the role buttons on the login page. */
export async function loginAs(page: Page, role: Role) {
  await page.goto("/login");
  await page.getByRole("button", { name: role, exact: true }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
}

/** A short, collision-resistant suffix for unique test data. */
export function uniqueSuffix() {
  return `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
}

/** Open a row's action menu in a DataTable by the row's accessible name. */
export async function openRowActions(page: Page, name: string) {
  await page.getByRole("button", { name: `Actions for ${name}` }).click();
}

/**
 * Assert a Sonner toast with matching text appears. Scoping to the toaster avoids
 * strict-mode collisions with page text (e.g. a "Created" table column header).
 */
export async function expectToast(page: Page, text: RegExp | string) {
  const toast = page.locator("[data-sonner-toast]").filter({ hasText: text });
  await expect(toast.first()).toBeVisible();
}
