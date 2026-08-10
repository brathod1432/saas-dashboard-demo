# Phase 17 — Accessibility

> Target: **WCAG 2.1 AA**. Accessibility is treated as a functional requirement, not a
> retrofit. Automated checks run via **jest-axe** (components) and Playwright (flows).

## Standards & approach

- Semantic-first markup (landmarks, headings, lists, tables) before ARIA.
- Radix UI primitives provide robust keyboard interaction and ARIA for menus, dialogs, selects,
  tabs, tooltips, switches, and checkboxes.
- Automated a11y assertions on reusable components (Button, DataTable, states) — zero
  violations required (`toHaveNoViolations`).

## Perceivable

- **Contrast:** token pairings target AA (≥ 4.5:1 body text, ≥ 3:1 large text / UI borders) in
  both themes. Status colors pair with sufficient-contrast foregrounds.
- **Text scaling:** rem-based type; layouts reflow with zoom.
- **Non-text:** decorative icons are `aria-hidden`; meaningful icon-only buttons have
  `aria-label` (theme toggle, nav toggles, pagination, notifications).

## Operable

- **Keyboard:** every interactive element is reachable and operable by keyboard; Radix handles
  focus trapping (dialogs), roving focus (menus/tabs), and ESC-to-close.
- **Skip link:** "Skip to main content" is the first focusable element (`app/layout.tsx`);
  `<main id="main-content" tabIndex={-1}>` receives focus.
- **Visible focus:** global `:focus-visible` ring (`globals.css`), never removed.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables animations/transitions
  globally; chart entrance animation is off by default.

## Understandable

- **Forms:** `components/forms/field.tsx` associates `<label htmlFor>`, description, and error
  via ids and sets `aria-invalid` + `aria-describedby`; errors use `role="alert"`.
- **Consistent navigation:** persistent sidebar with `aria-current="page"` on the active item.
- **Status messaging:** toasts (sonner) and `role="alert"`/`role="status"` regions for errors,
  demo banner, and loading (`aria-busy`).

## Robust

- **Tables:** semantic `<table>`/`<thead>`/`<tbody>`; sortable headers set `aria-sort`
  (ascending/descending/none) on the `<th>`; selection checkboxes are labelled.
- **Dialogs:** labelled by title + description (Radix wires `aria-labelledby`/`describedby`).
- **Language:** `<html lang="en">`.

## Automated results

- **jest-axe:** 0 violations across tested components (Button, DataTable, EmptyState).
- **Playwright:** keyboard/label-based selectors exercise real flows (login, nav, dialog).
- Recommended addition: `@axe-core/playwright` page scans per route in CI, and a Lighthouse a11y
  budget (target ≥ 95 — see [`performance.md`](./performance.md)).

## Manual QA checklist

- [ ] Tab through every page: logical order, visible focus, no traps.
- [ ] Operate menus/dialogs/selects/tabs with keyboard only.
- [ ] Screen-reader pass (NVDA/VoiceOver): landmarks, labels, live regions announce.
- [ ] 200% zoom: no clipping/overlap; content reflows.
- [ ] Forced-colors / high-contrast mode sanity check.
- [ ] `prefers-reduced-motion`: no essential motion.

## Known follow-ups

- Add automated per-route axe scans and a Lighthouse CI a11y gate.
- Add a labelled global-search landmark and a command palette with full keyboard support.
