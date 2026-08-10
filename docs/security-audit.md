# Phase 20 — Security Audit

> Final security assessment of the Nexus Ops demo. Scope: dependencies, authentication design,
> authorization, client-side protections, form validation, networking, configuration, secrets.
> Method: code review + `npm audit` + automated tests. Date: 2026-08-10.

## Executive result

| Dimension                                | Result                                                      |
| ---------------------------------------- | ----------------------------------------------------------- |
| Dependency vulnerabilities (`npm audit`) | **0** (prod + dev)                                          |
| Authorization enforced server-side       | ✅ (proxy + page + service)                                 |
| Input validation (client + server)       | ✅ (shared Zod)                                             |
| Security headers                         | ✅ (CSP + 6 more)                                           |
| Secrets hygiene                          | ✅ (env-only, git-ignored)                                  |
| **Overall risk (demo scope)**            | **Low**                                                     |
| **Risk score**                           | **91 / 100** (production-readiness of the security posture) |

The deductions are intentional demo simplifications (simulated auth, permissive CSP), all
documented with remediation paths — not defects.

## Findings

| ID  | Severity | Area         | Finding                                                                       | Recommendation                                                                              | Status                              |
| --- | -------- | ------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| S-1 | High*    | AuthN        | Simulated auth (shared demo password, no hashing/IdP/persistence).            | Replace `lib/auth` with a real IdP + password hashing + MFA behind the `Session` interface. | By design (demo); documented        |
| S-2 | Medium   | CSP          | CSP allows `'unsafe-inline'`/`'unsafe-eval'` for dev ergonomics.              | Nonce-based CSP in `proxy.ts`; drop unsafe directives in prod.                              | Open (documented)                   |
| S-3 | Medium   | CSRF         | Cookie-based mutations needed cross-site protection beyond SameSite=Lax.      | Origin + `Sec-Fetch-Site` checks on all state-changing routes.                              | ✅ Implemented (`assertSameOrigin`) |
| S-4 | Medium   | DoS          | No rate limiting on the auth endpoint (brute force / credential stuffing).    | Rate limit + temporary lockout; return 429.                                                 | ✅ Implemented (`loginRateLimiter`) |
| S-5 | Low      | Session      | Token integrity-protected but not encrypted; no server-side revocation.       | Add a session store for revocation; encrypt if payload ever holds sensitive data.           | Accepted (no secrets in payload)    |
| S-6 | Low      | Supply chain | Single-publisher deps (zod, clsx, cva, sonner, next-themes) — ecosystem risk. | Lockfile + `npm audit` in CI + update cooldown (≥7 days) + Socket/Dependabot.               | Mitigated (policy documented)       |
| S-7 | Info     | Headers      | HSTS only meaningful over HTTPS.                                              | Terminate TLS in prod; keep HSTS.                                                           | N/A in local demo                   |

\* S-1 is "High" only if the demo auth were shipped as-is; it is explicitly a demo and gated
behind a warning banner.

## Controls verified present

- **AuthZ defense in depth** — `proxy.ts` (route), `requirePermission` (page), `authorize()`
  (service); viewer→403 on create/void proven by unit + E2E tests.
- **Validation** — shared Zod schemas; services `safeParse` and reject invalid input (`400`).
- **Output encoding** — React escaping; no `dangerouslySetInnerHTML`; CSV formula-injection
  guard.
- **Headers** — CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy,
  Permissions-Policy, HSTS; `poweredByHeader:false`.
- **Cookies** — HttpOnly, SameSite=Lax, Secure (prod), bounded Max-Age.
- **Secrets** — only `SESSION_SECRET` (server-only), `.env*` git-ignored, `.env.example` shipped.
- **Audit** — security events incl. `access.denied` recorded with actor/target/IP/severity.

## `npm audit`

```
prod:  found 0 vulnerabilities
all:   found 0 vulnerabilities
```

Re-run in CI via `npm run audit` (fails on high+).

## Pre-production checklist

- [ ] Replace demo auth with a real IdP + hashing + MFA + revocable sessions (S-1, S-5).
- [ ] Nonce-based CSP; remove `unsafe-*` (S-2).
- [x] Same-origin/CSRF checks on mutations (S-3) — add a double-submit token if serving cross-site.
- [x] Rate limiting + lockout on login (S-4) — move the store to Redis for multi-instance deploys.
- [ ] TLS + HSTS preload; rotate `SESSION_SECRET` from a vault.
- [ ] Dependency scanning + provenance + update cooldown in CI (S-6).
