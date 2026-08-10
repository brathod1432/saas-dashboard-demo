# Phase 22 — Architecture

> How Nexus Ops is structured and why. See [`discovery.md`](./discovery.md) for the vision and
> [`security-model.md`](./security-model.md) for the trust model.

## Stack

Next.js 16 (App Router, RSC, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
shadcn/Radix UI · Zustand · TanStack Query · React Hook Form + Zod · Recharts.
Full rationale + vetting: [`security-review.md`](./security-review.md).

## Layered architecture

```
UI (pages, layouts, feature components, ui kit)
        │  server components read services/repositories directly
        │  client components use hooks
Hooks (src/hooks/*)                → TanStack Query over the HTTP client
Clients (src/lib/api/clients)      → transport (today: fetch → /api/*)
Route handlers (src/app/api/*)     → auth + validation boundary
Services (src/lib/api/services)    → use-cases, authorize(), audit, zod validation
Repositories (src/lib/api/repos)   → data access over the in-memory store
Cross-cutting: rbac · auth/session · audit · observability · validation
```

**Key property:** replacing the mock backend is a **clients + repositories** change only.
UI, hooks, and services keep their contracts. This is the core extensibility argument.

### Request flow (client mutation example)

`CreateCustomerDialog` → `useCreateCustomer` (hook) → `httpClient.post('/customers')` →
`POST /api/customers` route handler → `requireActor()` → `customersService.create()` →
`authorize()` + Zod validate → `customersRepository.create()` → `recordAudit()` → JSON →
React Query invalidates `['customers']` → table refetches → `sonner` toast.

### Read flow (server component example)

`dashboard/page.tsx` → `requirePermission('dashboard:view')` → repositories
(`analyticsRepository`, `customersRepository`, …) → rendered on the server (RSC), no client
fetch. Interactive tables hydrate via hooks.

## Directory map

```
src/
  app/
    (auth)/            login · register · forgot-password  (+ layout)
    (app)/             dashboard · customers[/id] · projects[/id] · invoices ·
                       reports · analytics · settings · account · help · showcase  (+ layout)
    api/               auth/* · customers[/id] · projects[/id] · invoices · health · metrics
    page.tsx           public landing        not-found.tsx    layout.tsx (root)
  components/
    ui/                shadcn/Radix primitives
    layout/            sidebar · topbar · app-shell · nav-config
    data-table/        DataTable + CSV export
    charts/            Recharts wrappers
    dashboard/ customers/ projects/ invoices/ settings/ account/ showcase/  feature components
    auth/              session-context · can            forms/ shared/ rbac/ audit/
  hooks/               use-customers · use-projects · use-invoices
  lib/
    api/               repositories · clients · services · errors · route-helpers
    auth/              session · server · users
    rbac/              permissions · index
    audit/  observability/ (logger·metrics·tracing·health)  validation/  mock/  utils.ts
  stores/              ui-store (zustand)
  proxy.ts             route guard (Next 16 middleware)
```

## Rendering & data strategy

- **RSC-first:** protected pages are server components that gate with `requirePermission` and
  read repositories directly — fast, no client waterfall, secrets stay server-side.
- **Client islands:** interactive tables/forms/charts are client components fed by hooks.
- **Caching:** TanStack Query (`staleTime` 30s, no refetch-on-focus) for client data; route
  handlers are dynamic (session-dependent).

## State management

- **Server state:** TanStack Query (fetch/cache/invalidate).
- **UI state:** Zustand (`ui-store`) for sidebar/command-palette.
- **Session (client):** React context (`SessionProvider`) seeded by the server layout;
  `<Can>`/`useCan` read from it.

## Scalability & evolution

- Add a module: new repository + service + route handler + hook + page — following the
  existing pattern; RBAC via a new permission.
- Swap to a real backend: implement `clients/http.ts` against `API_BASE_URL` (+ auth headers)
  and back the repositories with a DB/ORM. Replace `lib/auth` with a real IdP behind the same
  `Session` interface.
- Multi-tenancy, feature flags, and background jobs are natural next layers (see
  [`future-roadmap.md`](./future-roadmap.md)).
