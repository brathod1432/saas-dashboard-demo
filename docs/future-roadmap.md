# Future Roadmap

> Where Nexus Ops goes next, grouped by theme. Ordering reflects value vs. effort; security and
> foundational items come first.

## Near-term (harden for production)

- **Real authentication** — Auth.js/Clerk/Cognito/Entra behind the `Session` interface;
  password hashing, MFA, revocable sessions.
- **CSP nonce + CSRF tokens + rate limiting** — close S-2/S-3/S-4 from [`security-audit.md`](./security-audit.md).
- **Persistent datastore** — replace the in-memory store with Postgres + Prisma/Drizzle at the
  repository layer.
- **CI pipeline** — lint, typecheck, coverage, build, E2E, `npm audit`, Lighthouse CI; Dependabot/
  Renovate with a release-age cooldown.

## Platform capabilities

- **Multi-tenancy** — tenant scoping in session + repositories; per-tenant theming (the
  `/showcase` re-skin mechanism is a preview of this).
- **Real observability** — OpenTelemetry traces/metrics, log shipping, Sentry error monitoring,
  dashboards + alerts.
- **Background jobs** — queue (BullMQ/Cloud Tasks) for invoice reminders, digests, syncs.
- **Notifications** — email/in-app/webhooks; the alerts panel + audit feed are the seeds.

## Product features

- **Global command palette** (⌘K) with keyboard-first navigation and search.
- **Server-side table operations** — move sort/filter/paginate to the API for large datasets
  (the `ListQuery` contract and repositories already support it).
- **Editing & workflows** — inline edit, bulk actions with real mutations, approvals.
- **Real charts/reporting** — scheduled reports, export to PDF/XLSX, custom dashboards.
- **User & team management UI** — invite, assign roles (gated by `users:manage`).
- **Billing** — real invoicing/payments integration (Stripe) replacing the illustrative module.

## Developer experience

- **Storybook** for the UI kit; visual regression tests.
- **API contract types** shared with a real backend (OpenAPI/tRPC) to keep clients typed.
- **i18n** — the copy is centralizable; add `next-intl` for localization.
- **Feature flags** — gate new modules progressively.

## Accessibility & performance

- Per-route automated axe scans + Lighthouse CI budgets in CI.
- Lazy-load the charts bundle where below the fold; bundle-analyzer guardrails.
