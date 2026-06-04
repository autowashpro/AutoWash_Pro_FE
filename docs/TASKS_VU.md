# 📋 TASKS — TRÍ VŨ

> **Phụ trách:** Washer Portal (W-01 → W-07) + Manager Dashboard (M-01 → M-10)
> **Branch prefix:** `feature/W-xx-*` · `feature/M-xx-*`
> **Quy ước:** `[ ]` Chưa làm · `[/]` Đang làm · `[x]` Xong · `[~]` Blocked chờ BE

---

## 🔧 PHASE 1 — Washer Portal *(Tuần 1–2 — Làm trước)*

> 🖥️ **Desktop-first** — responsive mobile là tùy biến, không bắt buộc
> ⚠️ Cần BE: `GET /washer/tasks` tuần 1

- [ ] **W-01 · Danh sách task hôm nay** `app/washer/page.tsx`
  - [ ] Gọi `getWasherTasks(today)` — auto refresh 30s hoặc khi focus tab
  - [ ] Mini stats: Đã hoàn thành · Đang xử lý · Giờ làm
  - [ ] Task cards sort theo giờ: biển số (mono) · dịch vụ · status badge · cầu nâng
  - [ ] Empty state: "Không có task hôm nay"

- [ ] **W-02 · Chi tiết task** `app/washer/[id]/page.tsx`
  - [ ] Gọi `getWasherTaskDetail(id)`
  - [ ] Thông tin khách + xe + dịch vụ + ghi chú
  - [ ] Timeline action theo status:
    - [ ] `ASSIGNED` → "Xác nhận khách đến" → `washerCheckIn()`
    - [ ] `CHECKED_IN` → "Kiểm tra xe" → navigate W-03
    - [ ] `VEHICLE_INSPECTED` → "Xem biên bản" + "Chờ khách xác nhận"
    - [ ] `CUSTOMER_CONFIRMED_CONDITION` → "Bắt đầu dịch vụ" → `startService()`
    - [ ] `IN_PROGRESS` → navigate W-06
    - [ ] `COMPLETED` → navigate W-07

- [ ] **W-03 · Form kiểm tra xe** `app/washer/[id]/kiem-tra/page.tsx`
  - [ ] Toggle BEFORE_SERVICE / AFTER_SERVICE
  - [ ] Mini card booking (readonly)
  - [ ] Checklist hư hỏng (checkbox → hiện textarea khi tick)
  - [ ] Textarea ngoại thất + nội thất
  - [ ] Dropdown mức nhiên liệu + input số km (mono)
  - [ ] Gọi `createInspection()` → nhận `inspection_id`

- [ ] **W-04 · Upload ảnh** *(tích hợp vào W-03)*
  - [ ] Grid 2x2: Mặt trước · Mặt sau · Bên trái · Bên phải
  - [ ] Click ô → file picker → preview thumbnail
  - [ ] Validate: bắt buộc ít nhất 1 ảnh
  - [ ] Gọi `uploadInspectionImages()` với FormData

- [ ] **W-05 · Màn xác nhận của khách** `app/washer/[id]/xac-nhan-khach/page.tsx`
  - [ ] Hiển thị kết quả inspection readonly (dành cho khách đọc tại quầy)
  - [ ] Gallery ảnh (lightbox khi click)
  - [ ] Checkbox lớn cho khách tự tick: "Tôi xác nhận tình trạng xe"
  - [ ] Nút "Xác nhận & Bắt đầu" (disabled đến khi tick) → `startService()`
  - [ ] Nút "Từ chối / Báo Manager"

- [ ] **W-06 · Đang thực hiện** `app/washer/executing/page.tsx`
  - [ ] Timer đếm lên (JetBrains Mono, font lớn)
  - [ ] Thông tin xe + dịch vụ
  - [ ] Nút "Hoàn thành dịch vụ"

- [ ] **W-07 · Hoàn thành** `app/washer/completed/page.tsx`
  - [ ] Animation checkmark xanh
  - [ ] Upload ảnh xe sau rửa (reuse component W-04)
  - [ ] Textarea ghi chú sau dịch vụ
  - [ ] Gọi `completeService()` → navigate về W-01

---

## 📊 PHASE 2 — Manager Dashboard *(Tuần 2–3 — Desktop-first)*

> ⚠️ Cần BE: `GET /manager/bookings`, `PUT /manager/bookings/:id/assign` tuần 2

- [ ] **Layout Manager** `app/manager/layout.tsx` *(kiểm tra sidebar)*
  - [ ] Sidebar: Dashboard · Walk-in · Quản lý slot · Khiếu nại · Báo cáo · Nhân viên
  - [ ] Active route highlight, collapsed mode trên màn nhỏ

