# Phase 19 — Testing

> Strategy, tooling, and how to run everything. Current status: **71 Jest tests** and
> **59 Playwright E2E tests** (per browser) passing; core-logic coverage ≈ **87% statements /
> 79% branches**.

## Test pyramid

| Layer         | Tool                                 | Scope                                                                                                       |
| ------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Unit          | Jest                                 | RBAC, session signing, query engine, validation schemas, utils, service authorization                       |
| Component     | Jest + React Testing Library         | Button, `<Can>` gate, DataTable, state components                                                           |
| Accessibility | jest-axe (unit) + Playwright (flows) | Zero-violation assertions on key components                                                                 |
| Integration   | Jest (services)                      | Authorization + validation across service→repository                                                        |
| E2E           | Playwright                           | Every feature end-to-end: auth, RBAC, CRUD, bulk, import, search, palette, users, settings, audit, security |

## Running

```bash
npm test            # Jest (watch: npm run test:watch)
npm run coverage    # Jest with coverage + thresholds
npm run e2e         # Playwright (all browsers; builds & starts prod server)
npm run e2e:install # one-time: install Playwright browsers
```

Config: `jest.config.ts` (via `next/jest`), `jest.setup.ts` (jest-dom, jest-axe,
Text/crypto/matchMedia/ResizeObserver polyfills), `playwright.config.ts` (chromium/firefox/
webkit; local run reuses a running server, CI builds & starts).

## What's covered (Jest)

- **`lib/rbac`** — per-role permissions, all/any checks, seniority, no destructive perms for
  user (`rbac.test.ts`).
- **`lib/auth/session`** — sign/verify round-trip, expiry, tamper + malformed rejection.
- **`lib/api/repositories/query`** — search, status filter, asc/desc sort, pagination.
- **`lib/validation`** — login/register (confirm match, terms), customer create.
- **`lib/utils`** — cn merge, currency/compact/percent, initials.
- **`lib/api/services`** — viewer 403 on create/void, admin success, invalid-input 400
  (defense-in-depth authorization).
- **components** — Button (click/disabled/asChild/axe), `<Can>` (grant/deny), DataTable
  (search/sort/aria-sort/selection/empty/axe/landmark), states (empty/error/status/axe).

## What's covered (Playwright — `e2e/`)

59 tests per browser across the whole product. Helpers live in `e2e/helpers.ts` (login,
unique data, row-action + toast utilities).

- `auth.spec.ts` — landing, unauth redirect (`/login?next=`), quick login, credential login +
  logout, invalid-credential toast.
- `auth-forms.spec.ts` — login inline validation, register (empty errors, password-mismatch,
  simulated success → `/login`), forgot-password confirmation state.
- `rbac.spec.ts` — viewer hides create actions & Settings nav; admin sees them; viewer
  redirected from `/settings`.
- `dashboard.spec.ts` — KPIs/charts/activity render, table search+pagination, create dialog,
  theme toggle → `.dark`.
- `customers.spec.ts` — search, status filter, sort (asc/desc), column visibility, pagination,
  CSV export (download), create, edit + delete (row actions + confirm), bulk status change, CSV
  import (valid/invalid preview), row → detail with breadcrumbs.
- `projects.spec.ts` — create (with customer select), edit, delete, bulk delete, detail
  breadcrumbs.
- `insights.spec.ts` — invoices list + search, reports period selector (`?period=3` re-slice),
  analytics renders.
- `command-palette.spec.ts` — ⌘K open + entity navigate; topbar-button open + empty state;
  jump-to-page; quick-create action opens the dialog; permission-aware nav (viewer has no Users).
- `notifications.spec.ts` — mark-all-read clears the unread badge; dismiss removes an alert.
- `users.spec.ts` — admin changes a member's role; self-lockout guard; non-admins redirected.
- `settings-account.spec.ts` — admin saves org settings; access-matrix/audit tabs; manager
  read-only notice; account profile update.
- `audit.spec.ts` — search, severity filter, CSV export; viewer redirected.
- `navigation.spec.ts` — every sidebar route, landmarks + skip link, theme persists on reload.
- `security.spec.ts` — security headers (incl. COOP/CORP/cross-domain), `no-store` on authed
  APIs, login rate-limit `429` + `Retry-After`, cross-site login + logout blocked `403` (CSRF).

> **Browser support:** the suite passes on **Chromium** and **Firefox** locally and in CI.
> **WebKit** is included in the config and runs in Linux CI; on some Windows hosts the WebKit
> build is slow/unstable to launch, so validate WebKit in CI or on macOS.

## Coverage policy

Coverage is scoped (in `jest.config.ts`) to **business logic + reusable components**, where
unit tests concentrate; pages and feature flows are covered by E2E. Thresholds: statements 78 /
branches 72 / functions 55 / lines 78. This keeps the gate meaningful rather than diluted by
presentational page code.

## Conventions

- Test files colocated in `__tests__/` next to the code, `*.test.ts(x)`; E2E in `e2e/*.spec.ts`.
- Query by **role/label** (accessible queries) over test ids.
- Every reusable component test includes a jest-axe assertion.
- Assert behavior and a11y, not implementation details.

## CI recommendation

`npm ci` → `npm run lint` → `npm run typecheck` → `npm run coverage` → `npm run build` →
`npm run e2e` (with `CI=1`, which enables retries + serial workers + prod webServer).
