# Phase 18 — Performance

> Targets (Lighthouse): **Performance ≥ 90 · Accessibility ≥ 95 · SEO ≥ 90 · Best Practices ≥ 95**.
> This documents the techniques applied and how to measure.

## Techniques applied

- **RSC-first rendering** — protected pages render on the server and read repositories directly,
  avoiding client data waterfalls and shipping less JS.
- **Code splitting** — App Router route-level splitting; heavy interactive widgets (charts,
  data tables, dialogs) are client islands loaded only where used.
- **Tree shaking / smaller imports** — `optimizePackageImports` for `lucide-react`, `recharts`,
  `date-fns` (`next.config.ts`); named imports throughout.
- **Turbopack** builds (default in Next 16) with filesystem caching.
- **Fonts** — `next/font` self-hosts Geist (no external font requests; no layout shift via
  `font-display` handling and CSS variables).
- **CSS** — Tailwind v4 generates only used utilities; tokens avoid runtime CSS-in-JS.
- **Charts** — entrance animation disabled by default; sparklines use tiny datasets.
- **Query caching** — TanStack Query `staleTime` 30s, `refetchOnWindowFocus: false` to cut
  redundant fetches.
- **Images** — none heavy; `next/image` available; SVGs inline via lucide.

## Measuring

```bash
npm run build      # production build (Turbopack)
npm run start      # serve prod on :3000
npx lighthouse http://localhost:3000/login --view   # or Chrome DevTools > Lighthouse
```

Measure authenticated pages by logging in first (or run Lighthouse with a session cookie).
For CI, add `@lhci/cli` (Lighthouse CI) with budgets matching the targets above.

## Budgets

| Metric         | Budget  |
| -------------- | ------- |
| Performance    | ≥ 90    |
| Accessibility  | ≥ 95    |
| Best Practices | ≥ 95    |
| SEO            | ≥ 90    |
| LCP            | < 2.5s  |
| CLS            | < 0.1   |
| TBT            | < 200ms |

## Notes & follow-ups

- SEO: the app is `robots: noindex` (a private product) by design; the public landing page uses
  semantic headings + metadata. Adjust robots for a real marketing site.
- Consider `dynamic()` import for the Recharts bundle on routes where charts are below the fold.
- Add Lighthouse CI + a bundle-analyzer step to guard regressions.
