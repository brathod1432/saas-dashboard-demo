# Phase 3 — Dependency Security Review

> Security-first assessment performed **before** relying on any dependency.
> `npm audit` (prod + dev): **0 vulnerabilities** at time of writing.
> Node ≥ 20.9 · npm lockfile committed · installs pinned via `package-lock.json`.

## Approval decision

**APPROVED — all listed dependencies.** Every package is mainstream, actively maintained,
permissively licensed, and free of unpatched critical CVEs at the installed versions. No
outright rejections; a few items are **flagged for monitoring** (young majors, low-velocity
utilities, single-publisher supply-chain exposure).

## Dependency inventory (installed versions)

### Runtime

| Package                     | Installed | License        | Purpose                                     |
| --------------------------- | --------- | -------------- | ------------------------------------------- |
| next                        | 16.3.0    | MIT            | Framework (App Router, RSC, route handlers) |
| react / react-dom           | 19.2.8    | MIT            | UI runtime                                  |
| zustand                     | ^5.0.14   | MIT            | Client/UI state                             |
| @tanstack/react-query       | ^5.101.4  | MIT            | Server-state cache/fetching                 |
| react-hook-form             | ^7.85.0   | MIT            | Forms                                       |
| zod                         | ^4.4.3    | MIT            | Schema validation (FE + API)                |
| @hookform/resolvers         | ^5.7.1    | MIT            | RHF ↔ Zod bridge                            |
| recharts                    | ^3.10.1   | MIT            | Charts                                      |
| lucide-react                | ^1.31.0   | ISC            | Icons                                       |
| class-variance-authority    | ^0.7.1    | **Apache-2.0** | Variant class composition                   |
| clsx                        | ^2.1.1    | MIT            | Conditional classes                         |
| tailwind-merge              | ^3.6.0    | MIT            | Tailwind class de-dupe (v4-compatible)      |
| next-themes                 | ^0.4.6    | MIT            | Dark/light theming                          |
| sonner                      | ^2.0.8    | MIT            | Toasts                                      |
| date-fns                    | ^4.4.0    | MIT            | Date utilities                              |
| @radix-ui/react-* (15 pkgs) | ^1.x–^2.x | MIT            | Accessible primitives                       |

### Dev / tooling

| Package                                      | Installed   | License        | Purpose                    |
| -------------------------------------------- | ----------- | -------------- | -------------------------- |
| typescript                                   | ^5          | Apache-2.0     | Types                      |
| tailwindcss + @tailwindcss/postcss           | ^4          | MIT            | Styling engine             |
| eslint + eslint-config-next                  | ^9 / 16.3.0 | MIT            | Linting                    |
| jest + jest-environment-jsdom                | ^30         | MIT            | Unit/component tests       |
| @testing-library/{react,jest-dom,user-event} | 16/7/14     | MIT            | Component testing          |
| @playwright/test                             | ^1.62.1     | Apache-2.0     | E2E                        |
| jest-axe / @types/jest-axe                   | ^11         | MPL-2.0* / MIT | A11y assertions (axe-core) |
| prettier + prettier-plugin-tailwindcss       | ^3.9 / ^0.8 | MIT            | Formatting                 |
| husky + lint-staged                          | ^9 / ^17    | MIT            | Git hooks / staged linting |
| ts-node                                      | ^10.9.2     | MIT            | TS execution (jest config) |

\* axe-core is MPL-2.0 (file-level copyleft, dev-only, not distributed in the app bundle).

**License note for SBOM:** not everything is MIT — `class-variance-authority`, `typescript`,
`@playwright/test` are **Apache-2.0**; `lucide-react` is **ISC**; `axe-core` (via jest-axe)
is **MPL-2.0** (dev-only). All are enterprise-permissive; none are copyleft in shipped code.

## Dependency risk matrix

