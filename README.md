# AutoWash Pro — Frontend

> **SWP391** · FPT University · Summer 2026  
> **Team:** Nguyễn Thành Đạt (Leader/FE) · Nguyễn Trí Vũ (FE) · Nguyễn Thành Toàn (BE) · Nguyễn Anh Tuấn (BE)

Hệ thống Web đặt lịch rửa xe thông minh cho **Single-Store**. Gồm 4 portal: Customer, Car Washer, Manager, Admin.

---

## 🤖 Dành cho AI Agent — Context tóm gọn

> Đọc phần này trước khi implement bất kỳ màn hình nào.

### Hệ thống này là gì?
Nền tảng đặt lịch rửa xe ô tô cao cấp. Khách đặt lịch online, nhân viên thực hiện kiểm tra xe trước/sau dịch vụ, Manager phân công và quản lý vận hành, Admin cấu hình hệ thống.

### Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **UI:** shadcn/ui (New York style) + Tailwind CSS
- **HTTP:** Axios với JWT auto-refresh (`lib/api/client.ts`)
- **Backend:** .NET ASP.NET Core 8 — `http://localhost:5000/api/v1`
- **Auth:** JWT Access Token + Refresh Token (lưu localStorage)
- **Payment:** PayOS (QR động)
- **Storage:** Firebase Storage (ảnh kiểm tra xe)

### Design System ("Refined Brutalism")
- **Background:** `#FFFFFF` | **Cards:** `#F8FAFC`
- **Primary (Auto Blue):** `#0055FF` — buttons, active states, focus ring
- **Text:** `#0F172A` (đậm) · `#64748B` (phụ)
- **Success:** `#10B981` | **Error/Cancel:** `#E11D48` | **Loyalty Gold:** `#F59E0B`
- **Font:** `Inter` (text) + `JetBrains Mono` (biển số, giờ, mã booking)
- **Layout:** Bento Grid — cards `rounded-2xl border border-slate-200 shadow-sm`
- **Buttons:** `rounded-xl` · hover = `shadow-lg shadow-blue-500/30`

### Kiến trúc thư mục quan trọng
```
app/
├── auth/          → đăng-nhap, đăng-ky, xac-thuc (OTP)
├── customer/      → dat-lich, lich-hen, diem-thuong, do-diem, voucher, phuong-tien, danh-gia, khieu-nai
├── washer/        → [id], bao-cao, completed, executing
├── manager/       → booking, khach-vang-lai, quan-ly-slot, phan-cong, khieu-nai, bao-cao, nhan-vien, khach-hang
└── admin/         → nguoi-dung, dich-vu, phan-thuong, cau-hinh-diem, cau-hinh-tier, nhat-ky-hoat-dong

lib/
├── types/index.ts     → TẤT CẢ TypeScript interfaces (BookingStatus, MemberTier, Vehicle, ...)
└── api/
    ├── client.ts      → Axios instance + JWT interceptor
    ├── auth.ts        → login, register, verifyOtp, logout
    ├── bookings.ts    → toàn bộ booking flow + manager ops + washer tasks
    ├── services.ts    → service catalog + admin CRUD
    ├── loyalty.ts     → điểm thưởng, đổi điểm, voucher
    ├── users.ts       → profile, xe, reports, admin user mgmt
    └── index.ts       → re-export tất cả (import từ '@/lib/api')

components/
├── ui/            → shadcn components (KHÔNG chỉnh sửa)
├── shared/        → empty-state, loading-overlay, page-header
├── customer/      → booking-wizard
├── washer/        → inspection-report, job-action-button
└── manager/       → assign-washer-modal, assignment-board, walk-in-form
```

