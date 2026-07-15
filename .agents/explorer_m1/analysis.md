# Performance Optimization Analysis: R1 & R2 Requirements

## Summary of Findings
This report details the investigation of performance bottlenecks in the `AutoWash_Pro_FE` project and proposes specific implementation strategies for R1 (package import optimizations) and R2 (dynamic component loading with SSR disabled). The key findings show static imports of heavy elements (3D canvas, charting library) that block first-paint and can be optimized.

---

## Important Findings Table

| Requirement | Target File / Area | Finding / Current Syntax | Proposed Optimization |
|---|---|---|---|
| **R1.1: Dev Script** | `package.json` | `"dev": "next dev"` (invoked via `npm run dev`) | Leave as-is (standard development command) |
| **R1.2: Package Imports** | `next.config.mjs` | No package import optimizations configured | Add `optimizePackageImports` configuration for `lucide-react`, `recharts`, `framer-motion`, `@radix-ui/react-icons` |
| **R2.1: HeroCinematicStoryboard** | `app/page.tsx` | Statically imported from `@/components/shared/hero-cinematic-storyboard` | Convert to `next/dynamic` import with `ssr: false` |
| **R2.2: Cinematic3DCanvas** | `components/shared/hero-cinematic-storyboard.tsx` | Statically imported from `./cinematic-3d-canvas` | Convert to `next/dynamic` import with `ssr: false` since it loads React Three Fiber and Three.js |
| **R2.3: RevenueChart** | `app/admin/page.tsx` | Statically imported from `@/components/manager/revenue-chart` | Convert to `next/dynamic` import with `ssr: false` |
| **R2.4: Manager Reports Charts** | `app/manager/bao-cao/page.tsx` | Recharts sub-components (BarChart, PieChart, LineChart) imported statically | Extract each chart into separate small components in `components/manager/` and dynamic-import them with `ssr: false` |

---

## Detailed Findings & Implementation Proposals

### 1. Dev Script Inspection (`package.json`)
- **Location:** `package.json` line 6
- **Current Script:** `"dev": "next dev"`
- **Invocation:** Typically run using `npm run dev`. This starts the Next.js local development server.

---

### 2. Package Import Optimization (`next.config.mjs`)
- **Location:** `next.config.mjs`
- **Objective:** Add `optimizePackageImports` to speed up compilation and reduce build time by only loading utilized barrel file modules.
- **Proposed Code Change:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Bỏ qua lỗi TypeScript khi dev/demo, bật lại kiểm tra nghiêm ngặt khi deploy production
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  images: {
    // Tắt tối ưu hóa hình ảnh trong môi trường dev/demo, tối ưu hóa đầy đủ ở production
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      '@radix-ui/react-icons'
    ]
  }
}

export default nextConfig
```

---

### 3. Static vs Dynamic Imports Assessment
We identified three main components that are statically imported and are prime candidates for dynamic loading to reduce the initial JavaScript bundle sizes.

#### A. `HeroCinematicStoryboard` in `app/page.tsx`
- **Current import (line 7):**
  `import { HeroCinematicStoryboard } from '@/components/shared/hero-cinematic-storyboard'`
- **Current usage (line 48):**
  `<HeroCinematicStoryboard />`
- **Proposed dynamic import:**
```tsx
import dynamic from 'next/dynamic'

const HeroCinematicStoryboard = dynamic(
  () => import('@/components/shared/hero-cinematic-storyboard').then(mod => mod.HeroCinematicStoryboard),
  { ssr: false }
)
```

#### B. `Cinematic3DCanvas` in `components/shared/hero-cinematic-storyboard.tsx`
This canvas loads highly heavy dependencies including `@react-three/fiber`, `@react-three/drei`, and `three`.
- **Current import (line 6):**
  `import { Cinematic3DCanvas } from './cinematic-3d-canvas'`
- **Current usage (line 83):**
  `<Cinematic3DCanvas progress={scrollProgress} mousePos={mousePos} onSelectPackage={() => setIsBookingOpen(true)} />`
- **Proposed dynamic import:**
```tsx
import dynamic from 'next/dynamic'

