# Phase 10 — Security Implementation

> Concrete security patterns implemented in the codebase. Trust model & posture:
> [`security-model.md`](./security-model.md); final assessment: [`security-audit.md`](./security-audit.md).

## Secure routing & protected pages

- **`src/proxy.ts`** (Next 16 route guard) verifies the signed session cookie and gates the
  entire `(app)` route group; unauthenticated requests → `/login?next=<path>`. Authenticated
  users are bounced away from auth pages.
- **`requireUser()` / `requirePermission()`** (`src/lib/auth/server.ts`) re-check on the server
  for every protected page — the proxy is not trusted alone (see Next.js CVE-2025-29927 class
  of middleware-bypass issues; enforcement is duplicated in the render path and service layer).

## Session abstraction layer

- `src/lib/auth/session.ts` defines the `Session` interface and signs a stateless token as
  `base64url(payload).HMAC-SHA256(payload)` using `SESSION_SECRET` via the **Web Crypto API**
  (works in Node + Edge). Tokens carry `issuedAt`/`expiresAt` and are expiry-checked on verify.
- The cookie is **HttpOnly**, **SameSite=Lax**, **Secure in production**, `Path=/`, with a
  bounded `Max-Age`. Options: `sessionCookieOptions`.
- This module is the **single seam** to swap for a real IdP (Auth.js/Clerk/Cognito/Entra ID);
  the rest of the app depends only on `Session` + `getSession()`.

## Authorization (defense in depth)

Three enforcement points — route (proxy), page (`requirePermission`), and **operation**
(`authorize()` in every service). Denials record a `critical` `access.denied` audit event. See
[`rbac.md`](./rbac.md).

## Input validation & output encoding

- **Validation:** Zod schemas (`src/lib/validation/schemas.ts`) are the single source, used by
  React Hook Form (client) **and** services/route handlers (server). Never trust client input:
  services re-parse with `safeParse` and throw `400` on failure.
- **Output encoding / XSS:** React escapes by default; the app uses **no** `dangerouslySetInnerHTML`.
  CSV export neutralizes spreadsheet formula injection (`=,+,-,@` prefixing) and quotes fields
  (`components/data-table/export-csv.ts`).

## Security headers (`next.config.ts`)

Applied to every response via `headers()`:

- `Content-Security-Policy` (default-src 'self'; `frame-ancestors 'none'`; `object-src 'none'`;
  `base-uri 'self'`; `form-action 'self'`).
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo off),
  `Strict-Transport-Security` (HSTS, prod), and `poweredByHeader: false`.

> **Hardening note:** the demo CSP allows `'unsafe-inline'`/`'unsafe-eval'` for dev ergonomics.
> For production, move to a **per-request nonce CSP** set in `proxy.ts` and drop the unsafe
> directives (tracked in [`security-audit.md`](./security-audit.md)).

## CSRF strategy

- Session cookie is **SameSite=Lax**, mitigating cross-site POSTs.
- The browser client sends `credentials: 'same-origin'` only; API is same-origin.
- CSP `form-action 'self'` blocks cross-origin form posts.
- **Production recommendation:** add a double-submit CSRF token (or Origin/Sec-Fetch-Site
  checks) for state-changing route handlers when cookies are used cross-context.

## Rate limiting strategy

- Not enabled in the in-memory demo. Recommended design: a token-bucket keyed by IP + route in
  `proxy.ts` (edge) backed by Redis/Upstash for auth and mutation endpoints, returning `429`
  with `Retry-After`. Metrics counters (`http.request`/`http.error`) already provide the hook.

## Secrets management

- Only `SESSION_SECRET` (server-only, never `NEXT_PUBLIC_`) — see `.env.example`.
- `.env*` is git-ignored; no secrets are committed. Public config uses the `NEXT_PUBLIC_` prefix
  intentionally.
- In production, source `SESSION_SECRET` from a secrets manager and rotate periodically.

## Audit trail

`src/lib/audit` appends structured, severity-tagged events (login/logout, CRUD, settings
changes, access denials) and mirrors them to the logger. Surfaced on the dashboard and in
Settings → Audit log. See [`observability.md`](./observability.md).
