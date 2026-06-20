# Vero Guardian Dashboard Style Guide

This guide documents the component development patterns already used in the
dashboard. The app does not define a custom Tailwind token extension; design
tokens are expressed through Tailwind's default utility classes, light/dark
class variants, the Inter font loaded in `src/app/layout.tsx`, and shared
composition patterns in `src/app/page.tsx` and `src/components`.

## Component Composition Pathways

### Application Shell

New page-level UI should follow the existing provider and shell structure:

1. `src/app/layout.tsx` loads global CSS, the Inter font, and the root body
   colors.
2. Context providers wrap all dashboard UI in this order: i18n, alerts, theme,
   network, wallet, role, error modal, and toast.
3. `src/app/page.tsx` composes the main dashboard with a sticky header, alert
   banner, responsive content grid, guarded admin section, and footer.
4. Feature components live under `src/components`, with multi-file components
   grouped in folders that expose an `index.ts` or `index.tsx` entry point.

Keep provider-dependent components as client components with `'use client'`.
Components that depend on wallet, role, network, alerts, theme, translations,
error modal state, or browser storage should stay below the providers in
`RootLayout`. Keep `NetworkProvider` above `RoleProvider`, because role checks
read the active network configuration.

### Dashboard Cards

The dominant dashboard surface is a rounded, bordered card:

```tsx
<div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
  {children}
</div>
```

Use this pathway for feature modules such as search, security scanner results,
leaderboard, quick actions, and admin controls. Nested list items usually step
down to `rounded-xl`, `p-4`, `shadow-sm`, and `dark:bg-slate-800/50`.

### Feature Modules

Feature modules should keep domain logic close to the component when it is
component-specific, or split pure logic into adjacent files when it is tested
independently:

- `ComponentName.tsx` for simple UI modules such as `ConnectButton` or
  `AlertBanner`.
- `ComponentFolder/ComponentName.tsx` plus `ComponentFolder/index.ts` for
  larger modules such as `NetworkStatus`, `BatchTxBuilder`, and
  `ContractTimeTraveler`.
- `__tests__` beside the component or service being tested.
- Shared state belongs in `src/context`; reusable hooks belong in `src/hooks`;
  service or API boundaries belong in `src/services`.

Wrap dashboard feature modules in `ErrorBoundary` at the page level when a
failed widget should not bring down the full dashboard.

### Controls And State

Buttons use compact flex layouts, Lucide icons, visible focus rings, and state
styles that preserve the same footprint between loading, disabled, and ready
states. Existing button families:

- Primary action: `bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg`.
- Destructive action: `bg-red-600 hover:bg-red-700 text-white`.
- Warning action: `bg-amber-500 hover:bg-amber-600 text-white`.
- Secondary action: `bg-slate-100 hover:bg-slate-200 dark:bg-slate-800
  dark:hover:bg-slate-700`.
- Success or completed state: `bg-emerald-50 dark:bg-emerald-900/30
  text-emerald-700 dark:text-emerald-400`.

Interactive controls should include `focus:outline-none` and a token-colored
`focus:ring-2`, usually `focus:ring-indigo-500`. Use `aria-label`,
`aria-live`, `role="status"`, or `role="alert"` when the control changes
status text or represents async work.

## Theme Layouts

### Theme Runtime

The app uses Tailwind `darkMode: 'class'` in `tailwind.config.ts`. The
`ThemeProvider` in `src/context/ThemeContext.tsx` stores `light`, `dark`, or
`system` in `localStorage`, resolves the active theme from
`prefers-color-scheme` when needed, and toggles the `dark` class on
`document.documentElement`.

`ThemeToggle` cycles between system, explicit light, and explicit dark. It
renders an invisible placeholder before hydration so the header layout does not
shift while the stored theme is loaded.

### Layout Tokens

Use these existing layout patterns:

| Pattern | Classes |
| --- | --- |
| Root body | `min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200` |
| Page wrapper | `min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100` |
| Sticky header | `border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40` |
| Main width | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| Dashboard grid | `grid grid-cols-1 lg:grid-cols-3 gap-6` |
| Card shell | `bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg` |
| Inner item | `bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm` |
| Brand mark | `bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg sm:rounded-xl shadow-lg shadow-indigo-900/30` |

Keep the layout responsive with `sm:` and `lg:` breakpoints already used in the
page: single-column on small screens, three-column dashboard layout on large
screens, and compact header controls that hide nonessential text at smaller
widths.

## Color Codes

Colors come from Tailwind's default palette. Use the utility names in code and
the hex values below for design review or external assets.

### Neutral Surfaces

| Token | Hex | Usage |
| --- | --- | --- |
| `white` | `#ffffff` | Light cards, menus, footer |
| `slate-50` | `#f8fafc` | Light page background |
| `slate-100` | `#f1f5f9` | Secondary light controls |
| `slate-200` | `#e2e8f0` | Light borders |
| `slate-300` | `#cbd5e1` | Input borders |
| `slate-400` | `#94a3b8` | Muted dark-mode text/icons |
| `slate-500` | `#64748b` | Secondary text |
| `slate-600` | `#475569` | Light-mode helper text |
| `slate-700` | `#334155` | Dark secondary borders/text |
| `slate-800` | `#1e293b` | Dark controls and inner cards |
| `slate-900` | `#0f172a` | Dark cards and strong text |
| `slate-950` | `#020617` | Dark page background |

### Brand And Action Colors

