# 📝 BE Integration Notes & Design Changes

Tài liệu này tổng hợp các thay đổi thực tế của Backend (BE) so với tài liệu thiết kế ban đầu và cách Frontend (FE) tích hợp, giúp cả team (Thành Đạt & Trí Vũ) thống nhất cách làm việc.

---

## 1. ⚙️ Thay đổi về API Contract (Đăng nhập / Đăng ký / OTP)

Trong quá trình implement Phase 1 Auth, API của Backend (.NET 8) có một số điều chỉnh so với thiết kế lý thuyết ban đầu:

| Nội dung | Thiết kế ban đầu | Thực tế Backend tích hợp |
|---|---|---|
| **Endpoint Đăng nhập** | `POST /auth/login` | `POST /auth/signin` |
| **Trường đăng nhập** | Số điện thoại (`phone`) | Email (`email`) |
| **Response Đăng nhập** | Dạng nested: `{data: {access_token, role}}` | Dạng phẳng (flat): `{success, token, role, message}` |
| **Endpoint Đăng ký** | `POST /auth/register` | `POST /auth/signup` |
| **Trường SĐT khi đăng ký** | Bắt buộc (`required`) | **Không bắt buộc** (`optional`) |
| **Độ dài & Định dạng MK** | Tối thiểu 8 ký tự | $\ge 6$ ký tự, chứa ít nhất 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt |
| **Định danh nhận OTP** | `user_id` | `email` |
| **Thời gian hết hạn OTP** | 60 giây | **120 giây (2 phút)** |
| **Endpoint Refresh Token** | Gửi `refresh_token` trong Body lên `/auth/refresh-token` | Sử dụng **httpOnly Cookie** gửi lên `POST /auth/renew-token` |
| **Sau khi xác thực OTP** | Trả về token và tự động đăng nhập | Chỉ trả về `{success: true, message}`. Người dùng cần quay lại màn hình Đăng nhập (Chờ BE bổ sung trả token sau này) |

---

## 2. 👥 Quy trình xử lý Shadow User (Người dùng ảo)

Đây là một tính năng nghiệp vụ rất quan trọng phục vụ đối tượng khách vãng lai và chuyển đổi sang khách hàng online:

1. **Khách vãng lai đến tiệm (Walk-in)**:
   - Manager/Staff tạo booking trực tiếp tại quầy thông qua màn hình **M-03**.
   - Nếu số điện thoại của khách chưa tồn tại trong hệ thống, hệ thống sẽ tự động tạo một tài khoản **Shadow User** (Khách ảo) với:
     - `status: INACTIVE`
     - Không có mật khẩu.
     - `emailVerified: false`
   - Booking được lưu trữ dưới profile của Shadow User này.

2. **Khách hàng tự đăng ký online sau đó**:
   - Khi khách hàng tự đăng ký tài khoản qua `/auth/dang-ky` với **số điện thoại trùng với Shadow User trước đó**:
     - Backend sẽ **không trả về lỗi 409 Conflict** nữa.
     - Thay vào đó, Backend sẽ tự động "liên kết và chuyển đổi" (Claim) tài khoản Shadow User đó thành tài khoản chính thức (`status: ACTIVE`, cập nhật mật khẩu khách nhập).
     - Toàn bộ lịch sử đặt lịch và điểm tích lũy trước đó của khách khi đi vãng lai sẽ được giữ nguyên và hiển thị trên tài khoản online mới.

> [!NOTE]
> **Task liên quan**:
> - Đạt: `/auth/dang-ky` cần xử lý API thành công khi trùng SĐT đã có profile shadow.
> - Vũ: Màn hình **M-03 (Walk-in)** cần tích hợp endpoint `POST /auth/shadow-customer`.

---

## 3. 🔑 Cơ chế Security & Cookie

FE không còn lưu trữ token thuần trong `localStorage` để phân quyền cho Middleware nữa (tránh lỗi ngắt quãng khi Server-side render).
- Khi **Đăng nhập thành công**:
  - FE lưu `aw_access_token` và `aw_role` vào **Cookie** thông qua helper `setCookie` (trong `lib/api/client.ts`).
  - `middleware.ts` đọc cookie này để kiểm tra quyền truy cập và chuyển hướng người dùng tương ứng với vai trò (`CUSTOMER` -> `/customer`, `MANAGER` -> `/manager`, `WASHER` -> `/washer`, `ADMIN` -> `/admin`).
- Khi **Refresh Token**:
  - Backend sử dụng cơ chế `httpOnly cookie` cho Refresh token nên FE không thể/không cần can thiệp đọc client-side. Hệ thống sẽ tự động gửi cookie này lên endpoint `POST /auth/renew-token` khi cần refresh token.

---

## 🌐 Quy tắc làm việc chung với API Swagger

Mọi thay đổi hoặc cập nhật tiếp theo về API, cả team thống nhất:
1. Chạy Backend local tại `localhost:5255` hoặc môi trường dev deploy.
2. Truy cập **Swagger** tại: `http://localhost:5255/swagger` để xem chính xác định dạng Request/Response.
3. Tuyệt đối **không tự ý đổi cấu trúc API client** mà không cập nhật tài liệu hoặc kiểm tra Swagger của BE.

---

*Cập nhật bởi: Antigravity 2.0 & Thành Đạt*
