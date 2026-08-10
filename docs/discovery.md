# Phase 1 — Discovery

> **Project:** Nexus Ops — Enterprise SaaS Dashboard Demo & Starter Template
> **Status:** Living document · updated during the build
> **Owners:** Architecture, Product, UX, Security, DevOps, QA

---

## 1. Product Vision

**Nexus Ops** is a production-grade **Business Operations Platform** demo that doubles as a
reusable SaaS starter template. It shows prospective clients — startups, SMBs, enterprises,
consultancies, and internal ops teams across logistics, finance, healthcare-tech, and
security-focused verticals — what "good" looks like for modern business software:

- **Security-first** architecture (RBAC, protected routing, session abstraction, input
  validation, output encoding, security headers, audit trail).
- **Premium, accessible UI** (WCAG 2.1 AA target) built on an open-source, licence-clean stack.
- **Enterprise scalability** via a clean layered architecture (UI → hooks → services →
  clients → repositories) that can be pointed at a real backend with minimal change.
- **Observability & production readiness** baked in (structured logging, metrics, tracing
  abstractions, health checks).

The same codebase is re-skinnable into vertical SaaS products (Healthcare, Logistics,
Finance, CRM, ERP, PM, Customer Portal, Analytics) — demonstrated in the `/showcase` page.

### Vision statement

> Give teams a secure, accessible, observable SaaS foundation on day one, so they spend
> their time on differentiated business logic instead of re-solving auth, tables, forms,
> charts, and design systems.

### Non-goals

- Not a real backend / database (uses an in-memory mock API + fake session by design).
- Not a billing or payments integration (invoice module is illustrative).
- Not a multi-tenant control plane (single demo tenant; architecture leaves room for it).

---

## 2. User Personas

| Persona                                | Role     | Goals                                             | Pain points we solve                                   |
| -------------------------------------- | -------- | ------------------------------------------------- | ------------------------------------------------------ |
| **Priya — Ops Admin**                  | Admin    | Configure org, manage users/roles, audit activity | Needs full control + a defensible audit trail and RBAC |
| **Marco — Team Manager**               | Manager  | Track projects, invoices, team KPIs               | Wants fast, filterable tables and trustworthy reports  |
| **Dana — Individual Contributor**      | User     | Update projects, log work, manage own customers   | Wants a fast, focused UI with clear forms & feedback   |
| **Sam — Executive / Viewer**           | Viewer   | Read dashboards & reports, no edit rights         | Needs read-only clarity; must not see edit controls    |
| **Alex — Prospective Buyer**           | External | Evaluate quality, security posture, extensibility | Wants proof of production readiness, not a toy         |
| **Jordan — Implementation Consultant** | External | Fork & customize per client vertical              | Needs clean architecture, docs, and theming hooks      |

### Accessibility personas

- Keyboard-only user (no mouse) — full keyboard nav & visible focus.
- Screen-reader user (NVDA/VoiceOver) — semantic landmarks, ARIA, live regions.
- Low-vision user — AA contrast, scalable type, reduced-motion support.

---

## 3. Architecture Proposal

### 3.1 High-level

