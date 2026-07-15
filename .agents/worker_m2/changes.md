# Changes Report

This document records the exact changes implemented for Next.js 16 performance optimizations (R1 and R2).

## Modified Files

### 1. `package.json`
- **Change**: Updated the `dev` script to use Next.js Turbopack flag (`--turbo`).
- **Diff**:
  ```json
  -    "dev": "next dev",
  +    "dev": "next dev --turbo",
  ```

### 2. `next.config.mjs`
- **Change**: Configured `experimental.optimizePackageImports` for commonly used large library dependencies to enhance modular tree-shaking.
- **Diff**:
  ```javascript
  +  experimental: {
  +    optimizePackageImports: [
  +      'lucide-react',
  +      'recharts',
  +      'framer-motion',
  +      '@radix-ui/react-icons'
  +    ]
  +  }
  ```

### 3. `app/page.tsx`
- **Change**: Converted static import of `HeroCinematicStoryboard` into a dynamic import with `ssr: false` to defer loading heavy 3D assets on server-side rendering.
- **Diff**:
  ```typescript
  +import dynamic from 'next/dynamic'
  ...
  -import { HeroCinematicStoryboard } from '@/components/shared/hero-cinematic-storyboard'
  +const HeroCinematicStoryboard = dynamic(
  +  () => import('@/components/shared/hero-cinematic-storyboard').then(mod => mod.HeroCinematicStoryboard),
  +  { ssr: false }
  +)
  ```

### 4. `components/shared/hero-cinematic-storyboard.tsx`
- **Change**: Converted static import of `Cinematic3DCanvas` into a dynamic import with `ssr: false`.
- **Diff**:
  ```typescript
  +import dynamic from 'next/dynamic'
  ...
  -import { Cinematic3DCanvas } from './cinematic-3d-canvas'
  +const Cinematic3DCanvas = dynamic(
  +  () => import('./cinematic-3d-canvas').then(mod => mod.Cinematic3DCanvas),
  +  { ssr: false }
  +)
  ```

### 5. `app/admin/page.tsx`
- **Change**: Converted static import of `RevenueChart` to a dynamic import with `ssr: false`.
- **Diff**:
  ```typescript
  +import dynamic from 'next/dynamic'
  ...
  -import { RevenueChart } from "@/components/manager/revenue-chart"
  +const RevenueChart = dynamic(
  +  () => import('@/components/manager/revenue-chart').then(mod => mod.RevenueChart),
  +  { ssr: false }
  +)
  ```

### 6. Created new chart components under `components/manager/`
- **`components/manager/bookings-bar-chart.tsx`**: Extracted `BookingsBarChart` and its custom tooltip `CustomTooltip`.
- **`components/manager/services-pie-chart.tsx`**: Extracted `ServicesPieChart` and its custom tooltip `CustomTooltip`.
- **`components/manager/revenue-trend-chart.tsx`**: Extracted `RevenueTrendChart` and its custom tooltip `RevenueTooltip` (utilizes `formatVND`).

### 7. `app/manager/bao-cao/page.tsx`
- **Change**: Replaced raw Recharts configurations and tooltips with dynamic imports of the newly created component files.
- **Diff**:
  - Removed local Recharts imports and local Tooltip component functions.
  - Dynamically imported `BookingsBarChart`, `ServicesPieChart`, and `RevenueTrendChart` with `ssr: false`.
  - Replaced inline elements with the custom components:
    ```tsx
    <BookingsBarChart data={chartTrendData} />
    <ServicesPieChart data={serviceTypeData} />
    ...
    <RevenueTrendChart data={chartTrendData} />
    ```
