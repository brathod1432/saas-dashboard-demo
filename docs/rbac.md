# Phase 9 — Role-Based Access Control

> Source of truth: `src/lib/rbac/permissions.ts` (matrix) and `src/lib/rbac/index.ts` (helpers).
> Enforced in **three layers** — proxy (route), service (operation), and UI (`<Can>`).

## Roles

| Role        | Rank | Description                                                       |
| ----------- | ---- | ----------------------------------------------------------------- |
| **Admin**   | 4    | Full access incl. user management and settings edit.              |
| **Manager** | 3    | Manage customers/projects/invoices; view reports/analytics/audit. |
| **User**    | 2    | Create/edit own work; no destructive actions, no user management. |
| **Viewer**  | 1    | Read-only access to dashboards and reports.                       |

Definitions and ranks: `ROLE_DEFINITIONS`. Seniority comparison: `isAtLeast(role, min)`.

## Permission model

Permissions are `resource:action` strings (`PERMISSIONS`). The role→permission mapping is
**explicit per role** (not inherited) so effective access is auditable at a glance.

## Permission matrix

| Permission       | Admin | Manager | User | Viewer |
| ---------------- | :---: | :-----: | :--: | :----: |
| dashboard:view   |  ✅   |   ✅    |  ✅  |   ✅   |
| customers:view   |  ✅   |   ✅    |  ✅  |   ✅   |
| customers:create |  ✅   |   ✅    |  ✅  |   —    |
| customers:edit   |  ✅   |   ✅    |  ✅  |   —    |
| customers:delete |  ✅   |    —    |  —   |   —    |
| projects:view    |  ✅   |   ✅    |  ✅  |   ✅   |
| projects:create  |  ✅   |   ✅    |  ✅  |   —    |
| projects:edit    |  ✅   |   ✅    |  ✅  |   —    |
| projects:delete  |  ✅   |    —    |  —   |   —    |
| invoices:view    |  ✅   |   ✅    |  ✅  |   ✅   |
| invoices:create  |  ✅   |   ✅    |  ✅  |   —    |
| invoices:edit    |  ✅   |   ✅    |  —   |   —    |
| invoices:void    |  ✅   |   ✅    |  —   |   —    |
| reports:view     |  ✅   |   ✅    |  ✅  |   ✅   |
| analytics:view   |  ✅   |   ✅    |  —   |   ✅   |
| audit:view       |  ✅   |   ✅    |  —   |   —    |
| settings:view    |  ✅   |   ✅    |  ✅  |   —    |
| settings:edit    |  ✅   |    —    |  —   |   —    |
| users:manage     |  ✅   |    —    |  —   |   —    |

_This table is generated live in the app at **Settings → Access control**
(`components/rbac/permission-matrix.tsx`), rendered from the same source._

## Enforcement (defense in depth)

1. **Route (proxy)** — `src/proxy.ts` verifies the session cookie and gates the entire `(app)`
   route group; unauthenticated users are redirected to `/login?next=…`.
2. **Page (server)** — each protected page calls `requirePermission(...)`
   (`src/lib/auth/server.ts`), redirecting to `/dashboard?denied=1` on failure.
3. **Operation (service)** — every mutating/reading service calls `authorize(actor, permission)`
   (`src/lib/api/services/authorize.ts`), throwing `403` and recording an `access.denied`
   audit event. **This is the real boundary** — API route handlers all pass through it.
4. **UI (client)** — `<Can permission="…">` and `useCan()` (`src/components/auth/can.tsx`) hide
   controls the user can't use. UI gating is UX only, never the sole control.

### Access examples

- A **Viewer** on `/customers` sees the list but no "New customer" button (UI), and a direct
  `POST /api/customers` returns **403** (service). Verified by
  `src/lib/api/services/__tests__/authorization.test.ts` and `e2e/rbac.spec.ts`.
- A **Viewer** navigating to `/settings` is redirected to the dashboard (page gate).
- Only **Admin** sees `users:manage` affordances — including the **Users & team** page
  (`/users`), where admins change member roles. Role changes are audited (`user.role_change`),
  cannot demote the last admin, and cannot change your own admin role (self-lockout guard).

## Extending

1. Add the permission to `PERMISSIONS`.
2. Grant it to the appropriate roles in `ROLE_PERMISSIONS`.
3. Enforce it: `authorize(actor, "new:perm")` in the service, `requirePermission("new:perm")`
   on the page, and `<Can permission="new:perm">` in the UI.
4. Add/extend a test in the authorization test suite.
