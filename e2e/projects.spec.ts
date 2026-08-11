import { test, expect } from "@playwright/test";
import { loginAs, openRowActions, uniqueSuffix } from "./helpers";

async function createProject(page: import("@playwright/test").Page, name: string) {
  await page.getByRole("button", { name: /new project/i }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Project name").fill(name);
  await dialog.getByLabel("Customer").click();
  await page.getByRole("option", { name: "Northwind Logistics" }).click();
  await dialog.getByLabel("Budget (USD)").fill("50000");
  await dialog.getByLabel("Due date").fill("2026-12-31");
  await dialog.getByRole("button", { name: /create project/i }).click();
  await expect(page.getByText(/created/i)).toBeVisible();
}

test.describe("projects — CRUD, bulk, detail", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "Admin");
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  });

  test("create a project for a customer", async ({ page }) => {
    await createProject(page, `E2E Project ${uniqueSuffix()}`);
  });

  test("edit a project via the row action menu", async ({ page }) => {
    const name = `E2E ProjEdit ${uniqueSuffix()}`;
    await createProject(page, name);
    await page.getByLabel("Search table").fill(name);
    await openRowActions(page, name);
    await page.getByRole("menuitem", { name: /edit/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: /edit project/i })).toBeVisible();
    await dialog.getByLabel("Budget (USD)").fill("75000");
    await dialog.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText(/project updated/i)).toBeVisible();
  });

  test("delete a project with confirmation", async ({ page }) => {
    const name = `E2E ProjDelete ${uniqueSuffix()}`;
    await createProject(page, name);
    await page.getByLabel("Search table").fill(name);
    await openRowActions(page, name);
    await page.getByRole("menuitem", { name: /delete/i }).click();
    const confirm = page.getByRole("dialog");
    await expect(confirm.getByText(/delete project\?/i)).toBeVisible();
    await confirm.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText(/project deleted/i)).toBeVisible();
  });

  test("bulk delete selected projects", async ({ page }) => {
    const tag = `PBulk${uniqueSuffix()}`;
    await createProject(page, `${tag} A`);
    await createProject(page, `${tag} B`);
    await page.getByLabel("Search table").fill(tag);
    await page.getByLabel("Select all rows on this page").click();
    await expect(page.getByText(/2 selected/)).toBeVisible();
    await page.getByRole("button", { name: "Delete" }).click();
    const confirm = page.getByRole("dialog");
    await expect(confirm.getByText(/delete 2 projects\?/i)).toBeVisible();
    await confirm.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText(/deleted 2 projects/i)).toBeVisible();
  });

  test("project detail page shows breadcrumbs", async ({ page }) => {
    await page.getByRole("row").nth(1).click();
    await expect(page).toHaveURL(/\/projects\/prj_/);
    const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumbs.getByRole("link", { name: "Projects" })).toBeVisible();
  });
});