- [ ] **M-01 · Dashboard** `app/manager/page.tsx`
  - [ ] Date picker (mặc định hôm nay)
  - [ ] Gọi `getManagerBookings({ date })` — auto refresh 1 phút
  - [ ] 4 KPI stat cards: Tổng · Chờ xử lý · Đang thực hiện · Hoàn thành
  - [ ] Bento grid 8 cầu nâng — màu theo trạng thái
  - [ ] Bảng booking: Mã · Khách · Dịch vụ · Giờ (mono) · Cầu · Nhân viên · Status · Thao tác
  - [ ] Nút nhanh per row: "Gán NV" (M-04) · "Xác nhận"
  - [ ] Bento cảnh báo Trust Score < 60
  - [ ] FAB "Walk-in" → M-03

- [ ] **M-02 · Chi tiết booking** `app/manager/booking/[id]/page.tsx`
  - [ ] Gọi `getManagerBookingDetail(id)`
  - [ ] Layout 2 cột: thông tin (2/3) · action panel (1/3)
  - [ ] Progress bar status
  - [ ] Card khách: Trust Score badge màu theo ngưỡng · Tier badge
  - [ ] Card xe: biển số (mono) · hãng/model · cỡ · màu
  - [ ] Card thanh toán: method selector → `createPayment()`
  - [ ] Nút "Hủy lịch" → dialog: có phạt/không phạt + lý do

- [ ] **M-03 · Walk-in Form** `app/manager/khach-vang-lai/page.tsx`
  - [ ] Input SĐT + tìm → có tài khoản hiện card, không có → form tạo mới
  - [ ] Form xe: biển số · cỡ · hãng · model · màu
  - [ ] Chọn dịch vụ (reuse booking wizard component)
  - [ ] Compact slot grid + chọn washer (dropdown `getCarWashers()`)
  - [ ] Gọi `createWalkinBooking()` → hiển thị kết quả + `account_created` notice

- [ ] **M-04 · Modal gán nhân viên** `components/assign-washer-modal.tsx`
  - [ ] Gọi `getCarWashers()`, hiển thị avatar · tên · task hôm nay · trạng thái
  - [ ] Gọi `assignWasher()` khi chọn, `reassignWasher()` nếu đã có

- [ ] **M-05 · Quản lý slot** `app/manager/quan-ly-slot/page.tsx`
  - [ ] Date picker tuần, gọi `getManagerSlots(date)`
  - [ ] Grid: rows = giờ, columns = cầu nâng
  - [ ] Màu ô: Trắng (trống) · Xanh nhạt (có booking) · Slate (khóa)
  - [ ] Hover → tooltip tên khách + dịch vụ
  - [ ] Panel phải: số washer online + cầu → `updateSlot()`

- [ ] **M-06 · Danh sách khiếu nại** `app/manager/khieu-nai/page.tsx`
  - [ ] Gọi `getManagerComplaints()`
  - [ ] Tab: Chờ xử lý · Đang xử lý · Đã giải quyết
  - [ ] Bảng: Mã · Khách · Tiêu đề · Ngày · Status badge · Thao tác

- [ ] **M-07 · Chi tiết khiếu nại** `app/manager/khieu-nai/[id]/page.tsx`
  - [ ] Gọi `getManagerComplaintDetail(id)`
  - [ ] Mô tả + gallery ảnh + link booking liên quan
  - [ ] Form: textarea resolution · dropdown kết luận
  - [ ] Gọi `resolveComplaint()`, optional: `adjustLoyaltyPoints()`

- [ ] **M-08 · Hồ sơ khách** `app/manager/khach-hang/[id]/page.tsx`
  - [ ] Gọi `getCustomerProfile(id)`
  - [ ] Bento: thông tin · Trust Score · Loyalty tier · Lịch sử booking
  - [ ] Nút "Điều chỉnh Trust Score" → `adjustTrustScore()`
  - [ ] Nút "Mở khóa tài khoản" → `unblockCustomer()`

- [ ] **M-09 · Báo cáo** `app/manager/bao-cao/page.tsx`
  - [ ] Date range picker + preset: Hôm nay · 7 ngày · 30 ngày
  - [ ] Tab: Đặt lịch · Doanh thu · Nhân viên
  - [ ] Gọi `getBookingReport()` + `getWasherReport()`
  - [ ] Stat cards + charts (reuse `revenue-chart.tsx`)

- [ ] **M-10 · Danh sách nhân viên** `app/manager/nhan-vien/page.tsx`
  - [ ] Gọi `getCarWashers()`
  - [ ] Grid card: avatar · tên · trạng thái ca · task hôm nay · đánh giá TB

---

## 🤝 Shared Components (phối hợp với Đạt)

- [ ] `StatusBadge` — badge theo `BookingStatus`
- [ ] `TierBadge` — MEMBER/SILVER/GOLD/PLATINUM
- [ ] `TrustScoreDisplay` — màu xanh/amber/đỏ theo ngưỡng
- [ ] `BookingCard` — card tóm tắt booking (reuse M-01)
- [ ] `SlotCountdown` — countdown 10 phút hold
- [ ] `MonoText` — wrapper `font-mono`
- [ ] `ConfirmDialog` — modal xác nhận
- [ ] `PhotoUploadGrid` — grid 2x2 upload ảnh (W-03, W-07)
