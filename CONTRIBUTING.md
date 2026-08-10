# Contributing to Nexus Ops

Thanks for your interest! This is an enterprise SaaS dashboard demo & starter template.
Contributions that improve clarity, accessibility, security, and developer experience are
very welcome.

## Getting started

```bash
npm ci
cp .env.example .env.local   # optional
npm run dev
```

See [`docs/setup.md`](docs/setup.md) for details and demo sign-in credentials.

## Before you open a PR

Run the full local gate (CI runs the same):

```bash
npm run lint
npm run typecheck
npm run coverage
npm run build
# optional end-to-end (installs browsers once): npm run e2e:install && npm run e2e
```

A pre-commit hook (husky + lint-staged) formats and lints staged files automatically.

## Conventions

- **Architecture:** keep the layering — UI → hooks → clients → route handlers → services →
  repositories. Don't reach across layers. See [`docs/architecture.md`](docs/architecture.md).
- **RBAC:** enforce new capabilities in the service (`authorize()`), the page
  (`requirePermission`), and the UI (`<Can>`). Add permissions in `src/lib/rbac/permissions.ts`.
- **Validation:** one Zod schema in `src/lib/validation/schemas.ts`, used on client and server.
- **Styling:** use design tokens (`bg-primary`, `text-muted-foreground`), never hard-coded
  colors. See [`docs/design-system.md`](docs/design-system.md).
- **Accessibility:** semantic HTML first; every reusable component ships with a jest-axe test.
- **Tests:** colocate in `__tests__/`; query by role/label; add/extend tests with your change.
- **Next.js 16:** `params`/`searchParams`/`cookies()`/`headers()` are async; the middleware
  file is `src/proxy.ts`.

## Commit messages

Explain the **why**, not just the what. Conventional prefixes (`feat:`, `fix:`, `docs:`,
`chore:`, `refactor:`, `test:`) are appreciated.

## Reporting bugs / requesting features

Use the issue templates. For security issues, follow [`SECURITY.md`](SECURITY.md) (do not open a
public issue).

## Code of Conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
