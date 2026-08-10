<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Nexus Ops — project notes for agents

Enterprise SaaS dashboard demo & starter (Next.js 16 App Router, React 19, TS strict,
Tailwind v4, shadcn/Radix, Zustand, TanStack Query, RHF+Zod, Recharts).

## Commands

- Dev: `npm run dev` · Build: `npm run build` · Start: `npm run start`
- Quality: `npm run lint`, `npm run typecheck`, `npm run format`
- Tests: `npm test`, `npm run coverage` (thresholds enforced), `npm run e2e` (needs `npm run e2e:install` once)
- Security: `npm run audit`
- On Windows PowerShell, invoke `npm.cmd`/`npx.cmd` (script execution may be disabled).

## Conventions

- Layered API: UI → hooks (`src/hooks`) → clients (`src/lib/api/clients`) → route handlers
  (`src/app/api`) → services (`src/lib/api/services`) → repositories (`src/lib/api/repositories`).
  Swapping the backend is a clients+repositories change only.
- **RBAC is enforced in three layers**: `src/proxy.ts` (route), `requirePermission` (page),
  `authorize()` in every service (operation). UI `<Can>` is UX-only. Add permissions in
  `src/lib/rbac/permissions.ts`.
- Validation via shared Zod schemas (`src/lib/validation/schemas.ts`) on client AND server.
- Next 16 specifics: `params`/`searchParams`/`cookies()`/`headers()` are async (await them);
  the middleware file is `src/proxy.ts` (renamed); Turbopack is default.
- Design tokens live in `src/app/globals.css` (Tailwind v4 `@theme`); use token utilities
  (`bg-primary`, `text-muted-foreground`), never hard-coded colors.
- Do NOT put `setState` directly in an effect body (lint rule); initialize from props instead.
- Radix `Checkbox`/`Switch`/`Select` need RHF `Controller` (not `register`); numeric `<input>`
  use `register(name, { valueAsNumber: true })`.

## Docs

Full documentation in `docs/` (architecture, security-model, security-implementation, rbac,
observability, testing, accessibility, performance, deployment, customization, setup, roadmap,
plus discovery/design-research/security-review/security-audit/final-audit).
