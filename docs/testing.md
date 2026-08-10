# Phase 19 — Testing

> Strategy, tooling, and how to run everything. Current status: **45 Jest tests** and
> **12 Playwright E2E tests** passing; core-logic coverage ≈ **84% statements / 82% branches**.

## Test pyramid

| Layer         | Tool                                 | Scope                                                                                 |
| ------------- | ------------------------------------ | ------------------------------------------------------------------------------------- |
| Unit          | Jest                                 | RBAC, session signing, query engine, validation schemas, utils, service authorization |
| Component     | Jest + React Testing Library         | Button, `<Can>` gate, DataTable, state components                                     |
| Accessibility | jest-axe (unit) + Playwright (flows) | Zero-violation assertions on key components                                           |
| Integration   | Jest (services)                      | Authorization + validation across service→repository                                  |
| E2E           | Playwright                           | Auth flow, protected routing, RBAC visibility, dashboard/data flows, theme            |

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

- `auth.spec.ts` — landing, unauth redirect (`/login?next=`), quick login, credential login +
  logout, invalid-credential toast.
- `rbac.spec.ts` — viewer hides create actions & Settings nav; admin sees them; viewer
  redirected from `/settings`.
- `dashboard.spec.ts` — KPIs/charts/activity render, table search+pagination, create-customer
  dialog, theme toggle → `.dark`.

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
