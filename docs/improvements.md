# Improvements Report — from the User's & Client's Perspective

> A practical analysis of how to make Nexus Ops more useful in real life, with a
> dedicated security section. Items marked **✅ Implemented** were delivered in this
> iteration; the rest are prioritized for the roadmap.

## How I evaluated this

I walked the product as four real people:

- **Priya (Admin)** — needs control, auditability, and to manage people/data end-to-end.
- **Marco (Manager)** — lives in tables and reports; needs speed and bulk operations.
- **Dana (User/IC)** — creates and updates records all day; friction and data loss hurt most.
- **Sam (Viewer/Exec)** — scans dashboards; needs clarity, export, and trustworthy numbers.

The recurring real-life gaps: you could **create** records but not **edit or delete** them;
the global **search box didn't work**; data **reset on refresh**; and there were no
**route-level loading/error** experiences. Those are the things that make or break daily use.

---

## 1. Highest-impact UX gaps (daily usefulness)

| #   | Improvement                                                                           | Why it matters to a user                                                                       | Status                                          |
| --- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| U1  | **Edit & delete** for customers/projects (RBAC-gated, confirm dialog, audited)        | Create-only is a demo; real work is editing and removing records                               | ✅ Implemented                                  |
| U2  | **Working global search / command palette (⌘K)** across customers, projects, invoices | The #1 way power users navigate; a dead search box erodes trust instantly                      | ✅ Implemented                                  |
| U3  | **Route-level `loading.tsx` + `error.tsx` + `global-error.tsx`**                      | Users see skeletons instead of blank screens, and a recover-able error page instead of a crash | ✅ Implemented                                  |
| U4  | **Data persistence across refresh** (optional localStorage-backed mock, or real DB)   | Losing edits on reload is the most frustrating demo behavior                                   | Roadmap (documented)                            |
| U5  | **Inline row actions menu** (view/edit/delete) on tables                              | Fewer clicks; matches enterprise table expectations                                            | ✅ Implemented (customers/projects)             |
| U6  | **Bulk operations that mutate** (bulk status change/delete), not just totals          | Managers batch-process; current bulk bar is read-only                                          | ✅ Implemented (customers/projects)             |
| U7  | **Saved views / persisted filters & column choices**                                  | Users return to the same filtered view daily                                                   | Roadmap                                         |
| U8  | **Server-side table ops** (sort/filter/paginate) for large datasets                   | Client-side breaks past a few thousand rows                                                    | Roadmap (contract already supports `ListQuery`) |
| U9  | **Date-range/period selector** on reports                                             | "This quarter vs last" is a core analytics need                                                | ✅ Implemented (reports: 3/6/12 months)         |
| U10 | **CSV import** (not just export)                                                      | Onboarding real data is import-first                                                           | ✅ Implemented (customers, with template)       |
| U11 | **User & team management UI** (invite, assign roles)                                  | Admins need to run RBAC without editing code                                                   | Roadmap                                         |
| U12 | **Keyboard shortcuts + focus-visible affordances**                                    | Speed for power users                                                                          | Partial (⌘K added)                              |

## 2. Trust, correctness & polish

| #   | Improvement                                                             | Why                                                  | Status         |
| --- | ----------------------------------------------------------------------- | ---------------------------------------------------- | -------------- |
| T1  | **Empty/error/loading states everywhere** (already strong) + wired CTAs | Users never hit dead ends                            | ✅ (extended)  |
| T2  | **Optimistic updates + rollback** on mutations                          | Snappy feel; correct on failure                      | Roadmap        |
| T3  | **Consistent confirmations for destructive actions**                    | Prevent accidental data loss                         | ✅ Implemented |
| T4  | **Breadcrumbs on detail pages**                                         | Orientation in deep navigation                       | ✅ Implemented |
| T5  | **Real notification center** (mark read, dismiss)                       | Current bell is static                               | ✅ Implemented |
| T6  | **i18n / currency & timezone awareness**                                | Global teams; you already store timezone in settings | Roadmap        |

