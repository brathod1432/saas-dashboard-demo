// Captures reference screenshots of the running app into docs/screenshots/.
// Usage: start the app (npm run dev), then: node scripts/capture-screenshots.mjs
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "docs/screenshots";

async function shot(page, name, { full = false } = {}) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  console.log(`captured ${name}.png`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Public pages
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await shot(page, "01-landing");

  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await shot(page, "02-login");

  // Authenticate as Admin via quick login
  await page.getByRole("button", { name: "Admin", exact: true }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  await page.waitForTimeout(1200); // let charts render

  const pages = [
    { path: "/dashboard", name: "03-dashboard", full: true },
    { path: "/customers", name: "05-customers", full: true },
    { path: "/customers/cus_001", name: "06-customer-detail", full: true },
    { path: "/projects", name: "07-projects", full: true },
    { path: "/invoices", name: "08-invoices", full: true },
    { path: "/reports", name: "09-reports", full: true },
    { path: "/analytics", name: "10-analytics", full: true },
    { path: "/users", name: "13-users", full: true },
    { path: "/showcase", name: "12-showcase", full: true },
  ];

  // Dark-mode dashboard: flip the theme toggle first.
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /toggle color theme/i }).click();
  await page.waitForTimeout(1000);
  await shot(page, "04-dashboard-dark", { full: true });
  // back to light for the rest
  await page.getByRole("button", { name: /toggle color theme/i }).click();
  await page.waitForTimeout(400);

  for (const p of pages) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    await shot(page, p.name, { full: p.full });
  }

  // Settings → Access control (RBAC matrix)
  await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: /access control/i }).click();
  await page.waitForTimeout(500);
  await shot(page, "11-settings-rbac", { full: true });

  await browser.close();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
