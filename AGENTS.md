# AutoWash Pro Frontend — Agent Instructions

> **Repo:** `AutoWash_Pro_FE` · SWP391 · FPT University · Summer 2026  
> **Product:** Single-store premium car wash booking platform with 4 portals (Customer, Washer, Manager, Admin).

This file is the **single source of truth** for any AI agent (Cursor, Codex, Claude Code, Antigravity, etc.). Read it fully before implementing. For Cursor, also see `.cursor/rules/*.mdc` for scoped reminders.

---

## 0. Mandatory Reading Order

Before writing code for a task, read in this order:

| Priority | File | When |
|---|---|---|
| 1 | This file (`AGENTS.md`) | Always |
| 2 | `docs/BE_INTEGRATION_NOTES.md` | Any API/auth work — **BE differs from original contract** |
| 3 | `docs/TASKS.md` | Know screen IDs (C-xx, M-xx, W-xx, A-xx) and task status |
| 4 | `README.md` | Design system, business rules, external doc links |
| 5 | `lib/types/index.ts` | Types, enums, UI label maps |
| 6 | Similar existing page/component | Match patterns before inventing new ones |

**External source of truth (sibling repo, do not copy):** `../AutoWash_Pro/docs/` — BRD, API contract, wireframes, service catalog. When BE Swagger disagrees with contract, **Swagger wins**.

---

## 1. Tech Stack (Actual, Not Generic)

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** App Router |
| UI | **React 19**, TypeScript strict |
| Styling | **Tailwind CSS v4** (`app/globals.css`, CSS variables) |
| Components | **shadcn/ui** (New York style) + **Lucide** icons |
| Forms | **react-hook-form** + **zod** |
| HTTP | **Axios** via `@/lib/api` — **not** raw `fetch` for backend calls |
| Auth | JWT access token + httpOnly refresh cookie; role/access cookies for middleware |
| Charts | **recharts** |
| Toasts | **sonner** (preferred in newer pages) or `@/hooks/use-toast` (legacy) |
| E2E | **Playwright** (`tests/e2e/`) |
| Unit | Custom runner `npm test` → `__tests__/run-tests.ts` (not Vitest yet) |

**Backend:** .NET 8 ASP.NET Core — dev `http://localhost:5255/api`, Swagger `http://localhost:5255/swagger`.

**Env:** Copy `.env.example` → `.env.local`. Default API URL: `http://localhost:5255/api`. Optional Playwright credentials documented in `.env.example`.

---

## 2. Repository Map

```
app/
├── auth/           dang-nhap, dang-ky, xac-thuc, internal
├── customer/       dat-lich, lich-hen, diem-thuong, phuong-tien, ho-so, ...
├── washer/         job flow, inspection, bao-cao
├── manager/        booking, phan-cong, khach-vang-lai, quan-ly-slot, ...
└── admin/          nguoi-dung, dich-vu, phan-thuong, cau-hinh-*

lib/
├── types/index.ts  ← ALL domain types + BOOKING_STATUS_CONFIG, TIER_LABELS
├── api/
│   ├── client.ts   ← Axios instance, tokenStorage, JWT refresh interceptor
│   ├── auth.ts     ← signIn, signUp, verifyOtp, logout (BE-specific DTOs)
│   ├── bookings.ts, services.ts, loyalty.ts, users.ts
│   └── index.ts    ← re-export everything
├── data.ts         ← LEGACY mock data + formatVND/formatDate helpers only
└── utils.ts        ← cn() for class merging

components/
├── ui/             shadcn primitives — DO NOT edit unless required
├── shared/         page-header, empty-state, loading-overlay, confirm-dialog, ...
├── customer/       booking-wizard, vehicle-form
├── manager/        assign-washer-modal, assignment-board, walk-in-form
├── washer/         inspection-report, job-action-button
└── portal-shell.tsx ← sidebar layout for all authenticated portals

middleware.ts       Route protection via cookies aw_access_token + aw_role
```

**Path alias:** `@/*` → project root.

---

## 3. Domain Essentials (Do Not Violate)

### Portals & Roles

| Role | Cookie value | Portal prefix |
|---|---|---|
| Customer | `CUSTOMER` | `/customer` |
| Car Washer | `CAR_WASHER` | `/washer` |
| Manager | `MANAGER` | `/manager` |
| Admin | `ADMIN` | `/admin` |

`middleware.ts` enforces login + role isolation. After login, `tokenStorage.setAccess()` and `tokenStorage.setRole()` must run so cookies exist for SSR middleware.

### Critical Business Rules

| Rule | Detail |
|---|---|
| WASH vs FLEX | WASH = service group 1 (occupies lift bay, consecutive slots). FLEX = groups 2–5, no lift |
| Slot hold | `holdSlot()` → 10 min to confirm or status → `EXPIRED` |
| Trust Score | Starts 100; <60 loses Pay After Service; <20 booking blocked |
| Tier booking window | MEMBER 3d · SILVER 7d · GOLD 10d · PLATINUM 14d ahead |
| T-2h auto cancel | Email reminder; no response 30 min → `AUTO_CANCELLED`, −20 points |
| Inspection gate | Washer uploads before-service photos; customer confirms → job can start |