## 3. Security improvements (dedicated)

| #   | Improvement                                                                                | Risk addressed                           | Status                                           |
| --- | ------------------------------------------------------------------------------------------ | ---------------------------------------- | ------------------------------------------------ |
| S1  | **Login rate limiting + temporary lockout** (per IP + email)                               | Credential stuffing / brute force        | ✅ Implemented                                   |
| S2  | **Same-origin / CSRF defense on state-changing routes** (Origin + `Sec-Fetch-Site` checks) | Cross-site request forgery via cookies   | ✅ Implemented                                   |
| S3  | **Generic auth errors (no user enumeration)**                                              | Account discovery                        | ✅ Already generic ("Invalid email or password") |
| S4  | **`/.well-known/security.txt`**                                                            | Responsible disclosure channel           | ✅ Implemented                                   |
| S5  | **CI security gates** (`npm audit`, Dependabot, lint/type/test/build)                      | Supply-chain + regressions               | ✅ Implemented                                   |
| S6  | **Nonce-based CSP** (drop `unsafe-inline`/`unsafe-eval`)                                   | XSS hardening                            | Roadmap (needs proxy nonce plumbing)             |
| S7  | **Real IdP + password hashing + MFA + session revocation**                                 | Production authentication                | Roadmap (session seam ready)                     |
| S8  | **Audit of security events incl. denials**                                                 | Forensics/repudiation                    | ✅ Already present (extended to lockouts)        |
| S9  | **Secret scanning / gitignored env**                                                       | Secret leakage                           | ✅ (`.env*` ignored; add secret scanning in CI)  |
| S10 | **Security headers + `poweredByHeader:false`**                                             | Clickjacking, sniffing, info leak        | ✅ Already present                               |
| S11 | **`Cache-Control: no-store` on authenticated API responses**                               | Sensitive data cached by proxies/BFCache | ✅ Implemented (via `handle()`)                  |
| S12 | **Production guard for default `SESSION_SECRET`**                                          | Shipping the demo signing key            | ✅ Implemented (startup warning)                 |

## 4. Developer & adopter experience (client/consultant using the starter)

| #   | Improvement                                                    | Why                                  | Status                         |
| --- | -------------------------------------------------------------- | ------------------------------------ | ------------------------------ |
| D1  | **MIT `LICENSE`**                                              | Legal clarity to fork/commercialize  | ✅ Implemented                 |
| D2  | **`SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`**     | Standard OSS trust signals           | ✅ Implemented                 |
| D3  | **CI workflow + Dependabot + issue/PR templates + CODEOWNERS** | Professional repo hygiene            | ✅ Implemented                 |
| D4  | **`.nvmrc`, `engines`, richer `package.json` metadata**        | Reproducible onboarding              | ✅ Implemented                 |
| D5  | **Screenshots in README**                                      | Instant understanding for evaluators | ✅ Implemented (previous step) |
| D6  | **Storybook for the UI kit**                                   | Component discoverability            | Roadmap                        |
| D7  | **Lighthouse CI + per-route axe scans**                        | Enforce perf/a11y budgets            | Roadmap                        |

## Prioritization summary

- **Iteration 1:** U1, U2, U3, U5, T1, T3, S1, S2, S3, S4, S5, S8, D1–D5.
- **Iteration 2 (this round):** U6 (bulk mutations), U9 (reports period), U10 (CSV import),
  T4 (breadcrumbs), T5 (notification center), S11 (no-store), S12 (secret guard).
- **Next (biggest remaining lift):** U4 (persistence → real DB), U8 (server-side tables),
  U11 (user management UI), S6 (nonce CSP), S7 (real auth/MFA), U7 (saved views), T2 (optimistic
  updates), i18n, Storybook, Lighthouse/axe CI.

See [`future-roadmap.md`](./future-roadmap.md) for the longer arc and
[`security-audit.md`](./security-audit.md) for the security posture and residual risks.
