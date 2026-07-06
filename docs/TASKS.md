# TASKS.md — AutoWash Pro FE

> **Cập nhật:** 2026-06-03  
> **Quy ước trạng thái:** `[ ]` Chưa làm · `[/]` Đang làm · `[x]` Hoàn thành · `[~]` Blocked/Chờ BE

---

## 👤 THÀNH ĐẠT — Auth + Customer Portal + Admin Panel

> Phụ trách: Màn hình C-01 đến C-19 + toàn bộ Auth flow + Admin Panel (A-01 → A-08)  
> Branch prefix: `feature/auth-*` · `feature/C-xx-*` · `feature/A-xx-*`

---

### 🔐 PHASE 1 — Auth (Ưu tiên cao nhất, làm trước)

> Các màn hình khác đều depend vào Auth. Làm xong trước tuần 1.

- [x] **C-02 · Trang Đăng nhập** `app/auth/dang-nhap/page.tsx`
  - [x] Form: SĐT/Email + Mật khẩu
  - [x] Gọi `login()` từ `@/lib/api`
  - [x] Lưu token, redirect theo `role` (CUSTOMER→`/customer`, MANAGER→`/manager`, ...)
  - [x] Hiển thị lỗi: sai mật khẩu, tài khoản bị khóa
  - [ ] Nút "Quên mật khẩu?" (link, chưa cần implement)

- [x] **C-03 · Trang Đăng ký** `app/auth/dang-ky/page.tsx`
  - [x] Form: Họ tên, Email, SĐT, Mật khẩu, Xác nhận mật khẩu
  - [x] Gọi `register()`, nhận `user_id` (BE trả về email để xác thực)
  - [x] Redirect sang trang xác thực OTP kèm `email` làm query param
  - [x] Hiển thị lỗi: email/SĐT đã tồn tại (409 CONFLICT - hoặc claim Shadow profile)

- [x] **C-04 · Xác thực OTP** `app/auth/xac-thuc/page.tsx`
  - [x] 6 ô input tự động focus ô tiếp theo
  - [x] Đếm ngược 120s (OTP 2 phút từ BE), nút "Gửi lại mã" sau khi hết giờ
  - [x] Gọi `verifyOtp()`, lưu token, redirect về `/customer` (Hiện tại chờ BE tích hợp trả token ở verify, FE tạm redirect về Đăng Nhập)
  - [x] Hiển thị lỗi: OTP sai, OTP hết hạn

- [x] **Middleware bảo vệ route** `middleware.ts` _(tạo mới ở root)_
  - [x] Kiểm tra token trong cookie (`aw_access_token` và `aw_role`)
  - [x] Redirect về `/auth/dang-nhap` nếu chưa đăng nhập
  - [x] Redirect về trang phù hợp nếu sai role

---

### 🏠 PHASE 2 — Customer: Trang chủ & Profile

- [x] **C-01 · Landing Page** `app/customer/page.tsx`
  - [x] Hero section + 2 CTA button
  - [x] Bento grid 5 nhóm dịch vụ (gọi `getServices()` để lấy dữ liệu thật)
  - [x] Section 4 membership tiers
  - [x] Section giải thích Trust Score
  - [x] Footer với thông tin cửa hàng (gọi `getStoreInfo()`)

- [x] **C-19 · Hồ sơ cá nhân** `app/customer/ho-so/page.tsx`
  - [x] Hiển thị thông tin cá nhân (gọi `getMyProfile()`)
  - [x] Form chỉnh sửa tên, tháng sinh
  - [x] Quick links: Xe của tôi, Lịch hẹn, Điểm thưởng

- [x] **C-13 · Quản lý xe** `app/customer/phuong-tien/page.tsx`
  - [x] Danh sách xe (gọi `getMyVehicles()`)
  - [x] Thêm xe mới (gọi `createVehicle()`) — form drawer/sheet
  - [x] Sửa xe (gọi `updateVehicle()`)
  - [x] Xóa xe (gọi `deleteVehicle()`) — confirm dialog
  - [x] Xử lý lỗi: xe đang có booking active không xóa được (422)

---

