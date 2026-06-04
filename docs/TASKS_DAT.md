# 📋 TASKS — THÀNH ĐẠT

> **Phụ trách:** Auth + Customer Portal (C-01 → C-19) + Admin Panel (A-01 → A-08)
> **Branch prefix:** `feature/auth-*` · `feature/C-xx-*` · `feature/A-xx-*`
> **Quy ước:** `[ ]` Chưa làm · `[/]` Đang làm · `[x]` Xong · `[~]` Blocked chờ BE

---

## 🔐 PHASE 1 — Auth *(Ưu tiên cao nhất — làm trước tuần 1)*

- [ ] **C-02 · Đăng nhập** `app/auth/dang-nhap/page.tsx`
  - [ ] Form SĐT/Email + Mật khẩu
  - [ ] Gọi `login()` → lưu token → redirect theo `role`
  - [ ] Xử lý lỗi: sai mật khẩu, tài khoản bị khóa

- [ ] **C-03 · Đăng ký** `app/auth/dang-ky/page.tsx`
  - [ ] Form: Họ tên · Email · SĐT · Mật khẩu · Xác nhận MK
  - [ ] Gọi `register()` → redirect sang OTP kèm `user_id`
  - [ ] Xử lý lỗi 409 (email/SĐT đã tồn tại)

- [ ] **C-04 · Xác thực OTP** `app/auth/xac-thuc/page.tsx`
  - [ ] 6 ô input tự focus ô tiếp theo
  - [ ] Đếm ngược 60s, nút "Gửi lại" sau khi hết
  - [ ] Gọi `verifyOtp()` → lưu token → redirect `/customer`

- [ ] **Middleware bảo vệ route** `middleware.ts` *(root)*
  - [ ] Kiểm tra token → redirect `/auth/dang-nhap` nếu chưa đăng nhập
  - [ ] Redirect đúng portal theo `role`

---

## 🏠 PHASE 2 — Customer: Trang chủ & Profile *(Tuần 1–2)*

- [ ] **C-01 · Landing Page** `app/customer/page.tsx`
  - [ ] Hero section + 2 CTA button
  - [ ] Bento grid 5 nhóm dịch vụ (gọi `getServices()`)
  - [ ] Section 4 membership tiers
  - [ ] Section giải thích Trust Score
  - [ ] Footer gọi `getStoreInfo()`

- [ ] **C-19 · Hồ sơ cá nhân** `app/customer/page.tsx`
  - [ ] Gọi `getMyProfile()`, form chỉnh sửa tên · tháng sinh
  - [ ] Quick links: Xe của tôi · Lịch hẹn · Điểm thưởng

- [ ] **C-13 · Quản lý xe** `app/customer/phuong-tien/page.tsx`
  - [ ] Danh sách xe — `getMyVehicles()`
  - [ ] Thêm xe — drawer → `createVehicle()`
  - [ ] Sửa xe → `updateVehicle()`
  - [ ] Xóa xe + confirm dialog → `deleteVehicle()` (xử lý 422)

---

## 📅 PHASE 3 — Booking Flow *(Tuần 2 — Luồng cốt lõi)*

> ⚠️ Cần BE: `GET /services` và `POST /slots/check-availability`

- [ ] **C-05 · Step 1 — Chọn loại xe** `app/customer/dat-lich/page.tsx`
  - [ ] 3 card S/M/L với mô tả
  - [ ] Lưu `vehicle_size` vào wizard state

- [ ] **C-06 · Step 2 — Chọn dịch vụ**
  - [ ] Gọi `getServices({ vehicle_size })`, nhóm theo category
  - [ ] Checkbox multi-select, tính tổng tiền + thời lượng realtime
  - [ ] Sticky bottom bar: Tổng tiền · Thời lượng · Nút Tiếp theo

- [ ] **C-07 · Step 3 — Chọn ngày & giờ**
  - [ ] Calendar picker (disable quá khứ + ngoài booking window tier)
  - [ ] Gọi `checkAvailability()` → slot grid 07:00–17:30
  - [ ] WASH: highlight N slot liên tiếp khi hover; FLEX: chọn 1 slot
  - [ ] Gọi `holdSlot()` → `slot_hold_token` + countdown 10 phút

- [ ] **C-08 · Step 4 — Xác nhận**
  - [ ] Booking summary đầy đủ
  - [ ] Chọn xe từ `getMyVehicles()`, input voucher validate realtime
  - [ ] Countdown 10 phút, gọi `createBooking()`
  - [ ] Xử lý lỗi: `SLOT_HOLD_EXPIRED` · `VOUCHER_INVALID` · `TRUST_SCORE_BLOCKED`

- [ ] **C-09 · Đặt lịch thành công** `app/customer/dat-lich-thanh-cong/page.tsx`
  - [ ] Animation checkmark xanh
  - [ ] Mã booking `font-mono`
  - [ ] Banner amber nhắc T-2h email
  - [ ] Nút: Xem lịch hẹn / Về trang chủ

---

## 📋 PHASE 4 — Quản lý lịch hẹn *(Tuần 2–3)*