```
┌──────────────────────────────────────────────────────────────┐
│                     Next.js App Router (RSC)                    │
│  Route groups:  (auth)  ·  (app)  ·  route handlers /api/*      │
├──────────────────────────────────────────────────────────────┤
│  Presentation:  pages · layouts · feature components · UI kit  │
│  Client state:  Zustand (UI/session mirror)                    │
│  Server cache:  TanStack Query (data fetching/caching)         │
├──────────────────────────────────────────────────────────────┤
│  Hooks layer      (use-customers, use-projects, …)             │
│        │  React Query wrappers over services                   │
│  Services layer   (business operations, validation)            │
│        │                                                        │
│  Clients layer    (HTTP/mock transport, error normalization)   │
│        │                                                        │
│  Repositories     (data access over in-memory store / API)     │
├──────────────────────────────────────────────────────────────┤
│  Cross-cutting:  RBAC · auth/session · audit · logger ·        │
│                  metrics · tracing · validation (zod)          │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Layered responsibilities

- **UI / pages** — rendering, accessibility, composition. No data access.
- **Hooks** — bind UI to services via TanStack Query; own cache keys & invalidation.
- **Services** — orchestrate use-cases, enforce permissions, emit audit events.
- **Clients** — transport concern (today: in-memory; tomorrow: `fetch` to real API).
- **Repositories** — CRUD over the data source; the only layer that "knows" storage.
- **Cross-cutting** — RBAC, session, audit, logger, metrics, tracing, zod schemas.

Swapping the mock backend for a real one is a **clients + repositories** change only; UI,
hooks, and services are untouched. This is the core extensibility argument.

### 3.3 Auth & session (demo)

- Cookie-based **fake session** issued by `/api/auth/*` route handlers.
- `middleware.ts` guards the `(app)` route group and redirects unauthenticated users.
- A **session abstraction** (`lib/auth`) is the single seam to replace with a real IdP
  (NextAuth/Auth.js, Clerk, Cognito, Entra ID) later.

### 3.4 RBAC

- Roles: **Admin > Manager > User > Viewer**.
- Central permission matrix (`lib/rbac`) mapping `role → permission[]`.
- Enforced in three places: middleware (route), services (operation), UI (`<Can>` gate).

---

## 4. Technical Recommendations

| Concern      | Choice                                      | Rationale                                          |
| ------------ | ------------------------------------------- | -------------------------------------------------- |
| Framework    | **Next.js 16 (App Router, RSC)**            | SSR/streaming, route handlers, mature ecosystem    |
| Language     | **TypeScript (strict)**                     | Type safety across the layered architecture        |
| Styling      | **Tailwind CSS v4** (CSS-first `@theme`)    | Fast, tokenized, no runtime CSS-in-JS              |
| Components   | **shadcn/ui pattern + Radix UI**            | Own the code, MIT, accessible primitives           |
| Client state | **Zustand**                                 | Minimal, unopinionated UI/session state            |
| Server state | **TanStack Query**                          | Caching, retries, invalidation, dev-tools          |
| Forms        | **React Hook Form + Zod**                   | Performant forms + one schema for FE/BE validation |
| Charts       | **Recharts**                                | Declarative, accessible-friendly, MIT              |
| Icons        | **lucide-react**                            | MIT, tree-shakeable                                |
| Toasts/theme | **sonner + next-themes**                    | Accessible notifications + dark mode               |
| Tests        | **Jest + RTL + jest-axe**                   | Unit/component/a11y coverage                       |
| E2E          | **Playwright**                              | Cross-browser, reliable                            |
| Quality      | **ESLint + Prettier + Husky + lint-staged** | Enforced consistency                               |

Full per-dependency vetting lives in [`security-review.md`](./security-review.md); design
source vetting lives in [`design-research.md`](./design-research.md).

---

## 5. Risks

| #   | Risk                                                              | Likelihood | Impact | Mitigation                                                                |
| --- | ----------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------- |
| R1  | Newer Next.js 16 / Tailwind v4 API differences vs. older patterns | High       | Med    | Read bundled `node_modules/next/dist/docs`; pin versions; CI build gate   |
| R2  | Demo auth mistaken for production auth                            | Med        | High   | Clear docs, banner, `SECURITY` notes; session abstraction seam documented |
| R3  | Scope creep across 24 phases                                      | High       | Med    | Layered priorities; core pages fully built, others real-but-lean          |
| R4  | Supply-chain risk from new deps                                   | Med        | High   | Per-dep review, lockfile, `npm audit`, avoid brand-new releases           |
| R5  | Accessibility regressions                                         | Med        | Med    | jest-axe + Playwright axe in CI; semantic-first components                |
| R6  | Mock data drifting from types                                     | Low        | Med    | Single source of types; typed factories/repositories                      |
| R7  | Performance budget slippage                                       | Med        | Med    | Code-split, lazy charts, RSC, bundle review                               |

---

## 6. Dependencies (external & internal)

- **External libraries:** see §4 and `security-review.md` (all MIT / permissive OSS).
- **Runtime environment:** Node.js ≥ 20, npm; no external DB or third-party API required.
- **Internal cross-cutting modules:** `lib/rbac`, `lib/auth`, `lib/audit`, `lib/logger`,
  `lib/observability`, `lib/validation` — all feature code depends on these.
- **Design sources:** shadcn/ui, Radix, Tremor patterns, HyperUI/Flowbite/Origin UI (all
  reviewed & adapted, never blindly copied).

---

## 7. Assumptions

1. The demo runs locally / in a preview environment; no production secrets are used.
2. A single tenant and a seeded set of users/roles is sufficient to demonstrate RBAC.
3. Mock data is deterministic (seeded) so screenshots and tests are stable.
4. Reviewers value **security, maintainability, scalability, accessibility, performance**
   over flashy visual effects (per project brief).
5. The starter will later be connected to a real backend by replacing the clients +
   repositories layer only.

---

## 8. Implementation Roadmap

| Wave                 | Scope                                                       | Phases              |
| -------------------- | ----------------------------------------------------------- | ------------------- |
| **0. Foundation**    | Scaffold, deps, tooling, design tokens                      | 3, 4, 23            |
| **1. Core platform** | RBAC, auth/session, mock API, app shell, UI kit             | 5, 9, 10, 13        |
| **2. Experiences**   | Auth pages, dashboard, feature pages, tables, forms, charts | 7, 8, 14, 15, 16    |
| **3. Trust & ops**   | Audit trail, observability, security impl                   | 10, 11, 12          |
| **4. Quality**       | A11y, performance, tests, showcase                          | 17, 18, 19, 21      |
| **5. Docs & audit**  | All docs, final build/lint/type/test audit                  | 1, 2, 6, 20, 22, 24 |

## 9. Feature Prioritization Matrix

Value vs. effort (MoSCoW blended). **P0 = must, P1 = should, P2 = could.**

| Feature                                                 | Value | Effort | Priority |
| ------------------------------------------------------- | ----- | ------ | -------- |
| RBAC + protected routing + session abstraction          | High  | Med    | **P0**   |
| Layered mock API (services/clients/repositories/hooks)  | High  | Med    | **P0**   |
| Design system + accessible UI kit                       | High  | Med    | **P0**   |
| Dashboard (KPIs, charts, activity, alerts)              | High  | Med    | **P0**   |
| Enterprise DataTable (sort/filter/paginate/search/bulk) | High  | High   | **P0**   |
| Auth pages (login/register/forgot)                      | High  | Low    | **P0**   |
| Customers / Projects / Invoices CRUD-ish flows          | High  | High   | **P1**   |
| Advanced forms (RHF + Zod, all states)                  | High  | Med    | **P1**   |
| Audit trail view                                        | Med   | Low    | **P1**   |
| Reports / Analytics (charts)                            | Med   | Med    | **P1**   |
| Observability abstractions + health check               | Med   | Low    | **P1**   |
| Settings / Account / Help                               | Med   | Low    | **P1**   |
| Showcase / portfolio mode                               | Med   | Med    | **P2**   |
| E2E (Playwright) coverage                               | Med   | Med    | **P2**   |
| Export (CSV) from tables                                | Low   | Low    | **P2**   |

---

_This document is updated as later phases refine assumptions and decisions._