### 📅 PHASE 3 — Customer: Booking Flow (Luồng quan trọng nhất)

> **Dependency:** Cần BE expose `GET /services` và `POST /slots/check-availability` trước.

- [x] **C-05 · Step 1 — Chọn loại xe** `app/customer/dat-lich/page.tsx`
  - [x] 3 card S/M/L với minh họa và mô tả
  - [x] Lưu `vehicle_size` vào state/context booking wizard
  - [x] Nếu đã có xe lưu sẵn → highlight xe phù hợp

- [x] **C-06 · Step 2 — Chọn dịch vụ**
  - [x] Gọi `getServices({ vehicle_size })` để lấy danh sách + giá
  - [x] Nhóm theo category (WASH badge xanh, FLEX badge tím)
  - [x] Checkbox multi-select, tính tổng tiền + thời lượng realtime
  - [x] Sticky bottom bar: Tổng tiền · Thời lượng · Nút Tiếp theo

- [x] **C-07 · Step 3 — Chọn ngày & giờ**
  - [x] Calendar picker (disable ngày quá khứ + ngoài booking window của tier)
  - [x] Gọi `checkAvailability()` khi chọn ngày
  - [x] Hiển thị slot grid với giờ bắt đầu/kết thúc
  - [x] WASH/FLEX: phân biệt qua `booking_type` từ API
  - [x] Legend: Đang chọn · Còn trống · Không khả dụng
  - [x] Gọi `holdSlot()` khi chọn slot → nhận `slot_hold_token` + countdown 10 phút

- [x] **C-08 · Step 4 — Xác nhận**
  - [x] Booking summary (dịch vụ, ngày giờ, giá)
  - [x] Hiển thị xe đã dùng để giữ slot
  - [x] Input voucher code
  - [x] Hiển thị countdown 10 phút slot hold (đổi màu đỏ khi < 60s)
  - [x] Gọi `createBooking()` khi confirm
  - [x] Xử lý lỗi: `SLOT_HOLD_EXPIRED`, `VOUCHER_INVALID`, `TRUST_SCORE_BLOCKED` và 9 error codes khác

- [x] **C-09 · Xác nhận thành công** `app/customer/dat-lich-thanh-cong/page.tsx`
  - [x] Animation checkmark xanh (`animate-checkmark`)
  - [x] Hiển thị mã booking (font-mono)
  - [x] Banner amber: nhắc về T-2h email
  - [x] Nút: Xem lịch hẹn / Về trang chủ
  - [x] Snapshot lưu vào `sessionStorage` để không mất data khi refresh

---

### 📋 PHASE 4 — Customer: Quản lý lịch hẹn

- [x] **C-10 · Danh sách lịch hẹn** `app/customer/lich-hen/page.tsx`
  - [x] Gọi `getMyBookings()` với filter theo status
  - [x] Tab filter: Tất cả · Sắp tới · Đang thực hiện · Hoàn thành · Đã hủy
  - [x] Booking card: mã, dịch vụ, ngày giờ (JetBrains Mono), status badge
  - [x] Nút action theo trạng thái: Xác nhận tình trạng xe · Đánh giá · Hủy
  - [x] Pagination
  - [x] Empty state component

- [x] **C-11 · Chi tiết lịch hẹn** `app/customer/lich-hen/[id]/page.tsx`
  - [x] Gọi `getMyBookingDetail(id)`
  - [x] Progress bar trạng thái (horizontal timeline, map đầy đủ BookingStatus)
  - [x] Tất cả thông tin: dịch vụ, xe, slot, payment summary
  - [x] Nút "Xác nhận tình trạng xe" → gọi `confirmVehicleCondition()`
  - [x] Nút "Hủy lịch" → confirm dialog → gọi `cancelBooking()` → hiển thị trust score change
  - [x] Loading skeleton + error state

- [x] **C-12 · T-2h Email Landing** `app/customer/xac-nhan-lich/[token]/page.tsx`
  - [x] Nhận `bookingId:confirm_token` từ URL param
  - [x] Gọi `confirmAttendanceByToken()` (public endpoint, unauthenticated)
  - [x] 3 states: Loading spinner · Success (checkmark animation) · Error
  - [x] Amber reminder banner khi thành công

