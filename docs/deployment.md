# Deployment

> How to ship Nexus Ops. It's a standard Next.js 16 app and runs anywhere Node 20.9+ runs.

## Build & run

```bash
npm ci
npm run build      # Turbopack production build
npm run start      # serves on $PORT (default 3000)
```

## Environment (production)

Set these as real environment variables / secrets (never commit):

- `SESSION_SECRET` — strong random value from a secrets manager; rotate periodically.
- `NODE_ENV=production` — enables the Secure cookie flag and prod logging level.
- `NEXT_PUBLIC_APP_ENV=production`, `NEXT_PUBLIC_DEMO_MODE=false` (if not a demo).
- `SESSION_COOKIE_NAME`, `SESSION_MAX_AGE` as desired.
- (Future) `API_BASE_URL`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `LOG_LEVEL`.

## Platforms

### Vercel (simplest)

Import the repo; Vercel detects Next.js. Add env vars in the project settings. HTTPS + HSTS are
handled by the platform.

### Docker (portable)

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["npm","run","start"]
```

> For the smallest image, enable Next.js `output: 'standalone'` and copy `.next/standalone`.

### Node / PaaS / Kubernetes

Run `npm run start` behind a TLS-terminating reverse proxy. Wire probes to **`/api/health`**
(readiness + liveness; returns 503 when down).

## Pre-deploy gate (recommended CI)

```
npm ci
npm run lint
npm run typecheck
npm run coverage
npm run build
CI=1 npm run e2e
npm run audit
```

## Production checklist

- [ ] Serve over **HTTPS** (HSTS is set; it only applies over TLS).
- [ ] Real `SESSION_SECRET` from a vault; rotation policy.
- [ ] Replace demo auth with a real IdP (see [`security-model.md`](./security-model.md)).
- [ ] Nonce-based CSP + CSRF tokens + rate limiting (see [`security-audit.md`](./security-audit.md)).
- [ ] Wire observability sinks (logs/metrics/traces/errors) — [`observability.md`](./observability.md).
- [ ] Back repositories with a real datastore (see [`customization.md`](./customization.md)).
- [ ] Configure caching/CDN and set appropriate `robots`/metadata for public surfaces.
