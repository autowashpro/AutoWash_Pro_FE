# Next.js 16 Performance Optimizations (R1 & R2) Review

## Review Summary

**Verdict**: REQUEST_CHANGES

## Findings

### Major Finding 1: Broken ESLint Dependencies
- **What**: ESLint is configured to use `typescript-eslint` and `@next/eslint-plugin-next` in `eslint.config.mjs`, but these packages are not declared in `package.json` devDependencies.
- **Where**: `package.json` and `eslint.config.mjs`
- **Why**: Running `npm run lint` fails immediately with `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'typescript-eslint'`.
- **Suggestion**: Add `"typescript-eslint": "^8.0.0"` (or appropriate compatible version) and `"@next/eslint-plugin-next": "16.2.6"` to `devDependencies` in `package.json` and run `npm install`.

### Major Finding 2: Potential Runtime Crash in ServicesPieChart
- **What**: The component maps over `data` (`data.map`) at line 64 without checking if `data` is defined.
- **Where**: `components/manager/services-pie-chart.tsx` (line 64)
- **Why**: If `data` is null or undefined at runtime (e.g. before API fetches resolve, or if data is not loaded), the component will crash the rendering tree with a `TypeError`.
- **Suggestion**: Add a safe check `data && data.map` or provide a default value/fallback UI, such as:
  ```typescript
  export function ServicesPieChart({ data = [] }: ServicesPieChartProps) { ... }
  ```
  And guard the map:
  ```typescript
  {data?.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.color} />
  ))}
  ```

### Minor Finding 3: English Label in BookingsBarChart Tooltip
- **What**: The tooltip displays raw English dataKey `"bookings"` instead of a Vietnamese label.
- **Where**: `components/manager/bookings-bar-chart.tsx` (line 61)
- **Why**: The `<Bar>` element lacks a `name` prop. This violates the "Vietnam product copy" guideline in `AGENTS.md`.
- **Suggestion**: Add `name="Số lượt đặt"` on the `<Bar>` component:
  ```tsx
  <Bar name="Số lượt đặt" dataKey="bookings" fill="#1470AF" radius={[8, 8, 0, 0]} />
  ```

### Minor Finding 4: Lack of Empty State Placeholder in Extracted Charts
- **What**: `BookingsBarChart`, `ServicesPieChart`, and `RevenueTrendChart` do not handle empty or undefined data cleanly with a fallback UI.
- **Where**: `components/manager/bookings-bar-chart.tsx`, `components/manager/services-pie-chart.tsx`, and `components/manager/revenue-trend-chart.tsx`
- **Why**: Unlike `RevenueChart` (which renders a dashed border and an informational empty message), these charts render blank or incomplete layouts if data is not populated.
- **Suggestion**: Implement a guard block similar to `RevenueChart` to show a fallback placeholder.

---

## Verified Claims

- **Next.js 16/React 19 upgrades** → verified via `package.json` and `npx tsc --noEmit` type checking → **PASS** (compilation succeeded with zero errors/warnings).
- **Dynamic Imports `{ ssr: false }` for 3D and Chart components** → verified via file inspections → **PASS** (all dynamic imports configured correctly in `app/page.tsx`, `components/shared/hero-cinematic-storyboard.tsx`, `app/admin/page.tsx`, and `app/manager/bao-cao/page.tsx`).
- **Webpack/Turbopack package optimizations** → verified via `next.config.mjs` config of `experimental.optimizePackageImports` → **PASS**.

## Coverage Gaps

- **Next.js build lock issue** — risk level: low — recommendation: accept risk. A build lock file `.next/lock` blocks compilation if a local dev server is active or didn't clean up correctly. Document this in setup guides.

## Unverified Items

- **Actual production runtime bundle analysis** — reason not verified: Webpack bundle analyzer is not configured in the repository, and the build command is blocked locally by the active lock.

---

# Adversarial Challenge Report

## Challenge Summary

**Overall risk assessment**: MEDIUM

The performance optimizations are well-conceived and properly use Next.js dynamic imports to optimize Client-Side Rendering (CSR) for heavy WebGL/Three.js assets and Recharts elements. However, there are issues around component robustness under data-less scenarios.

## Challenges

### Medium Challenge 1: Empty or Undefined Data Passing to Extracted Charts
- **Assumption challenged**: The components assume that the parent will always supply a fully formed array.
- **Attack scenario**: A network error, slow load, or API schema change results in the dashboard state being `undefined`.
- **Blast radius**: `ServicesPieChart` crashes the manager report page when trying to render because of `data.map` on undefined.
- **Mitigation**: Add default prop parameters (`data = []`) and safe conditional navigation operators (`data?.map(...)`).

### Low Challenge 2: ESLint Configuration / Dependency mismatch
- **Assumption challenged**: That checking in an `eslint.config.mjs` without adding its imports to `package.json` is sufficient.
- **Attack scenario**: A clean CI pipeline pulls the repository and runs `npm run lint` or `npm run build`.
- **Blast radius**: The build pipeline fails because ESLint throws a module-not-found error.
- **Mitigation**: Standardize devDependencies in `package.json` to include lint plugins.

## Stress Test Results

- **Empty/Undefined Prop Pass (ServicesPieChart)** → expected: render fallback or blank space → actual: crashes the application due to calling `.map` on undefined → **FAIL**.
- **TypeScript Type Verification (Strict Mode)** → expected: compile successfully → actual: completed with no errors → **PASS**.

## Unchallenged Areas

- **WebGL shader memory leaks** — reason not challenged: Requires a running browser instance with GPU instrumentation to check if the Three.js resources inside `Cinematic3DCanvas` are cleanly disposed when `HeroCinematicStoryboard` unmounts.