### Booking Status Flow

```
SLOT_HELD → PENDING_CONFIRMATION → CONFIRMED → ASSIGNED → CHECKED_IN
→ VEHICLE_INSPECTED → CUSTOMER_CONFIRMED_CONDITION → IN_PROGRESS
→ COMPLETED → PAID → CLOSED
```

Cancel branches: `CANCELLED_BY_CUSTOMER` · `CANCELLED_BY_MANAGER` · `AUTO_CANCELLED` · `NO_SHOW` · `EXPIRED`

Use `StatusBadge` from `@/components/status-badge` and `BOOKING_STATUS_CONFIG` from `@/lib/types` — never hardcode status labels.

### Shadow User (Walk-in → Online)

Manager creates walk-in booking → BE may create inactive Shadow User. When same phone registers online, BE **claims** shadow profile (no 409). See `docs/BE_INTEGRATION_NOTES.md`.

---

## 4. API Integration Rules

### Always Import This Way

```typescript
import { getMyBookings, holdSlot, signIn } from '@/lib/api'
import type { Booking, BookingStatus, MemberTier } from '@/lib/types'
import { BOOKING_STATUS_CONFIG, TIER_LABELS } from '@/lib/types'
import { formatVND, formatDate } from '@/lib/data'
```

Add new endpoints in the appropriate `lib/api/*.ts` file, then re-export from `lib/api/index.ts`.

### BE Reality vs Original Contract

| Topic | Use This |
|---|---|
| Login | `POST /auth/signin` with `{ email, password }` — not phone |
| Register | `POST /auth/signup` — phone optional |
| OTP verify | `POST /auth/verify-otp` with `{ email, otp }` — returns success only, user must sign in again |
| OTP TTL | 120 seconds |
| Refresh | `POST /auth/renew-token` with httpOnly cookie — handled in `client.ts` interceptor |
| Response shape | Often flat `{ success, token, role, message }` not nested `{ data: ... }` |

**Never guess API shapes.** Check Swagger or existing `lib/api/*.ts` implementations first.

### Error Handling Pattern

```typescript
try {
  const data = await getMyProfile()
  setProfile(data)
} catch (error) {
  // Show toast to user; log in dev
  toast.error('Không tải được hồ sơ', 'Vui lòng thử lại sau.')
  console.error(error)
}
```

Avoid silent failures. Prefer user-facing Vietnamese error messages.

---

## 5. React & Next.js Conventions

### Server vs Client

- **Default:** Server Components for `page.tsx` when no hooks/browser APIs needed.
- **`"use client"`:** Required for `useState`, `useEffect`, event handlers, `useRouter`, forms, charts.
- **Portal layouts** (`app/customer/layout.tsx`, etc.) are Client Components wrapping `PortalShell`.

### Page Structure Pattern

```tsx
"use client" // if interactive

import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/status-badge'

export default function SomePage() {
  // fetch in useEffect or pass from server parent
  return (
    <div className="space-y-6 p-4 md:p-8">
      <PageHeader title="Tiêu đề màn hình" description="Mô tả ngắn" />
      {/* bento cards: rounded-2xl border border-border bg-card shadow-sm */}
    </div>
  )
}
```

### Do

- Keep Client Components small; push logic into `components/[feature]/`.
- Use `cn()` from `@/lib/utils` for conditional classes.
- Use existing shared components before creating new ones.
- Write **all user-visible text in Vietnamese** (formal, product tone).
- Use `MonoText` / `font-mono` (JetBrains Mono) for license plates, booking IDs, times.

### Do Not

- Edit `components/ui/*` for feature-specific styling — wrap/compose instead.
- Use `lib/data.ts` types for new features — use `lib/types/index.ts`.
- Hardcode mock data in production paths without `TODO: connect API` comment.
- Use `any` — use proper types or `unknown` with narrowing.
- Add new CSS files — Tailwind + `globals.css` tokens only.
- Commit `.env.local` or secrets.

---

## 6. Design System ("Premium / Refined Brutalism")

Defined in `app/globals.css`. Key tokens:

| Token | Value / Usage |
|---|---|
| Primary | `#1470af` (`--primary`) — buttons, focus rings, active nav |
| Background | `#ffffff` / `--background` |
| Muted text | `--muted-foreground` (`#64748b`) |
| Success / Error | `--success` / `--destructive` |
| Tier gold | `--gold` for loyalty highlights |
| Radius | Cards `rounded-2xl`, buttons `rounded-xl` |
| Font | Plus Jakarta Sans (body), JetBrains Mono (mono data) |

**Layout:** Bento grid cards with `rounded-2xl border border-border shadow-sm`. Page headers use gradient accent via `PageHeader`.

**WASH badge:** blue/primary tone. **FLEX badge:** purple (`--flex`).

**Dark mode:** Supported via `ThemeProvider` + `theme-toggle`. Test both themes for new UI.

---

## 7. Authentication Flow (Implementation)

