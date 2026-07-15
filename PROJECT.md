# Project: Next.js 16 Performance Optimization

## Architecture
- Next.js 16 App Router application.
- Development Server: Next.js dev server with Turbopack option (`--turbo`).
- Imports Optimization: Use `optimizePackageImports` in `next.config.mjs` for heavy libraries (lucide-react, recharts, framer-motion, @radix-ui/react-icons).
- Dynamic Components: Dynamically load heavy components using `next/dynamic` with `ssr: false` (heavy 3D canvas, GSAP animation storyboards, Recharts dashboards) to improve hydration and initial load times.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|---|---|---|---|---|
| M1 | Exploration & Target Identification | Identify exact files, components, and import usages for R1 and R2 | none | DONE | f2da9785-3404-4b3f-a3b9-3076200ad630 |
| M2 | Config & Turbopack Implementation (R1) | package.json, next.config.mjs changes | M1 | DONE | 3b8e2a62-017f-4424-9ec0-f38c072b21ef |
| M3 | Dynamic imports for WebGL/3D (R2) | app/page.tsx, components/shared/hero-cinematic-storyboard.tsx | M2 | DONE | 3b8e2a62-017f-4424-9ec0-f38c072b21ef |
| M4 | Dynamic imports for Recharts (R2) | app/admin/page.tsx, app/manager/bao-cao/page.tsx | M3 | DONE | 3b8e2a62-017f-4424-9ec0-f38c072b21ef |
| M5 | Verification & E2E Acceptance | Run full build, check linting, run unit/smoke/E2E tests, audit integrity | M4 | DONE | 8df644e3-aa16-4d67-8de4-a733a8648329, 718b3d0d-5ddd-48fe-8f04-cbc99e6ea59a, 3e6f5af3-1c06-4038-999e-094956b300b5, 3742ffd8-763d-4159-97fd-86de5691c882, bb8befbd-82be-4ea5-9c95-6f8aa60b5c5b, 16a3fdde-ff75-455e-bec7-e96b68dcb6b8 |

## Interface Contracts
### Dynamic Canvas Loading
- Export type/prop interfaces for `Cinematic3DCanvas` and `HeroCinematicStoryboard` must remain unchanged.
- Dynamically imported versions must transparently forward properties.

### Dynamic Chart Loading
- `RevenueChart` must continue to support optional `data` input array.
- In page files, the dynamic chart wrapper components must wrap recharts seamlessly.

## Code Layout
- `package.json` — package scripts configuration.
- `next.config.mjs` — Next.js runtime/build configuration.
- `app/page.tsx` — Main landing page referencing `HeroCinematicStoryboard`.
- `components/shared/hero-cinematic-storyboard.tsx` — Storyboard referencing `Cinematic3DCanvas`.
- `components/shared/cinematic-3d-canvas.tsx` — Heavy WebGL 3D component.
- `app/admin/page.tsx` — Admin dashboard rendering `RevenueChart`.
- `components/manager/revenue-chart.tsx` — Revenue chart component.
- `app/manager/bao-cao/page.tsx` — Manager reports dashboard rendering recharts.