| Package                  | Popularity (approx wk dl) | Maintenance              | Security history                                                                | Risk         | Decision               |
| ------------------------ | ------------------------- | ------------------------ | ------------------------------------------------------------------------------- | ------------ | ---------------------- |
| next 16                  | ~42–55M                   | Very active (Vercel)     | Past middleware auth-bypass CVEs (CVE-2025-29927) patched; **v16 not affected** | Low–Med      | Approve (keep patched) |
| react / react-dom 19     | Top-tier                  | Very active (Meta)       | Clean                                                                           | Low          | Approve                |
| zustand                  | ~27–49M                   | Active (pmndrs)          | Clean                                                                           | Low          | Approve                |
| @tanstack/react-query    | ~55M                      | Very active              | Clean                                                                           | Low          | Approve                |
| react-hook-form          | ~52–58M                   | Very active              | Clean (1 publisher)                                                             | Low          | Approve                |
| zod                      | ~200M+                    | Very active              | Clean (single-publisher profile)                                                | Low / Med SC | Approve                |
| @hookform/resolvers      | ~49M                      | Active                   | Clean                                                                           | Low          | Approve                |
| recharts                 | ~49–57M                   | Active                   | Clean (audit transitive d3/lodash)                                              | Low          | Approve                |
| lucide-react             | ~97M                      | Very active              | Clean                                                                           | Low          | Approve                |
| class-variance-authority | ~58–61M                   | Maintenance mode (0.7.1) | Clean                                                                           | Low          | Approve (low velocity) |
| clsx                     | ~105–115M                 | Mature/stable            | Clean                                                                           | Low          | Approve                |
| tailwind-merge           | tens of M                 | Active (v4-compatible)   | Clean                                                                           | Low          | Approve                |
| next-themes              | ~26M                      | Low activity             | Clean                                                                           | Low          | Approve (monitor)      |
| sonner                   | ~49M                      | Active                   | Clean                                                                           | Low          | Approve                |
| date-fns                 | tens of M                 | Active                   | Clean                                                                           | Low          | Approve                |
| @radix-ui/react-*        | Billions cumul.           | Very active (WorkOS)     | Clean                                                                           | Low          | Approve                |
| typescript               | ~124M                     | Very active (MS)         | Clean                                                                           | Low          | Approve                |
| tailwindcss 4            | ~117M                     | Very active              | Clean                                                                           | Low–Med      | Approve (young major)  |
| eslint (+next)           | ~156M                     | Very active              | Clean                                                                           | Low          | Approve                |
| jest (+jsdom)            | ~39M                      | Active (OpenJS)          | Clean                                                                           | Low          | Approve                |
| @testing-library/*       | 46–59M                    | Active                   | Clean                                                                           | Low          | Approve                |
| @playwright/test         | ~52M                      | Very active (MS)         | Clean                                                                           | Low          | Approve                |
| jest-axe                 | ~2.5–4M                   | Moderate                 | Clean (dev-only)                                                                | Low          | Approve                |
| prettier (+tw plugin)    | ~129M                     | Active                   | Clean                                                                           | Low          | Approve                |
| husky / lint-staged      | ~34M / ~28M               | Stable / active          | Clean (hooks execute locally — reviewed)                                        | Low          | Approve                |

## Supply-chain risk guidance (adopted controls)

The dominant risk to this stack is the **npm supply chain**, not any single vulnerable
package (cf. Sept 2025 chalk/debug and 2026 axios maintainer-compromise incidents affecting
transitive deps). Controls applied in this project:

1. **Lockfile committed** (`package-lock.json`); CI uses `npm ci` for reproducible installs.
2. **Avoid brand-new releases.** Young majors (`next@16`, `tailwindcss@4`) are pinned to
   reviewed patch versions; no auto-adoption of hours-old releases.
3. **`npm audit` in CI** (`npm run audit`) gates merges on high/critical advisories.
4. **Prefer provenance**; enforce 2FA on any publishing accounts (N/A for this private demo).
5. **Monitor single-publisher, high-blast-radius packages** (`zod`, `clsx`, `cva`, `sonner`,
   `next-themes`, `react-hook-form`) — pinned and watched for anomalous releases.
6. **Minimize install scripts** in untrusted CI stages; `husky` hook scripts are reviewed.
7. **Dependency updates with a cooldown** (Renovate/Dependabot config recommended: only
   propose versions ≥ 7 days old — aligns with the project's dependency-age policy).

## Flagged (monitor, non-blocking)

- **Young majors:** `next@16`, `tailwindcss@4` + `@tailwindcss/postcss` — new engines; keep
  patched and verify plugin ecosystem compatibility.
- **Low maintenance velocity:** `next-themes@0.4.6`, `class-variance-authority@0.7.1`,
  `clsx@2.1.1` — stable but infrequent releases.
- **Single-publisher exposure:** listed in control #5 above.

## Rejected packages

None from the selected set. General rejections that shaped selection: paid-only component
kits (Tailwind Plus), AGPL-licensed component/app code, and admin templates bundling
third-party analytics/trackers (privacy risk). See [`design-research.md`](./design-research.md).

## Re-review triggers

Re-run this review when: adding/removing a dependency, a major version bump, a new `npm audit`
finding, or a published advisory affecting any listed package.
