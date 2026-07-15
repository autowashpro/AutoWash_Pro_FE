# Handoff Report: Performance Optimization (R1 & R2) Exploration

## 1. Observation
We observed the following exact paths and lines in the codebase:
- **`package.json`**:
  - `dev` script in `package.json` at line 6:
    ```json
    "dev": "next dev",
    ```
- **`next.config.mjs`**:
  - Current configuration (lines 1-14):
    ```javascript
    /** @type {import('next').NextConfig} */
    const nextConfig = {
      typescript: {
        ignoreBuildErrors: process.env.NODE_ENV === 'development',
      },
      images: {
        unoptimized: process.env.NODE_ENV === 'development',
      },
    }
    export default nextConfig
    ```
- **`app/page.tsx`**:
  - Static import of `HeroCinematicStoryboard` at line 7:
    ```typescript
    import { HeroCinematicStoryboard } from '@/components/shared/hero-cinematic-storyboard'
    ```
  - JSX usage at line 48:
    ```tsx
    <HeroCinematicStoryboard />
    ```
- **`components/shared/hero-cinematic-storyboard.tsx`**:
  - Static import of `Cinematic3DCanvas` at line 6:
    ```typescript
    import { Cinematic3DCanvas } from './cinematic-3d-canvas'
    ```
  - JSX usage at line 83:
    ```tsx
    <Cinematic3DCanvas ... />
    ```
- **`app/admin/page.tsx`**:
  - Static import of `RevenueChart` at line 5:
    ```typescript
    import { RevenueChart } from "@/components/manager/revenue-chart"
    ```
  - JSX usage at line 75:
    ```tsx
    <RevenueChart data={data?.revenueByDays ?? data?.revenue_by_days} />
    ```
- **`app/manager/bao-cao/page.tsx`**:
  - Recharts subcomponents statically imported (lines 7-20):
    ```typescript
    import {
      BarChart,
      Bar,
      PieChart,
      Pie,
      LineChart,
      Line,
      XAxis,
      YAxis,
      CartesianGrid,
      Tooltip,
      ResponsiveContainer,
      Cell,
    } from "recharts"
    ```
  - Direct rendering of `BarChart`, `PieChart`, and `LineChart` inside `ResponsiveContainer` blocks (lines 339-347, 353-370, 407-422).

---

## 2. Logic Chain
1. **R1 package import optimizations**: By adding the `experimental.optimizePackageImports` property to `next.config.mjs`, Next.js will only load the specific exports imported from major libraries like `lucide-react`, `recharts`, `framer-motion`, and `@radix-ui/react-icons`. This avoids loading full index/barrel files during SSR/compilation, resolving requirement R1.
2. **R2 dynamic imports (SSR disabled)**:
   - **WebGL and Canvas components**: `Cinematic3DCanvas` (imported in `hero-cinematic-storyboard.tsx`) depends on `@react-three/fiber`, `@react-three/drei`, and `three`. These libraries fail to render correctly on the server-side, causing mismatch hydration errors and heavy initial HTML payloads. Disabling SSR for these components is a must.
   - **Hero Cinematic Storyboard**: `HeroCinematicStoryboard` is the main container for the WebGL canvas. Since `app/page.tsx` is a client component, dynamically importing `HeroCinematicStoryboard` with `ssr: false` prevents any of the 3D-related scripts from bundling into the page's initial SSR chunk.
   - **Charting components**: Recharts elements (like `RevenueChart` and manager dashboard charts) rely on browser APIs (DOM width/height measuring, SVG layout calculations) which do not exist on the server. If rendered server-side, they throw hydration mismatches.
   - **Component Extraction Strategy**: Standard dynamic imports with `ssr: false` in Next.js apply at the component boundary. Directly importing individual sub-components (like `BarChart` or `XAxis`) dynamically within `page.tsx` is not feasible/clean. Thus, extracting the `BarChart`, `PieChart`, and `LineChart` into dedicated wrapper components (`BookingsBarChart`, `ServicesPieChart`, `RevenueTrendChart`) and dynamic-importing these wrappers with `{ ssr: false }` satisfies Next.js's component boundaries and resolves R2.

---

## 3. Caveats
- No caveats. The project runs Next.js 16.2.6 (from `package.json` line 61), which fully supports standard dynamic imports and `optimizePackageImports`.

---

## 4. Conclusion
We have identified all target areas for performance improvements R1 and R2. The implementation plans have been thoroughly detailed with specific code snippets for both next config changes and component extractions in `analysis.md`. The proposed strategy is fully actionable by the implementer.

---

## 5. Verification Method
- **Linter & Build Checks**: Run `npm run lint` and `npm run build` after changes to verify no compilation errors.
- **Visual & Hydration Verification**: Access the modified routes (`/`, `/admin`, `/manager/bao-cao`) in the browser. Inspect the console for React hydration errors. Confirm that the 3D canvas and charts load cleanly on the client side.
- **Bundle Audit**: Build the application using `npm run build` and verify that the initial bundle size of `app/page.tsx` (Homepage) and other affected pages decreases.
