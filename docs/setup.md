# Setup

> Get Nexus Ops running locally in a couple of minutes.

## Prerequisites

- **Node.js ≥ 20.9** (Next.js 16 minimum) and **npm**.
- Modern browser (Chrome/Edge/Firefox/Safari, recent).

## Install

```bash
git clone <your-fork-url> saas-dashboard-demo
cd saas-dashboard-demo
npm ci            # reproducible install from the committed lockfile
cp .env.example .env.local   # (optional) customize env; sane defaults work out of the box
```

## Run (development)

```bash
npm run dev       # http://localhost:3000  (Turbopack)
```

### Demo sign-in

Use **Quick demo sign-in** on `/login`, or these seeded accounts (password: `password`):

| Role    | Email                 |
| ------- | --------------------- |
| Admin   | admin@nexusops.demo   |
| Manager | manager@nexusops.demo |
| User    | user@nexusops.demo    |
| Viewer  | viewer@nexusops.demo  |

## Scripts

| Script                            | Purpose                           |
| --------------------------------- | --------------------------------- |
| `npm run dev`                     | Start the dev server              |
| `npm run build`                   | Production build                  |
| `npm run start`                   | Serve the production build        |
| `npm run lint` / `lint:fix`       | ESLint                            |
| `npm run format` / `format:check` | Prettier                          |
| `npm run typecheck`               | `tsc --noEmit`                    |
| `npm test` / `test:watch`         | Jest unit/component tests         |
| `npm run coverage`                | Jest with coverage thresholds     |
| `npm run e2e` / `e2e:install`     | Playwright E2E / install browsers |
| `npm run audit`                   | `npm audit` (fails on high+)      |

## Environment variables

See `.env.example`. Key ones:

- `SESSION_SECRET` (server-only) — signs the demo session cookie. Generate with
  `openssl rand -base64 32` for anything beyond local play.
- `NEXT_PUBLIC_DEMO_MODE` — set `false` to hide the demo banner.
- `SESSION_COOKIE_NAME`, `SESSION_MAX_AGE` — cookie config.

## Git hooks

`npm ci` runs `prepare` (husky). Commits trigger `lint-staged` (ESLint + Prettier on staged
files). Bypass in emergencies with `git commit --no-verify` (not recommended).

## Troubleshooting

- **PowerShell "running scripts is disabled"** — invoke `npm.cmd`/`npx.cmd`, or set
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- **Port 3000 in use** — `npm run dev -- -p 3001`.
- **E2E can't find browsers** — run `npm run e2e:install` once.
