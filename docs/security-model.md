# Phase 22 — Security Model

> The trust model and threat considerations for Nexus Ops. Implementation details:
> [`security-implementation.md`](./security-implementation.md); assessment:
> [`security-audit.md`](./security-audit.md).

## Trust boundaries

```
Browser (untrusted)
   │  HTTPS + HttpOnly SameSite cookie
   ▼
proxy.ts (authN gate)  ──►  Server Components / Route Handlers (trusted)
                                 │  authorize() + Zod validation
                                 ▼
                            Services ──► Repositories ──► Data store
```

- **Client is never trusted.** UI permission gates (`<Can>`) are UX; the server re-validates
  identity (`requireUser`/proxy) and authorization (`authorize()` in every service).
- **Session** is a signed, HttpOnly cookie; the payload is integrity-protected (HMAC) and
  expiry-bound. It is not encrypted (no secrets inside) — only identity claims.

## Principles

1. **Defense in depth** — authN at proxy + page; authZ at page + service. No single control is
   load-bearing (mitigates middleware-bypass classes like Next.js CVE-2025-29927).
2. **Least privilege** — explicit role→permission matrix; users get the minimum needed
   (see [`rbac.md`](./rbac.md)).
3. **Validate at the boundary** — one Zod schema for client + server; server re-parses.
4. **Secure by default** — strict security headers, HttpOnly/SameSite/Secure cookies, no
   `dangerouslySetInnerHTML`, secrets never `NEXT_PUBLIC_`.
5. **Auditability** — security-relevant actions (incl. denials) are recorded.

## STRIDE overview

| Threat                     | Mitigation                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Spoofing**               | Signed session cookie (HMAC), server-side session verification, demo auth clearly labelled.                         |
| **Tampering**              | HMAC integrity on tokens; Zod validation of all inputs; React escaping; CSV formula-injection guard.                |
| **Repudiation**            | Audit trail with actor, target, IP, timestamp, severity.                                                            |
| **Information disclosure** | HttpOnly cookies; server-only modules (`server-only`); sanitized 500s; secrets server-side; strict Referrer-Policy. |
| **Denial of service**      | Rate-limiting strategy documented (proxy + Redis); health checks; pagination caps.                                  |
| **Elevation of privilege** | Three-layer RBAC; service-layer `authorize()` is the real boundary; `access.denied` audited.                        |

## Assets & data classification

- **Session identity** (userId, role) — integrity-protected, HttpOnly.
- **Business data** (customers/projects/invoices) — demo mock, in-memory, non-sensitive.
- **Secrets** — `SESSION_SECRET` only; env-managed, never committed.

## Demo caveats (not production auth)

- Auth is **simulated**: seeded users + a shared demo password; no password hashing, no real
  IdP, no persistence. A prominent demo banner warns against real credentials.
- Replace `src/lib/auth` with a real IdP behind the same `Session` interface, add password
  hashing/MFA, a persistent session store, CSRF tokens, and rate limiting before production.

## Production hardening roadmap

- Nonce-based CSP (drop `unsafe-inline`/`unsafe-eval`).
- CSRF double-submit tokens for cookie-based mutations.
- Rate limiting (auth + mutations) at the edge.
- Real IdP + MFA + session revocation; secret rotation via a vault.
- Dependency scanning + provenance in CI (see [`security-review.md`](./security-review.md)).