| Token | Hex | Usage |
| --- | --- | --- |
| `indigo-400` | `#818cf8` | Dark-mode brand icons and links |
| `indigo-500` | `#6366f1` | Focus rings |
| `indigo-600` | `#4f46e5` | Primary buttons and brand gradient |
| `indigo-700` | `#4338ca` | Primary hover |
| `violet-400` | `#a78bfa` | Dark-mode secondary brand icon |
| `violet-600` | `#7c3aed` | Brand gradient endpoint |
| `sky-400` | `#38bdf8` | Dark-mode informational accents |
| `sky-600` | `#0284c7` | Network settings save action |
| `blue-800` | `#1e40af` | Informational alert text |

### Status Colors

| State | Light utilities | Dark utilities |
| --- | --- | --- |
| Success/healthy | `emerald-50 #ecfdf5`, `emerald-200 #a7f3d0`, `emerald-600 #059669`, `emerald-700 #047857` | `emerald-400 #34d399`, `emerald-800 #065f46`, `emerald-900 #064e3b` |
| Warning/degraded | `amber-50 #fffbeb`, `amber-200 #fde68a`, `amber-500 #f59e0b`, `amber-700 #b45309`, `amber-800 #92400e` | `amber-400 #fbbf24`, `amber-800 #92400e`, `amber-900 #78350f`, `amber-950 #451a03` |
| Error/offline | `red-50 #fef2f2`, `red-200 #fecaca`, `red-500 #ef4444`, `red-600 #dc2626`, `red-700 #b91c1c`, `red-800 #991b1b` | `red-400 #f87171`, `red-700 #b91c1c`, `red-800 #991b1b`, `red-900 #7f1d1d`, `red-950 #450a0a` |
| High severity | `orange-50 #fff7ed`, `orange-100 #ffedd5`, `orange-300 #fdba74`, `orange-800 #9a3412` | `orange-200 #fed7aa`, `orange-700 #c2410c`, `orange-800 #9a3412`, `orange-900 #7c2d12`, `orange-950 #431407` |
| Low/info severity | `sky-50 #f0f9ff`, `sky-100 #e0f2fe`, `sky-200 #bae6fd`, `sky-800 #075985` | `sky-200 #bae6fd`, `sky-700 #0369a1`, `sky-800 #075985`, `sky-900 #0c4a6e`, `sky-950 #082f49` |

Opacity suffixes such as `dark:bg-slate-900/50`, `bg-white/80`, and
`dark:bg-emerald-900/30` are used for layered surfaces. Preserve these when a
surface needs depth without adding a new palette.

## Custom Loading Indicators

The project uses Lucide's `Loader2` with Tailwind `animate-spin` rather than a
separate spinner component.

Use the full-panel loading pattern for widgets that block their own content:

```tsx
<div className="flex flex-col items-center justify-center py-20" role="status" aria-live="polite">
  <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-500 animate-spin mb-4" />
  <p className="text-slate-600 dark:text-slate-400">Loading...</p>
</div>
```

Use inline loading for buttons or submit actions:

```tsx
<button disabled className="inline-flex items-center gap-2 ... cursor-wait">
  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
  <span>Signing...</span>
</button>
```

Loading states should keep the same control dimensions as the ready state,
disable unsafe actions, and expose status text through visible copy or
accessible labels. For async role or wallet checks, existing components use
muted slate button styles with `cursor-wait` or `cursor-not-allowed`.

## Typography Usage Patterns

The dashboard uses Inter globally through `next/font/google`. Typography is
driven by Tailwind text utilities rather than custom CSS.

| Role | Classes | Usage |
| --- | --- | --- |
| App title | `text-xl font-bold text-slate-900 dark:text-white` | Header product name |
| Page section title | `text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white` | Welcome panel heading |
| Card title | `text-lg font-semibold text-slate-900 dark:text-white` | Widget headings |
| List title | `font-medium text-slate-900 dark:text-white` | PR titles and action rows |
| Body text | `text-sm text-slate-600 dark:text-slate-400` or `text-slate-600 dark:text-slate-400` | Descriptions and helper text |
| Eyebrow label | `text-xs font-semibold uppercase tracking-wider` | Stats labels, admin section labels, form groups |
| Badge text | `text-xs font-bold uppercase tracking-wide` or `text-sm font-medium` | Status and severity badges |
| Technical value | `font-mono text-xs` or `font-mono text-sm` | Wallet addresses, hashes, RPC endpoints, timers |
| Numeric emphasis | `text-2xl font-bold` or `text-3xl font-mono font-bold tabular-nums` | Stats and session timer |

Prefer semantic headings for section boundaries, keep helper copy muted with
slate text colors, and use `font-mono` only for addresses, hashes, endpoints,
durations, or other exact technical values. Existing labels use uppercase with
positive letter spacing through `tracking-wider`; do not introduce negative
letter spacing.

## Accessibility And Interaction Notes

- Pair decorative Lucide icons with `aria-hidden="true"`.
- Give icon-only or compact controls an `aria-label`.
- Use `aria-live="polite"` for changing status text and `role="alert"` for
  urgent failures.
- Keep keyboard focus visible with token-colored rings.
- Preserve `min-w-0`, `truncate`, and responsive `hidden sm:inline` patterns
  where addresses, PR titles, and endpoint URLs could overflow.
- Use `AccessControl` for role-gated admin features rather than hiding access
  checks inside presentation components.
