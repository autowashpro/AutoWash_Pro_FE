# Implementation Plan - Next.js 16 Performance Optimizations

This plan outlines the steps for implementing the Next.js 16 performance optimizations (R1 and R2) for AutoWash_Pro_FE.

## Steps

### Step 1: Update package.json
- **Action**: In `package.json`, change the `dev` script from `"dev": "next dev"` to `"dev": "next dev --turbo"`.
- **Verification**: Run `npm run lint` or inspect package.json to ensure correctness.

### Step 2: Configure experimental optimizePackageImports in next.config.mjs
- **Action**: In `next.config.mjs`, add `optimizePackageImports` within `experimental`:
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
- **Verification**: Run `npm run build` or inspect next.config.mjs.

### Step 3: Dynamically Import HeroCinematicStoryboard in app/page.tsx
- **Action**: Replace the static import of `HeroCinematicStoryboard` with a dynamic import `{ ssr: false }`.
- **Verification**: Check compilation and that no static import remains.

### Step 4: Dynamically Import Cinematic3DCanvas in components/shared/hero-cinematic-storyboard.tsx
- **Action**: Replace the static import of `Cinematic3DCanvas` with a dynamic import `{ ssr: false }`.
- **Verification**: Check compilation.

### Step 5: Dynamically Import RevenueChart in app/admin/page.tsx
- **Action**: Replace the static import of `RevenueChart` with a dynamic import `{ ssr: false }`.
- **Verification**: Check compilation.

### Step 6: Extract Recharts Components from app/manager/bao-cao/page.tsx
- **Action**: Create three new files under `components/manager/`:
  1. `components/manager/bookings-bar-chart.tsx`
  2. `components/manager/services-pie-chart.tsx`
  3. `components/manager/revenue-trend-chart.tsx`
- **Verification**: Ensure clean typescript compiling of the new components.

### Step 7: Update app/manager/bao-cao/page.tsx to use Dynamic Imports
- **Action**: Replace inline chart configurations with dynamic imports `{ ssr: false }` of the three new components. Clean up unused imports.
- **Verification**: Verify code compiling and no unused recharts imports in the file.

### Step 8: Build and Lint Verification
- **Action**: Run `npm run build` and check for compile/lint errors.
- **Verification**: Build compiles successfully without error.
