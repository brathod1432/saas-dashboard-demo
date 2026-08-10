# Phase 2 — Design Research

> Free, open-source design & component inspiration sources evaluated for the
> **Nexus Ops** enterprise SaaS dashboard (Next.js 16 · React 19 · Tailwind v4 · shadcn pattern).
>
> **Principle:** never blindly copy components — **adapt, harden, and own** the code.
> Every source is reviewed for license, security, and fit before use.

## How sources were evaluated

1. **License compatibility** — permissive OSS only (MIT / ISC / Apache-2.0). Copyleft
   (AGPL) app code is excluded.
2. **Open-source status** — public repo, real maintenance.
3. **Security review** — does it ship runtime JS or copy-paste code? Any external tracking
   scripts, telemetry, network calls, or obfuscated code?
4. **Fit** — value for an accessible, enterprise data dashboard.
5. **Risk assessment** — Low / Medium / High.

## Summary table

| Source                   | License (SPDX)                                    | Ships runtime JS? | Tracking/telemetry | Security review                              | Risk    | Decision                      |
| ------------------------ | ------------------------------------------------- | ----------------- | ------------------ | -------------------------------------------- | ------- | ----------------------------- |
| shadcn/ui                | MIT                                               | No — copy/paste   | None in components | Own the code; audit CLI registry pulled from | Low     | **Use (pattern)**             |
| Radix UI                 | MIT (WorkOS)                                      | Yes (dep)         | None               | Accessible primitives; widely audited        | Low     | **Use**                       |
| Tremor                   | Apache-2.0                                        | Yes (dep)         | None               | Patent grant + NOTICE; slowing npm cadence   | Low     | **Reference patterns**        |
| Recharts                 | MIT                                               | Yes (dep)         | None               | Ubiquitous, D3-based                         | Low     | **Use**                       |
| Aceternity UI (free)     | MIT (free tier)                                   | No — copy/paste   | None               | Free tier only; Pro is commercial            | Low–Med | **Reference only**            |
| Magic UI                 | MIT                                               | No — copy/paste   | None               | Audit-on-paste                               | Low     | **Reference only**            |
| HyperUI                  | MIT                                               | No — HTML markup  | None               | Zero-dependency static markup                | Low     | **Reference**                 |
| Flowbite (free)          | MIT                                               | Optional dep      | None               | Keep free/Pro separate; not Radix-a11y       | Low     | **Reference**                 |
| Origin UI                | Mixed: **AGPL-3.0** repo / **MIT** component dirs | No — copy/paste   | None               | Only copy from MIT dirs; legal note          | Low–Med | **Reference (MIT dirs only)** |
| lucide-react             | ISC (+MIT Feather icons)                          | Yes (dep)         | None               | Pure SVG, tree-shakeable                     | Low     | **Use**                       |
| clsx                     | MIT                                               | Yes (dep)         | None               | Tiny utility                                 | Low     | **Use**                       |
| tailwind-merge           | MIT                                               | Yes (dep)         | None               | Tiny utility                                 | Low     | **Use**                       |
| class-variance-authority | **Apache-2.0**                                    | Yes (dep)         | None               | Note: Apache, not MIT                        | Low     | **Use**                       |
| sonner                   | MIT                                               | Yes (dep)         | None               | Accessible toasts                            | Low     | **Use**                       |
| next-themes              | MIT                                               | Yes (dep)         | None               | No-flash theming                             | Low     | **Use**                       |

## Detailed reviews

### shadcn/ui — _pattern adopted, not a dependency_

- **License:** MIT. Docs say "no attribution required" (a practical relaxation of MIT).
- **Security:** Code-distribution model — components are copied into our repo, so we own and
  audit them. The CLI performs network calls to fetch registries; the components themselves
  carry no telemetry or obfuscation.
- **Why chosen:** Industry-standard Radix + Tailwind pattern; full ownership, no lock-in.
- **How we use it:** We hand-author shadcn-style primitives in `src/components/ui` (button,
  card, input, table, dialog, …) adapted to Tailwind v4 tokens — no blind CLI copy.
- **Risk:** Low. Diligence = audit any snippet we adapt.

### Radix UI — _dependency_

- **License:** MIT. **Security:** Unstyled accessible primitives; no telemetry/network calls.
- **Why chosen:** Best-in-class a11y (ARIA, focus management, keyboard nav) — essential for
  the WCAG AA target. **Risk:** Low.

### Tremor — _reference patterns only_

- **License:** Apache-2.0 (patent grant + NOTICE obligation).
- **Why referenced (not installed):** Excellent dashboard/KPI/chart layout ideas; we
  reimplement equivalents on Recharts to avoid an extra dependency and its slowing npm
  release cadence. **Risk:** Low.

### Recharts — _dependency_

- **License:** MIT. Ubiquitous React charting on D3; no telemetry. **Risk:** Low.
- **Why chosen:** Declarative, composable, accessible-friendly, huge community.

### Aceternity UI / Magic UI — _reference only_

- **Licenses:** MIT free tiers (Aceternity **Pro** is a restrictive commercial license — we
  never copy Pro blocks). **Security:** copy/paste; audit each snippet; they pull motion libs
  we deliberately avoid for a data dashboard. **Risk:** Low–Medium. **Decision:** inspiration
  for micro-interactions only; not used in core app to keep the bundle lean.

### HyperUI / Flowbite (free) / Origin UI — _markup references_

- **HyperUI:** MIT, zero-dependency HTML+Tailwind — safest possible; used for table/form
  layout inspiration. **Flowbite free:** MIT; optional JS avoided; not Radix-based so used
  sparingly. **Origin UI:** mixed repo — **only MIT-licensed component directories** are
  referenced; AGPL-3.0 app code is explicitly excluded (enterprise copyleft prohibition).

### Utility libs (lucide-react, clsx, tailwind-merge, cva, sonner, next-themes)

- Small, ubiquitous, permissive. **License note for SBOM:** `class-variance-authority` and
  `Tremor` are **Apache-2.0**; `lucide-react` is **ISC** (Feather-derived icons MIT). All
  others MIT. None ship trackers or obfuscated code.

## Rejected alternatives

| Rejected                                        | Reason                                                                                                                       |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Tailwind Plus / Tailwind UI**                 | Paid-only; copyrighted, cannot be redistributed/open-sourced — fails FREE requirement.                                       |
| **Freemium admin templates bundling analytics** | Free tiers limited; several ship third-party trackers (GA/marketing pixels) in demos — privacy/data-handling risk.           |
| **Any AGPL-3.0 component/app code**             | Network-copyleft obligations most enterprises prohibit. (Origin UI's MIT _component_ dirs are OK; its AGPL app code is not.) |
| **MUI X Pro/Premium (data grid/charts)**        | Commercially licensed; easy to pull accidentally. MUI core is MIT but not our chosen pattern.                                |

## Adaptation & hardening policy

- Copy-paste sources land in our repo → **mandatory snippet audit** for inline `fetch`,
  external URLs, or trackers before merge (none currently used ship trackers).
- Enforce **free-vs-Pro** separation for Aceternity/Flowbite.
- Record non-MIT licenses (Apache-2.0, ISC) in the dependency inventory
  (see [`security-review.md`](./security-review.md)).
- Prefer **fewer runtime dependencies**: reimplement chart/KPI patterns on Recharts rather
  than adding Tremor.
