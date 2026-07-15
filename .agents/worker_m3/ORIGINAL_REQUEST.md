## 2026-07-15T12:48:13Z
You are teamwork_preview_worker. Your task is to resolve issues identified by the reviewers in the Next.js 16 performance optimization branch:

1. DevDependencies in package.json:
   - Add "typescript-eslint": "^8.24.0" and "@next/eslint-plugin-next": "16.2.6" to devDependencies in package.json, or run `npm install --save-dev typescript-eslint@8.24.0 @next/eslint-plugin-next@16.2.6` to ensure that ESLint runs correctly via `npm run lint`.
2. Fallback UI and data prop safety in the extracted manager chart components:
   - For `components/manager/bookings-bar-chart.tsx`:
     - Add default value for the data prop: `export function BookingsBarChart({ data = [] }: BookingsBarChartProps)`.
     - Check if data is empty: if `!data || data.length === 0`, return a fallback UI (centered in a box, text: "Chưa có dữ liệu đặt lịch", using proper tailwind styles).
     - On the `<Bar>` component, add the prop `name="Số lượng đặt"` so that the tooltip renders "Số lượng đặt: <value>" in Vietnamese instead of the raw English key "bookings".
   - For `components/manager/services-pie-chart.tsx`:
     - Add default value for the data prop: `export function ServicesPieChart({ data = [] }: ServicesPieChartProps)`.
     - Check if data is empty: if `!data || data.length === 0`, return a fallback UI (text: "Chưa có dữ liệu dịch vụ").
   - For `components/manager/revenue-trend-chart.tsx`:
     - Add default value for the data prop: `export function RevenueTrendChart({ data = [] }: RevenueTrendChartProps)`.
     - Check if data is empty: if `!data || data.length === 0`, return a fallback UI (text: "Chưa có dữ liệu doanh thu").
3. Verification:
   - Run `npm run lint` and verify it succeeds with no errors.
   - Run `npm run build` and verify that the application compiles successfully.
   - Run `npm test` and verify that the smoke tests pass.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Save a detailed report of these changes in .agents/worker_m3/changes.md and handoff.md. Report back when you are finished.
