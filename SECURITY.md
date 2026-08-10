# Security Policy

> **Demo notice:** Nexus Ops is a demonstration / starter template. Authentication and data
> are **simulated** (seeded, in-memory). Do not deploy it as-is for production use — see the
> hardening checklist in [`docs/security-model.md`](docs/security-model.md).

## Supported versions

This is a template repository; the `main` branch is the supported line.

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue for anything
exploitable.

- Preferred: open a [GitHub Security Advisory](https://github.com/brathod1432/saas-dashboard-demo/security/advisories/new)
  (private).
- Or email the maintainer listed in [`/.well-known/security.txt`](public/.well-known/security.txt).

Please include: affected version/commit, reproduction steps, impact, and any suggested fix.
We aim to acknowledge within a few business days.

## Scope

In scope: the application code in this repository (auth/session abstraction, RBAC, route
handlers, input validation, security headers, CSV export).

Out of scope: the intentionally-simulated demo authentication, seeded mock data, and any
third-party service you connect when adapting the starter.

## Implemented controls

See [`docs/security-implementation.md`](docs/security-implementation.md) and
[`docs/security-audit.md`](docs/security-audit.md). Highlights: 3-layer RBAC, signed HttpOnly
sessions, shared Zod validation, login rate limiting + lockout, same-origin/CSRF checks on
mutations, strict security headers, and an audit trail.

## Dependencies

`npm audit` runs in CI and Dependabot proposes updates. Every dependency was reviewed before
adoption ([`docs/security-review.md`](docs/security-review.md)).