---

### ⭐ PHASE 5 — Customer: Loyalty & Voucher

- [ ] **C-14 · Loyalty Dashboard** `app/customer/diem-thuong/page.tsx`
  - [ ] Gọi `getLoyaltyDashboard()`
  - [ ] Bento: tier badge · điểm lớn (JetBrains Mono) · progress bar lên hạng tiếp
  - [ ] 4 tier cards ngang (MEMBER → SILVER → GOLD → PLATINUM), active = viền gold
  - [ ] Bảng lịch sử điểm: EARN (xanh) · REDEEM (đỏ) · EXPIRE (slate)

- [ ] **C-15 · Đổi điểm** `app/customer/do-diem/page.tsx`
  - [ ] Gọi `getRewardCatalog()`
  - [ ] Filter theo loại: Tất cả · Voucher · Rửa xe · Dịch vụ
  - [ ] Grid reward cards: tên · điểm cần · giá trị · tier yêu cầu
  - [ ] Badge "Không đủ điểm" / "Cần hạng BẠC+" nếu không đủ điều kiện
  - [ ] Nút "Đổi ngay" → confirm → gọi `redeemReward()` → hiển thị voucher code

- [ ] **C-16 · Voucher của tôi** `app/customer/voucher/page.tsx`
  - [ ] Gọi `getMyVouchers()`
  - [ ] Tab: Đang dùng được · Đã dùng · Hết hạn
  - [ ] Voucher card: code (JetBrains Mono) · giá trị · hạn dùng · nút Copy

---

### 🌟 PHASE 6 — Customer: Sau dịch vụ

- [x] **C-17 · Đánh giá** `app/customer/danh-gia/[booking_id]/page.tsx`
  - [x] 3 tiêu chí sao: Chất lượng · Thái độ · Đúng giờ
  - [x] Textarea ghi chú
  - [x] Gọi `rateBooking()`

- [x] **C-18 · Khiếu nại** `app/customer/khieu-nai/[booking_id]/page.tsx`
  - [x] Warning banner: còn X ngày để khiếu nại (max 7 ngày sau CLOSED)
  - [x] Form: tiêu đề · mô tả · upload ảnh (max 5 ảnh)
  - [x] Gọi `createComplaint()` với FormData


---

## 👤 TRÍ VŨ — Washer Portal + Manager Dashboard

> Phụ trách: W-01 → W-07 · M-01 → M-10  
> Branch prefix: `feature/W-xx-*` · `feature/M-xx-*`

---

### 🔧 PHASE 1 — Washer Portal

> 🖥️ Desktop-first — responsive mobile là tùy biến, không bắt buộc. Làm trước Manager vì BE cần test luồng nghiệp vụ.

- [ ] **W-01 · Danh sách task hôm nay** `app/washer/page.tsx`
  - [ ] Gọi `getWasherTasks(today)` — refresh mỗi 30s hoặc khi focus tab
  - [ ] Mini bento stats: Đã hoàn thành · Đang xử lý · Giờ làm
  - [ ] Task cards sorted theo giờ: biển số (JetBrains Mono) · dịch vụ · status badge · cầu nâng
  - [ ] Empty state: "Không có task hôm nay"

- [ ] **W-02 · Chi tiết task** `app/washer/[id]/page.tsx`
  - [ ] Gọi `getWasherTaskDetail(id)`
  - [ ] Thông tin khách + xe + dịch vụ + ghi chú
  - [ ] Timeline hành động — chỉ hiện nút phù hợp theo status:
    - ASSIGNED → nút "Xác nhận khách đến" → `washerCheckIn()`
    - CHECKED_IN → nút "Kiểm tra xe" → navigate W-03
    - VEHICLE_INSPECTED → nút "Xem biên bản" + "Chờ khách xác nhận"
    - CUSTOMER_CONFIRMED_CONDITION → nút "Bắt đầu dịch vụ" → `startService()`
    - IN_PROGRESS → navigate W-06
    - COMPLETED → nút "Hoàn thành" → navigate W-07