- [ ] **C-10 · Danh sách lịch hẹn** `app/customer/lich-hen/page.tsx`
  - [ ] Gọi `getMyBookings()` với filter tab status
  - [ ] Booking card: mã (mono) · dịch vụ · ngày giờ · status badge
  - [ ] Nút action theo trạng thái, pagination

- [ ] **C-11 · Chi tiết lịch hẹn** `app/customer/lich-hen/[id]/page.tsx`
  - [ ] Gọi `getMyBookingDetail(id)`, timeline horizontal
  - [ ] Nút "Xác nhận tình trạng xe" → `confirmVehicleCondition()`
  - [ ] Nút "Hủy lịch" → confirm dialog → `cancelBooking()` → hiện trust score change
  - [ ] Nút "Xác nhận sẽ đến" → `confirmAttendance()`

- [ ] **C-12 · T-2h Email Landing** `app/customer/xac-nhan-lich/[token]/page.tsx`
  - [ ] Nhận `confirm_token` từ URL, hiển thị booking
  - [ ] Nút "Xác nhận sẽ đến" / "Hủy lịch"

---

## ⭐ PHASE 5 — Loyalty & Voucher *(Tuần 3)*

- [ ] **C-14 · Loyalty Dashboard** `app/customer/diem-thuong/page.tsx`
  - [ ] Gọi `getLoyaltyDashboard()`
  - [ ] Bento: tier badge · điểm (mono) · progress bar lên hạng
  - [ ] 4 tier cards ngang, active = viền gold
  - [ ] Bảng lịch sử: EARN (xanh) · REDEEM (đỏ) · EXPIRE (slate)

- [ ] **C-15 · Đổi điểm** `app/customer/do-diem/page.tsx`
  - [ ] Gọi `getRewardCatalog()`, filter theo loại
  - [ ] Grid reward cards, badge "Không đủ điểm" / "Cần hạng BẠC+"
  - [ ] Gọi `redeemReward()` → hiển thị voucher code

- [ ] **C-16 · Voucher của tôi** `app/customer/voucher/page.tsx`
  - [ ] Gọi `getMyVouchers()`
  - [ ] Tab: Đang dùng · Đã dùng · Hết hạn
  - [ ] Voucher card: code (mono) · hạn dùng · nút Copy

---

## 🌟 PHASE 6 — Sau dịch vụ *(Tuần 3–4)*

- [ ] **C-17 · Đánh giá** `app/customer/danh-gia/[booking_id]/page.tsx`
  - [ ] 3 tiêu chí sao: Chất lượng · Thái độ · Đúng giờ
  - [ ] Textarea ghi chú, gọi `rateBooking()`

- [ ] **C-18 · Khiếu nại** `app/customer/khieu-nai/[booking_id]/page.tsx`
  - [ ] Banner: còn X ngày để khiếu nại (max 7 ngày sau CLOSED)
  - [ ] Form: tiêu đề · mô tả · upload ảnh (max 5)
  - [ ] Gọi `createComplaint()` với FormData

---

## ⚙️ PHASE 7 — Admin Panel *(Tuần 4+)*

- [ ] **A-01 · Quản lý người dùng** `app/admin/quan-ly-nguoi-dung/page.tsx`
  - [ ] Tab: Khách hàng · Nhân viên · Manager
  - [ ] Ban/Unban → `updateUserStatus()`, thêm nhân viên → `createStaffAccount()`

- [ ] **A-03 · Quản lý dịch vụ** `app/admin/dich-vu/page.tsx`
  - [ ] Tab 5 nhóm, grid card: giá S/M/L editable · toggle active
  - [ ] Drawer thêm/sửa → `createService()` · `updateService()`

- [ ] **A-05 · Cấu hình điểm** `app/admin/cau-hinh-diem/page.tsx`
  - [ ] Gọi `getLoyaltyConfig()` + `updateLoyaltyConfig()`
  - [ ] Input: conversion rate · expiry days · multiplier per tier

- [ ] **A-06 · Cấu hình Tier** `app/admin/cau-hinh-tier/page.tsx`
  - [ ] 4 tier cards editable: ngưỡng chi tiêu · booking window · multiplier

- [ ] **A-07 · Phần thưởng** `app/admin/phan-thuong/page.tsx`
  - [ ] Bảng reward + drawer thêm/sửa → `createReward()` · `updateReward()`

- [ ] **A-08 · Nhật ký hoạt động** `app/admin/nhat-ky-hoat-dong/page.tsx`
  - [ ] Filter: date range · entity · hành động · người dùng
  - [ ] Row expand → JSON diff trước/sau

---

## 🤝 Shared Components (phối hợp với Vũ)

- [ ] `StatusBadge` — badge theo `BookingStatus`
- [ ] `TierBadge` — MEMBER/SILVER/GOLD/PLATINUM
- [ ] `TrustScoreDisplay` — màu xanh/amber/đỏ theo ngưỡng
- [ ] `BookingCard` — card tóm tắt booking (reuse C-10)
- [ ] `SlotCountdown` — countdown 10 phút hold
- [ ] `MonoText` — wrapper `font-mono`
- [ ] `ConfirmDialog` — modal xác nhận
- [ ] `PhotoUploadGrid` — grid 2x2 upload ảnh (C-18)