const Cinematic3DCanvas = dynamic(
  () => import('./cinematic-3d-canvas').then(mod => mod.Cinematic3DCanvas),
  { ssr: false }
)
```

#### C. `RevenueChart` in `app/admin/page.tsx`
- **Current import (line 5):**
  `import { RevenueChart } from "@/components/manager/revenue-chart"`
- **Current usage (line 75):**
  `<RevenueChart data={data?.revenueByDays ?? data?.revenue_by_days} />`
- **Proposed dynamic import:**
```tsx
import dynamic from 'next/dynamic'

const RevenueChart = dynamic(
  () => import('@/components/manager/revenue-chart').then(mod => mod.RevenueChart),
  { ssr: false }
)
```

---

### 4. Manager Reports Recharts Optimization (`app/manager/bao-cao/page.tsx`)
Currently, `app/manager/bao-cao/page.tsx` directly imports and renders:
- `BarChart` (with `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`)
- `PieChart` (with `Pie`, `Cell`, `Tooltip`, `ResponsiveContainer`)
- `LineChart` (with `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`)

To prevent hydration issues and reduce main bundle size, we must extract these into dedicated client-side components and load them dynamically.

#### Step 4.1: Create Dedicated Components

##### Component 1: `components/manager/bookings-bar-chart.tsx`
```tsx
"use client"

import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface BookingsBarChartProps {
  data: Array<{
    date: string
    bookings: number
    revenue: number
  }>
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{name: string; value: number; color: string; fill?: string}>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border/60 bg-background/95 p-3 text-sm shadow-lg backdrop-blur-md">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.color || p.fill || 'hsl(var(--primary))' }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono font-bold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function BookingsBarChart({ data }: BookingsBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="bookings" fill="#1470AF" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

##### Component 2: `components/manager/services-pie-chart.tsx`
```tsx
"use client"

import React from "react"
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface ServicesPieChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{name: string; value: number; color: string; fill?: string}>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border/60 bg-background/95 p-3 text-sm shadow-lg backdrop-blur-md">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.color || p.fill || 'hsl(var(--primary))' }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono font-bold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function ServicesPieChart({ data }: ServicesPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name} ${value}`}
          outerRadius={80}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

##### Component 3: `components/manager/revenue-trend-chart.tsx`
```tsx
"use client"

import React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatVND } from "@/lib/data"

interface RevenueTrendChartProps {
  data: Array<{
    date: string
    bookings: number
    revenue: number
  }>
}

const RevenueTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{name: string; value: number; color: string; fill?: string}>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border/60 bg-background/95 p-3 text-sm shadow-lg backdrop-blur-md">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.color || p.fill || 'hsl(var(--success))' }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono font-bold text-foreground">{formatVND(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
        <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
        <Tooltip content={<RevenueTooltip />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#10b981"
          strokeWidth={2}
          name="Doanh thu"
          dot={{ fill: "#10b981", r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

#### Step 4.2: Dynamic Imports in `app/manager/bao-cao/page.tsx`
Replace static imports of Recharts with dynamic imports of the custom wrappers:

```tsx
import dynamic from "next/dynamic"

const BookingsBarChart = dynamic(
  () => import("@/components/manager/bookings-bar-chart").then(mod => mod.BookingsBarChart),
  { ssr: false }
)

const ServicesPieChart = dynamic(
  () => import("@/components/manager/services-pie-chart").then(mod => mod.ServicesPieChart),
  { ssr: false }
)

const RevenueTrendChart = dynamic(
  () => import("@/components/manager/revenue-trend-chart").then(mod => mod.RevenueTrendChart),
  { ssr: false }
)
```

And in the JSX of `app/manager/bao-cao/page.tsx`, clean up by replacing the raw responsive container setups:
- Line 339-347: Replace with `<BookingsBarChart data={chartTrendData} />`
- Line 353-370: Replace with `<ServicesPieChart data={serviceTypeData} />`
- Line 407-422: Replace with `<RevenueTrendChart data={chartTrendData} />`