- [ ] **W-03 · Form kiểm tra xe** `app/washer/[id]/kiem-tra/page.tsx` _(tạo thêm)_
  - [ ] Toggle: BEFORE_SERVICE / AFTER_SERVICE
  - [ ] Mini card booking (readonly)
  - [ ] Checklist hư hỏng (checkbox → hiện textarea khi tick)
  - [ ] Textarea ngoại thất + nội thất
  - [ ] Dropdown mức nhiên liệu + input số km (JetBrains Mono)
  - [ ] Nút "Chụp ảnh xe" → navigate W-04

- [ ] **W-04 · Upload ảnh** _(tích hợp vào W-03 hoặc trang riêng)_
  - [ ] Grid 2x2: Mặt trước · Mặt sau · Bên trái · Bên phải
  - [ ] Click ô → file picker → preview thumbnail
  - [ ] Validate: bắt buộc ít nhất 1 ảnh
  - [ ] Gọi `createInspection()` → nhận `inspection_id`
  - [ ] Gọi `uploadInspectionImages()` với FormData

- [ ] **W-05 · Màn hình xác nhận của khách** `app/washer/[id]/xac-nhan-khach/page.tsx`
  - [ ] Hiển thị kết quả inspection (readonly, dành cho khách đọc trực tiếp tại quầy)
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
  - [ ] Upload ảnh xe sau rửa (tái dùng component W-04)
  - [ ] Textarea ghi chú sau dịch vụ
  - [ ] Gọi `completeService()` → navigate về W-01

---

### 📊 PHASE 2 — Manager Dashboard

> Desktop-first layout. Sidebar trái + bento grid content.

- [ ] **Layout Manager** `app/manager/layout.tsx` _(đã có, kiểm tra sidebar)_
  - [ ] Sidebar: Dashboard · Walk-in · Quản lý slot · Khiếu nại · Báo cáo · Nhân viên
  - [ ] Active route highlight
  - [ ] Collapsed mode trên màn nhỏ

- [ ] **M-01 · Dashboard** `app/manager/page.tsx`
  - [ ] Date picker (mặc định hôm nay)
  - [ ] Gọi `getManagerBookings({ date, status })` — auto refresh 1 phút
  - [ ] 4 KPI stat cards: Tổng · Chờ xử lý · Đang thực hiện · Hoàn thành
  - [ ] **Bento cầu nâng:** Grid 8 ô, màu theo trạng thái (cần thêm API hoặc tính từ slot data)
  - [ ] **Bảng booking chính:** Mã · Khách · Dịch vụ · Giờ (JetBrains Mono) · Cầu · Nhân viên · Status · Thao tác
  - [ ] Nút thao tác nhanh per row: "Gán NV" (opens M-04) · "Xác nhận"
  - [ ] **Bento cảnh báo Trust Score thấp** (< 60): Tên · SĐT · Điểm đỏ · Booking gần nhất
  - [ ] FAB button "Walk-in" → navigate M-03

- [ ] **M-02 · Chi tiết booking** `app/manager/booking/[id]/page.tsx`
  - [ ] Gọi `getManagerBookingDetail(id)`
  - [ ] Layout 2 cột: thông tin trái (2/3) · action panel phải (1/3)
  - [ ] Progress bar status
  - [ ] Card khách: tên · SĐT · Trust Score badge (màu theo ngưỡng) · Tier badge
  - [ ] Card xe: biển số (JetBrains Mono) · hãng/model · cỡ · màu
  - [ ] Card dịch vụ + nút "Chỉnh sửa dịch vụ" → gọi `updateBookingServices()`
  - [ ] Card phân công: washer name + "Phân công lại" → M-04
  - [ ] Card thanh toán: tổng tiền · phương thức selector · nút thanh toán → `createPayment()`
  - [ ] Action panel: nút theo trạng thái + nút "Hủy lịch" (dialog: có phạt/không phạt + lý do)

