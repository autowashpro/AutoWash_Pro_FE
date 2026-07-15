## 2026-07-15T12:35:13Z
You are teamwork_preview_worker. Your task is to implement the Next.js 16 performance optimizations (R1 and R2) for AutoWash_Pro_FE.

Follow the findings and proposals from the explorer's analysis.md:
1. In package.json, change the dev script from `"dev": "next dev"` to `"dev": "next dev --turbo"`.
2. In next.config.mjs, add optimizePackageImports configuration within experimental:
```javascript
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      '@radix-ui/react-icons'
    ]
  }
```
3. In app/page.tsx, convert the static import of HeroCinematicStoryboard to a dynamic import with `ssr: false`:
```typescript
import dynamic from 'next/dynamic'

const HeroCinematicStoryboard = dynamic(
  () => import('@/components/shared/hero-cinematic-storyboard').then(mod => mod.HeroCinematicStoryboard),
  { ssr: false }
)
```
4. In components/shared/hero-cinematic-storyboard.tsx, convert the static import of Cinematic3DCanvas to a dynamic import with `ssr: false`:
```typescript
import dynamic from 'next/dynamic'

const Cinematic3DCanvas = dynamic(
  () => import('./cinematic-3d-canvas').then(mod => mod.Cinematic3DCanvas),
  { ssr: false }
)
```
5. In app/admin/page.tsx, convert the static import of RevenueChart to a dynamic import with `ssr: false`:
```typescript
import dynamic from 'next/dynamic'

const RevenueChart = dynamic(
  () => import('@/components/manager/revenue-chart').then(mod => mod.RevenueChart),
  { ssr: false }
)
```
6. Extract the Recharts elements from app/manager/bao-cao/page.tsx into three separate components under `components/manager/`:
   - `components/manager/bookings-bar-chart.tsx` (containing BookingsBarChart and its CustomTooltip)
   - `components/manager/services-pie-chart.tsx` (containing ServicesPieChart and its CustomTooltip)
   - `components/manager/revenue-trend-chart.tsx` (containing RevenueTrendChart and its RevenueTooltip)
   Ensure they are typed properly, clean of typescript errors, and use lucide-react or custom helper icons/functions like formatVND correctly.
7. In app/manager/bao-cao/page.tsx, dynamic-import these three new components with `ssr: false` and render them instead of the raw inline recharts setups. Clean up the unused Recharts imports.
8. Perform verification: Run a compile test `npm run build` locally and ensure it builds successfully. Check that there are no TS, ESLint, or runtime errors.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Save a detailed implementation report in .agents/worker_m2/changes.md and handoff.md. Report back with your results once complete.
