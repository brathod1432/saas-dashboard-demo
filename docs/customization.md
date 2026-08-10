# Customization

> How to adapt Nexus Ops into your product. The layered architecture
> ([`architecture.md`](./architecture.md)) makes most changes local.

## Re-theme (colors, brand)

1. Edit tokens in `src/app/globals.css` — change `--primary`, `--sidebar*`, and `--chart-*`
   (HSL triplets) for light and `.dark`. Everything (buttons, charts, focus rings) updates.
2. Update the brand mark/name in `src/components/layout/sidebar.tsx`,
   `src/app/(auth)/layout.tsx`, and `src/app/page.tsx`.
3. Fonts: swap the `next/font` imports in `src/app/layout.tsx`.

See the live `/showcase` page for eight vertical re-skins (healthcare, logistics, finance, CRM,
ERP, PM, portal, analytics) driven purely by an accent token + relabeled modules.

## Rename / add modules (navigation)

- Nav is data-driven in `src/components/layout/nav-config.ts` — add a `NavItem` with `label`,
  `href`, `icon`, and required `permission`. It auto-filters by role.

## Add a new resource (end-to-end)

Follow the existing pattern (e.g. customers):

1. **Type** in `src/lib/types.ts`.
2. **Seed** data in `src/lib/mock/data.ts`.
3. **Repository** in `src/lib/api/repositories/<name>.ts` (use `applyQuery`).
4. **Zod schema** in `src/lib/validation/schemas.ts`.
5. **Service** in `src/lib/api/services/<name>.service.ts` with `authorize()` + `recordAudit()`.
6. **Route handlers** in `src/app/api/<name>/route.ts` (+ `[id]`).
7. **Hook** in `src/hooks/use-<name>.ts` (TanStack Query).
8. **Page + client** under `src/app/(app)/<name>/` using `DataTable` and a create dialog.
9. **RBAC**: add permission(s) to `src/lib/rbac/permissions.ts`.
10. **Tests**: extend the authorization + component suites.

## Swap the mock backend for a real API

The seam is **clients + repositories** only:

- Implement `src/lib/api/clients/http.ts` against `API_BASE_URL` and add auth headers.
- Back each repository with your DB/ORM (Prisma/Drizzle) or remote API calls.
- Hooks, services, route handlers, and UI are unchanged.

## Replace demo auth with a real IdP

- Reimplement `src/lib/auth/*` behind the existing `Session` interface (Auth.js/Clerk/Cognito/
  Entra ID). `getSession()`, `requireUser()`, `requirePermission()`, `<Can>`, and `proxy.ts`
  keep working. Add password hashing/MFA/revocation. See [`security-model.md`](./security-model.md).

## Add roles or permissions

- Extend `PERMISSIONS` and `ROLE_PERMISSIONS` (and `ROLE_DEFINITIONS` for a new role) in
  `src/lib/rbac`. Enforce with `authorize`/`requirePermission`/`<Can>`. The Settings → Access
  control matrix updates automatically. See [`rbac.md`](./rbac.md).

## Wire observability

- Point `logger`, `metrics`, and `withSpan` sinks at real backends; add Sentry in `handle()`.
  See [`observability.md`](./observability.md).