- [ ] **M-03 · Walk-in Form** `app/manager/khach-vang-lai/page.tsx`
  - [ ] Input SĐT + nút tìm → tìm tài khoản hiện có
  - [ ] Nếu có → hiện card thông tin khách
  - [ ] Nếu không → hiện form tạo mới (tên · email · SĐT)
  - [ ] Form thông tin xe (biển số · cỡ · hãng · model · màu)
  - [ ] Chọn dịch vụ (reuse component từ booking wizard)
  - [ ] Compact slot grid
  - [ ] Chọn washer (dropdown `getCarWashers()`)
  - [ ] Gọi `createWalkinBooking()` → hiển thị kết quả + `account_created` notice

- [ ] **M-04 · Modal Gán nhân viên** `components/manager/assign-washer-modal.tsx` _(đã có, kết nối API)_
  - [ ] Gọi `getCarWashers()` để lấy danh sách
  - [ ] Hiển thị: avatar · tên · số task hôm nay · trạng thái (xanh/amber/đỏ)
  - [ ] Gọi `assignWasher()` khi chọn
  - [ ] Gọi `reassignWasher()` nếu đã có washer trước đó

- [ ] **M-05 · Quản lý slot** `app/manager/quan-ly-slot/page.tsx`
  - [ ] Date picker tuần
  - [ ] Gọi `getManagerSlots(date)`
  - [ ] Grid: rows = giờ, columns = cầu nâng
  - [ ] Màu ô theo trạng thái: Trắng · Xanh nhạt (có booking) · Slate (khóa)
  - [ ] Hover → tooltip tên khách + dịch vụ
  - [ ] Panel phải: input số washer online + số cầu → `updateSlot()`

- [ ] **M-06 · Danh sách khiếu nại** `app/manager/khieu-nai/page.tsx`
  - [ ] Gọi `getManagerComplaints()`
  - [ ] Filter tabs: Chờ xử lý · Đang xử lý · Đã giải quyết
  - [ ] Bảng: Mã · Khách · Tiêu đề · Ngày · Status badge · Thao tác

- [ ] **M-07 · Chi tiết khiếu nại** `app/manager/khieu-nai/[id]/page.tsx`
  - [ ] Gọi `getManagerComplaintDetail(id)`
  - [ ] Hiển thị mô tả + gallery ảnh
  - [ ] Link đến booking liên quan
  - [ ] Form xử lý: textarea resolution · dropdown kết luận
  - [ ] Optional: điều chỉnh điểm loyalty `adjustLoyaltyPoints()`
  - [ ] Gọi `resolveComplaint()`

- [ ] **M-08 · Hồ sơ khách** `app/manager/khach-hang/[id]/page.tsx`
  - [ ] Gọi `getCustomerProfile(id)`
  - [ ] Bento: thông tin cá nhân · Trust Score · Loyalty tier · Lịch sử booking
  - [ ] Nút "Điều chỉnh Trust Score" → `adjustTrustScore()`
  - [ ] Nút "Mở khóa tài khoản" → `unblockCustomer()`

- [ ] **M-09 · Báo cáo** `app/manager/bao-cao/page.tsx`
  - [ ] Date range picker + preset: Hôm nay · 7 ngày · 30 ngày
  - [ ] Tab: Đặt lịch · Doanh thu · Nhân viên
  - [ ] Gọi `getBookingReport()` + `getWasherReport()`
  - [ ] Stat cards + chart placeholder (hoặc dùng `revenue-chart.tsx` đã có)

- [ ] **M-10 · Danh sách nhân viên** `app/manager/nhan-vien/page.tsx`
  - [ ] Gọi `getCarWashers()`
  - [ ] Grid card: avatar · tên · trạng thái ca · task hôm nay · đánh giá TB

---

### ⚙️ PHASE 7 — Admin Panel

> Desktop-only. Làm sau cùng khi các portal chính đã xong.

- [x] **Layout Admin** `app/admin/layout.tsx`
  - [x] Sidebar: Người dùng · Dịch vụ · Phần thưởng · Cấu hình điểm · Cấu hình Tier · Nhật ký

- [x] **A-01 · Quản lý người dùng** `app/admin/quan-ly-nguoi-dung/page.tsx`
  - [x] Gọi `getAdminUsers()` với filter theo role
  - [x] Tab: Khách hàng · Nhân viên · Manager
  - [x] Bảng: tên · email · tier badge · trust score (màu) · trạng thái
  - [x] Nút: Ban/Unban → `updateUserStatus()`
  - [x] Nút: "+ Thêm nhân viên" → form drawer → `createStaffAccount()`