### Business Logic quan trọng nhất
| Rule | Chi tiết |
|---|---|
| Booking WASH vs FLEX | WASH = có dịch vụ nhóm 1 (rửa xe), chiếm cầu nâng, slot liên tiếp. FLEX = nhóm 2-5, không chiếm cầu nâng |
| Slot hold 10 phút | Sau `POST /bookings/hold-slot` → 10 phút xác nhận, nếu không → EXPIRED |
| Trust Score | Bắt đầu 100, <60 mất Pay After Service, <20 bị khóa đặt lịch |
| Tier Booking Window | MEMBER=3 ngày, SILVER=7, GOLD=10, PLATINUM=14 ngày trước |
| T-2h Auto Cancel | Hệ thống gửi email nhắc, không phản hồi 30 phút → AUTO_CANCELLED, -20 điểm |
| Inspection bắt buộc | Washer phải upload ảnh xe trước dịch vụ, khách xác nhận → mới được bắt đầu |

### Booking Status Flow
```
PENDING_CONFIRMATION → CONFIRMED → ASSIGNED → CHECKED_IN
→ VEHICLE_INSPECTED → CUSTOMER_CONFIRMED_CONDITION → IN_PROGRESS
→ COMPLETED → PAID → CLOSED
```
Nhánh hủy: `CANCELLED_BY_CUSTOMER` · `CANCELLED_BY_MANAGER` · `AUTO_CANCELLED` · `NO_SHOW`

### Cách import API (luôn dùng cách này)
```typescript
import { getMyBookings, createBooking, assignWasher } from '@/lib/api'
import type { Booking, BookingStatus, MemberTier } from '@/lib/types'
import { BOOKING_STATUS_CONFIG, TIER_LABELS } from '@/lib/types'
```

---

## 📚 Tài liệu gốc (source of truth)

> Nằm ở repo `../AutoWash_Pro/docs/` — không copy vào đây để tránh desync.

| Tài liệu | Mô tả | Link |
|---|---|---|
| BRD | Toàn bộ nghiệp vụ, business rules, loyalty, trust score | [brd_he_thong_rua_xe_thong_minh.md](../AutoWash_Pro/docs/brd_he_thong_rua_xe_thong_minh.md) |
| API Contract | 73 endpoints, request/response format đầy đủ | [api_contract.md](../AutoWash_Pro/docs/api_contract.md) |
| Wireframe & UI Flow | Sơ đồ chuyển trang, mô tả từng màn hình | [ui_flow_wireframe.md](../AutoWash_Pro/docs/ui_flow_wireframe.md) |
| Service Catalog | 36 dịch vụ chia 5 nhóm với bảng giá S/M/L | [service_catalog.md](../AutoWash_Pro/docs/service_catalog.md) |
| ERD | Database schema 25 entities | [erd_diagram.md](../AutoWash_Pro/docs/erd_diagram.md) |
| Design System | Color palette, typography, component rules | [DESIGN.md](../AutoWash_Pro/DESIGN.md) |
| v0 Project | Link v0 để tiếp tục sinh UI | [v0.app/chat/projects/prj_of3mvySF4uG7oMAMxFl7m8upX9GW](https://v0.app/chat/projects/prj_of3mvySF4uG7oMAMxFl7m8upX9GW) |

---

## 🚀 Chạy dự án

```bash
# Cài dependencies
npm install

# Tạo file môi trường (copy từ .env.local rồi điền thông tin)
cp .env.local .env.local   # Đã có sẵn template

# Chạy dev server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

---

## 👥 Phân chia task

Xem chi tiết tại [TASKS.md](./TASKS.md)

| Dev | Phụ trách |
|---|---|
| **Thành Đạt** | Auth + Customer Portal (C-01 → C-19) + Admin Panel (A-01 → A-08) |
| **Trí Vũ** | Washer Portal (W-01 → W-07) + Manager Dashboard (M-01 → M-10) |

---

## 📋 Quy tắc làm việc

```bash
# Mỗi màn hình = 1 branch
git checkout -b feature/C-10-my-bookings
git checkout -b feature/M-01-manager-dashboard

# Commit convention
git commit -m "feat(customer): implement booking confirmation page C-09"
git commit -m "feat(manager): add assign washer modal M-04"
git commit -m "fix(auth): handle OTP resend cooldown"
```

**Trước khi merge vào `main`:**
- [ ] UI khớp design system (Auto Blue, bento grid, tiếng Việt)
- [ ] Không còn hardcoded data — đã gọi API thật hoặc để `TODO: connect API`
- [ ] Không có TypeScript `any` hoặc lỗi console
