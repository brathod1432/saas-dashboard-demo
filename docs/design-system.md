# Phase 6 — Design System

> The Nexus Ops design system. Tokens live in
> <code>src/app/globals.css</code> (Tailwind v4 CSS-first `@theme`); components live in
> `src/components/ui`. Goals: **premium, modern, enterprise, clean, highly usable** — with
> accessibility and consistency over visual effects.

## Foundations

### Tokens & theming

All colors are stored as **HSL channel triplets** in CSS variables so opacity modifiers work
(`bg-primary/10`). Light values live in `:root`; dark overrides in `.dark` (applied by
`next-themes`, class strategy). Variables are mapped to Tailwind color utilities in
`@theme inline`, so `bg-card`, `text-muted-foreground`, `border-input`, `ring-ring`, etc. are
first-class utilities.

### Color palette

| Token                                          | Role                  | Light                             | Dark                  |
| ---------------------------------------------- | --------------------- | --------------------------------- | --------------------- |
| `background` / `foreground`                    | Page surface / text   | white / slate-900                 | slate-950 / slate-100 |
| `card` / `popover`                             | Elevated surfaces     | white                             | slate-900             |
| `primary`                                      | Brand (indigo/violet) | `243 75% 59%`                     | `243 75% 66%`         |
| `secondary` / `muted` / `accent`               | Subtle surfaces       | slate-100                         | slate-800             |
| `success` / `warning` / `destructive` / `info` | Semantic status       | green / amber / red / blue        | tuned for dark        |
| `border` / `input` / `ring`                    | Lines & focus         | slate-200 / brand                 | slate-800 / brand     |
| `chart-1…5`                                    | Data series           | brand, green, amber, violet, cyan | tuned for dark        |
| `sidebar*`                                     | Navigation surface    | slate-900                         | slate-950             |

All text/background pairings target **WCAG AA** contrast (≥ 4.5:1 for body, ≥ 3:1 for large
text / UI). See [`accessibility.md`](./accessibility.md).

### Typography

- Font: **Geist Sans** (UI), **Geist Mono** (codes/IDs), via `next/font` (self-hosted, no
  external requests).
- Scale (Tailwind): `text-xs` 12 · `text-sm` 14 (base UI) · `text-base` 16 · `text-lg` 18 ·
  `text-2xl` 24 (page titles) · `text-4xl/5xl` marketing.
- Weights: 400 body, 500 medium (labels/nav), 600 semibold (headings).

### Spacing, radius, elevation

- **Spacing:** Tailwind 4-pt scale; page gutters `px-4 lg:px-8`, card padding `p-5/p-6`,
  section gaps `space-y-6`.
- **Radius:** `--radius: 0.625rem`; utilities `rounded-md/lg/xl` derive from it.
- **Elevation:** `shadow-sm` (cards), `shadow-md` (popovers/menus), `shadow-lg` (dialogs).
  Elevation is subtle — borders do most of the separation for a clean enterprise look.

## Components (`src/components/ui`)

shadcn-style, Radix-powered, fully owned in-repo (see
[`design-research.md`](./design-research.md)). Every interactive primitive is keyboard
accessible and themed via tokens.

| Component                                                                              | Notes                                                                                                            |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `Button`                                                                               | `default/destructive/outline/secondary/ghost/link` × `sm/default/lg/icon`; `asChild` via Radix Slot; focus ring. |
| `Card`                                                                                 | Header/Title/Description/Content/Footer composition.                                                             |
| `Input` / `Textarea`                                                                   | `aria-invalid` styling hook; disabled states.                                                                    |
| `Label`                                                                                | Radix Label, associates with controls.                                                                           |
| `Badge`                                                                                | `default/secondary/success/warning/destructive/info/outline`.                                                    |
| `Table`                                                                                | Semantic `<table>` with sticky-friendly header styles.                                                           |
| `Dialog`                                                                               | Radix Dialog; focus trap, ESC close, overlay, labelled title/description.                                        |
| `DropdownMenu`                                                                         | Radix menu with checkbox items (column toggles).                                                                 |
| `Select`                                                                               | Radix Select; keyboard + type-ahead.                                                                             |
| `Avatar`, `Checkbox`, `Switch`, `Separator`, `Tabs`, `Tooltip`, `Progress`, `Skeleton` | Radix-based, themed.                                                                                             |

## Patterns

- **Cards** — the default container for grouped content; `CardHeader` for title + optional
  action, `CardContent` for body. KPI variant: `components/dashboard/stat-card.tsx`.
- **Buttons** — one primary action per view; secondary/outline for the rest; destructive only
  for irreversible actions with confirmation.
- **Forms** — `components/forms/field.tsx` wraps label + description + error with correct
  `aria-invalid`/`aria-describedby`; `SubmitButton` shows a spinner while pending. RHF + Zod.
- **Tables** — `components/data-table/data-table.tsx` for enterprise lists; plain `Table` for
  static detail views.
- **Charts** — `components/charts/charts.tsx` (Recharts) using `chart-*` tokens and a themed
  tooltip.

### State patterns (`src/components/shared/states.tsx`)

- **Loading** — `TableSkeleton`, `CardsSkeleton`, and `Skeleton` blocks with `aria-busy`.
- **Empty** — `EmptyState`: neutral icon, title, description, optional CTA (dashed border).
- **Error** — `ErrorState`: `role="alert"`, destructive accent, retry affordance.
- **Alerts** — dashboard `AlertsPanel` maps `info/success/warning/critical` to icon + tint.

## Usage rules

1. Never hard-code hex colors in components — use tokens so dark mode and re-theming work.
2. Prefer composition (`Card` + `Button`) over new bespoke components.
3. Keep one primary CTA per screen; gate privileged actions with `<Can>`.
4. Respect `prefers-reduced-motion` (handled globally) — avoid essential motion.
5. All icons are decorative unless labelled; interactive icon-only controls need `aria-label`.