- [x] **A-03 · Quản lý dịch vụ** `app/admin/dich-vu/page.tsx`
  - [x] Gọi `getAdminServices()`
  - [x] Tab theo nhóm dịch vụ (5 nhóm)
  - [x] Grid card: tên · badge loại · bảng giá S/M/L editable · toggle active
  - [x] Drawer thêm/sửa → `createService()` · `updateService()`

- [x] **A-05 · Cấu hình điểm** `app/admin/cau-hinh-diem/page.tsx`
  - [x] Gọi `getLoyaltyConfig()` + `updateLoyaltyConfig()`
  - [x] Input: conversion rate · expiry days · multiplier per tier

- [x] **A-06 · Cấu hình Tier** `app/admin/cau-hinh-tier/page.tsx`
  - [x] 4 tier cards editable: ngưỡng chi tiêu · booking window · multiplier

- [x] **A-07 · Phần thưởng** `app/admin/phan-thuong/page.tsx`
  - [x] Gọi `getAdminRewards()`
  - [x] Bảng: tên · loại · điểm · tier yêu cầu · số lượng · trạng thái
  - [x] Drawer thêm/sửa → `createReward()` · `updateReward()`

- [x] **A-08 · Nhật ký hoạt động** `app/admin/nhat-ky-hoat-dong/page.tsx`
  - [x] Filter: date range · loại entity · hành động · tên người dùng
  - [x] Bảng log: thời gian (JetBrains Mono) · người thực hiện · hành động · chi tiết
  - [x] Row expand → hiển thị JSON diff trước/sau

---

## 📌 Shared Components — Cả 2 cùng làm

> Tạo vào `components/shared/` — ai cần trước thì làm trước, push để người kia reuse.

- [ ] `StatusBadge` — pill badge theo `BookingStatus`, dùng `BOOKING_STATUS_CONFIG` từ types
- [ ] `TierBadge` — MEMBER/SILVER/GOLD/PLATINUM với màu tương ứng
- [ ] `TrustScoreDisplay` — số điểm màu xanh/amber/đỏ theo ngưỡng
- [ ] `BookingCard` — card tóm tắt booking reusable (dùng ở C-10 và M-01)
- [ ] `SlotCountdown` — countdown 10 phút slot hold
- [ ] `MonoText` — wrapper `font-mono` cho biển số, giờ, mã booking
- [x] `ConfirmDialog` — modal xác nhận có/không với nội dung custom (danger/warning/info tone)
- [ ] `PhotoUploadGrid` — grid upload ảnh 2x2 (dùng ở W-03, W-07, C-18)

---

## 🔄 Dependency map

```
Backend cần expose trước → FE mới implement được:

Week 1 (BE cần): POST /auth/* → Auth screens (Đạt)
Week 1 (BE cần): GET /services, GET /washer/tasks → Washer flow (Vũ)
Week 2 (BE cần): POST /bookings/hold-slot, POST /bookings → Booking flow (Đạt)
Week 2 (BE cần): GET /manager/bookings, PUT /manager/bookings/:id/assign → Manager (Vũ)
Week 3 (BE cần): POST /washer/tasks/:id/inspections → Inspection flow (Vũ)
Week 3 (BE cần): GET /customer/loyalty, POST /customer/loyalty/redeem → Loyalty (Đạt)
Week 4+: Payment (PayOS), Admin APIs, Reports
```

---

## ⚠️ Lưu ý khi implement

1. **Tất cả text phải tiếng Việt** — label, placeholder, badge, toast, error message
2. **Import API từ `@/lib/api`** — không gọi axios trực tiếp trong component
3. **Import types từ `@/lib/types`** — không tự định nghĩa interface trùng
4. **Khi chưa có API** — dùng data từ `lib/data.ts` (mock) và ghi `// TODO: connect API`
5. **Biển số xe, giờ, mã booking** — dùng class `font-mono` hoặc component `MonoText`
6. **Error handling** — mọi API call phải có `try/catch` + toast thông báo lỗi tiếng Việt
