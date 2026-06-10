# 📋 TASKS — THÀNH ĐẠT

> **Phụ trách:** Auth + Customer Portal (C-01 → C-19) + Admin Panel (A-01 → A-08)
> **Branch prefix:** `feature/auth-*` · `feature/C-xx-*` · `feature/A-xx-*`
> **Quy ước:** `[ ]` Chưa làm · `[/]` Đang làm · `[x]` Xong · `[~]` Blocked chờ BE

---

## 🔐 PHASE 1 — Auth *(Ưu tiên cao nhất — làm trước tuần 1)*

- [x] **C-02 · Đăng nhập** `app/auth/dang-nhap/page.tsx`
  - [x] Form SĐT/Email + Mật khẩu
  - [x] Gọi `login()` → lưu token → redirect theo `role`
  - [x] Xử lý lỗi: sai mật khẩu, tài khoản bị khóa

- [x] **C-03 · Đăng ký** `app/auth/dang-ky/page.tsx`
  - [x] Form: Họ tên · Email · SĐT · Mật khẩu · Xác nhận MK
  - [x] Gọi `register()` → redirect sang OTP kèm `user_id`
  - [x] Xử lý lỗi 409 (email/SĐT đã tồn tại)

- [x] **C-04 · Xác thực OTP** `app/auth/xac-thuc/page.tsx`
  - [x] 6 ô input tự focus ô tiếp theo
  - [x] Đếm ngược 60s, nút "Gửi lại" sau khi hết (BE hỗ trợ 2 phút)
  - [x] Gọi `verifyOtp()` → lưu token → redirect `/customer` (Chờ BE trả token, hiện tại chuyển hướng về Đăng nhập)

- [x] **Middleware bảo vệ route** `middleware.ts` *(root)*
  - [x] Kiểm tra token → redirect `/auth/dang-nhap` nếu chưa đăng nhập
  - [x] Redirect đúng portal theo `role`

---

## 🏠 PHASE 2 — Customer: Trang chủ & Profile *(Tuần 1–2)*

- [x] **C-01 · Dashboard/Landing** `app/customer/page.tsx`
  - [x] Hero section chào hỏi + Trust Score badge
  - [x] Loyalty card: điểm thưởng (font-mono) + tier badge
  - [x] CTA card Đặt lịch mới
  - [x] Section lịch sắp tới + lịch sử gần đây (gọi `getMyBookings()`)
  - [x] Gọi `getMyProfile()` để load profile

- [x] **C-19 · Hồ sơ cá nhân** `app/customer/ho-so/page.tsx`
  - [x] Gọi `getMyProfile()`, form chỉnh sửa tên · tháng sinh
  - [x] Gọi `updateProfile()` để lưu thay đổi + toast phản hồi
  - [x] Quick links: Xe của tôi · Lịch hẹn · Điểm thưởng
  - [x] Hiển thị TrustScore, TierBadge, chi tiêu 12 tháng

- [x] **C-13 · Quản lý xe** `app/customer/phuong-tien/page.tsx`
  - [x] Danh sách xe — `getMyVehicles()` + fallback mock
  - [x] Thêm xe — Sheet drawer → `createVehicle()`
  - [x] Sửa xe → `updateVehicle()`
  - [x] Xóa xe + ConfirmDialog → `deleteVehicle()` (xử lý 422)
  - [x] Nút đặt xe mặc định → `updateVehicle({ is_default: true })`

---

## 📅 PHASE 3 — Booking Flow *(Tuần 2 — Luồng cốt lõi)*

> ⚠️ Cần BE: `GET /services` và `POST /slots/check-availability`

- [x] **C-05 · Step 1 — Chọn loại xe** `app/customer/dat-lich/page.tsx`
  - [x] 3 card S/M/L với mô tả + badge xe đã lưu phù hợp
  - [x] Lưu `vehicle_size` vào wizard state, auto-select xe khớp cỡ

- [x] **C-06 · Step 2 — Chọn dịch vụ**
  - [x] Gọi `getServices({ vehicle_size })`, nhóm theo category
  - [x] Badge WASH (xanh) / FLEX (tím) theo `is_wash_group`
  - [x] Checkbox multi-select, tính tổng tiền + thời lượng realtime
  - [x] Sticky bottom bar: Tổng tiền · Thời lượng · Nút Tiếp theo

- [x] **C-07 · Step 3 — Chọn ngày & giờ**
  - [x] Calendar picker (disable quá khứ + ngoài `booking_window_days` từ profile)
  - [x] Gọi `checkAvailability()` → slot grid với giờ bắt đầu/kết thúc
  - [x] Chọn xe theo cỡ trước khi giữ slot (radio selector)
  - [x] Gọi `holdSlot()` → `slot_hold_token` + countdown 10 phút

- [x] **C-08 · Step 4 — Xác nhận**
  - [x] Booking summary đầy đủ (dịch vụ · ngày giờ · cỡ xe · tạm tính)
  - [x] Input voucher code + textarea ghi chú
  - [x] Countdown 10 phút (đổi màu đỏ khi < 60s), auto redirect về Step 3 khi hết
  - [x] Gọi `createBooking()`, xử lý 11 error business codes

- [x] **C-09 · Đặt lịch thành công** `app/customer/dat-lich-thanh-cong/page.tsx`
  - [x] Animation checkmark xanh (`animate-checkmark`)
  - [x] Mã booking `font-mono`, summary dịch vụ · ngày giờ · xe · giá
  - [x] Banner amber nhắc T-2h email
  - [x] Nút: Xem lịch hẹn / Về trang chủ
  - [x] Snapshot lưu `sessionStorage` để giữ data khi refresh

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

- [x] **A-01 · Quản lý người dùng** `app/admin/quan-ly-nguoi-dung/page.tsx`
  - [x] Tab: Khách hàng · Nhân viên · Manager
  - [x] Ban/Unban → `updateUserStatus()`, thêm nhân viên → `createStaffAccount()`

- [x] **A-03 · Quản lý dịch vụ** `app/admin/dich-vu/page.tsx`
  - [x] Tab 5 nhóm, grid card: giá S/M/L editable · toggle active
  - [x] Drawer thêm/sửa → `createService()` · `updateService()`

- [x] **A-05 · Cấu hình điểm** `app/admin/cau-hinh-diem/page.tsx`
  - [x] Gọi `getLoyaltyConfig()` + `updateLoyaltyConfig()`
  - [x] Input: conversion rate · expiry days · multiplier per tier

- [x] **A-06 · Cấu hình Tier** `app/admin/cau-hinh-tier/page.tsx`
  - [x] 4 tier cards editable: ngưỡng chi tiêu · booking window · multiplier

- [x] **A-07 · Phần thưởng** `app/admin/phan-thuong/page.tsx`
  - [x] Bảng reward + drawer thêm/sửa → `createReward()` · `updateReward()`

- [x] **A-08 · Nhật ký hoạt động** `app/admin/nhat-ky-hoat-dong/page.tsx`
  - [x] Filter: date range · entity · hành động · người dùng
  - [x] Row expand → JSON diff trước/sau

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