1. `signIn({ email, password })` → receive `token`, `role`.
2. `tokenStorage.setAccess(token)` + `tokenStorage.setRole(role)` → sets cookies for middleware.
3. Redirect by role to portal prefix.
4. On 401, `client.ts` auto-calls `/auth/renew-token`; on failure clears tokens → `/auth/dang-nhap`.
5. `logout()` clears storage and cookies.

Auth pages live under `/auth/*`. Protected routes listed in `middleware.ts`.

---

## 8. Testing & Quality Gates

```bash
npm run dev          # local dev
npm run lint         # ESLint
npm run build        # must pass before PR
npm test             # unit smoke tests
npm run test:e2e     # Playwright (needs dev server)
```

**Before marking work done:**

- [ ] TypeScript compiles, no `any`
- [ ] UI matches design tokens and Vietnamese copy
- [ ] API calls go through `@/lib/api`, types from `@/lib/types`
- [ ] Loading, empty, and error states handled
- [ ] No secrets committed
- [ ] Scope minimal — no drive-by refactors

Write E2E tests in `tests/e2e/` for critical flows (see `.cursor/rules/playwright-e2e.mdc`). Extend `__tests__/run-tests.ts` for pure utility tests.

---

## 9. Git & Task Conventions

**Branch naming:** `feature/C-10-my-bookings` · `feature/M-04-assign-washer` · `fix/auth-otp-cooldown`

**Commit format:** Conventional commits with scope:

```
feat(customer): implement booking confirmation page C-09
fix(auth): handle OTP resend cooldown
chore: update API types for shadow user claim
```

**Do not commit or push unless the user explicitly asks.**

---

## 10. Agent Workflow (How to Work Smart)

### Before Coding

1. Identify portal + screen ID from `docs/TASKS.md`.
2. Find the closest existing page (grep route or feature name).
3. Read the API functions already exported — extend, don't duplicate.
4. Check `docs/BE_INTEGRATION_NOTES.md` for endpoint quirks.

### While Coding

1. **Minimal diff** — solve the asked task only.
2. Reuse `PortalShell`, `PageHeader`, `EmptyState`, `ConfirmDialog`, `LoadingOverlay`.
3. For tables: `@/components/ui/table` + pagination component.
4. For modals: `@/components/ui/dialog` or `sheet`.
5. Match toast library already used in neighboring files (`sonner` vs `useToast`).

### After Coding

1. Run `npm run lint` on touched files if feasible.
2. Summarize what changed, which APIs used, any `TODO: connect API` left.
3. Flag BE blockers with `[~]` reference from TASKS.md.

### Common Pitfalls

| Mistake | Fix |
|---|---|
| Using `fetch` directly to backend | Use `@/lib/api` functions |
| Types from `lib/data.ts` | Use `lib/types/index.ts` |
| English UI strings | Vietnamese product copy |
| Wrong login field (`phone`) | BE expects `email` |
| Forgetting cookies after login | Call `tokenStorage.setAccess` + `setRole` |
| Modifying shadcn ui files | Compose/wrap in feature components |
| Assuming OTP returns token | User must sign in after verify |

---

## 11. Key File Reference

| Need | Go to |
|---|---|
| All enums & API types | `lib/types/index.ts` |
| Axios + tokens | `lib/api/client.ts` |
| Auth endpoints | `lib/api/auth.ts` |
| Booking flow API | `lib/api/bookings.ts` |
| Route protection | `middleware.ts` |
| Sidebar layout | `components/portal-shell.tsx` |
| Booking wizard (reference impl) | `components/customer/booking-wizard.tsx` |
| Status/tier badges | `components/status-badge.tsx` |
| Currency/date format | `lib/data.ts` → `formatVND`, `formatDate` |
| BE quirks | `docs/BE_INTEGRATION_NOTES.md` |
| Component patterns | `docs/COMPONENTS_GUIDE.md` |

---

## 12. Team Context

| Dev | Scope |
|---|---|
| Thành Đạt | Auth, Customer portal (C-xx), Admin (A-xx) |
| Trí Vũ | Washer (W-xx), Manager (M-xx) |

When unsure which pattern is canonical, prefer the **newer** file in the same portal that already connects to real API.

---

## 13. Quy tắc điều tra & đề xuất giải pháp

Khi người dùng đưa ra một vấn đề hoặc báo cáo lỗi:
1. **Tuyệt đối không tự ý chỉnh sửa mã nguồn ngay lập tức** trừ khi người dùng yêu cầu trực tiếp ("hãy sửa luôn", "fix ngay").
2. **Luôn thực hiện điều tra kỹ lưỡng:** Sử dụng các công cụ tìm kiếm, đọc file mã nguồn để xác định chính xác nguyên nhân gốc rễ (Root Cause) ở cả Frontend và Backend.
3. **Trình bày rõ ràng:** Nêu rõ nguyên nhân lỗi, phân tích lỗi thuộc về bên nào (FE hay BE) và đề xuất các phương án giải quyết cụ thể.
4. **Chờ phản hồi:** Chờ người dùng xác nhận phương án xử lý trước khi thực hiện bất kỳ thay đổi nào lên mã nguồn dự án.
