# Cẩm Nang Kho Vũ Khí Frontend Skills (Frontend Skills Playbook)

Tài liệu này tổng hợp và phân loại toàn bộ **kho 75 Skills** của hệ thống thành các **nhóm chiến thuật cụ thể cho Frontend (FE)**. Khi tiếp tục nâng cấp UI cho dự án **AutoWash Pro**, chỉ cần xác định **công đoạn đang làm** hoặc **ý đồ thẩm mỹ**, sau đó yêu cầu Agent kích hoạt đúng skill tương ứng để đạt chất lượng tối đa.

---

## 🎨 1. Ý Đồ Thẩm Mỹ & Nghệ Thuật Giao Diện (Art Direction & UI Aesthetics)
Sử dụng nhóm này khi bạn muốn tạo ra giao diện đẹp ngỡ ngàng, đẳng cấp **Luxury / Agency-Grade**, không bị nhàm chán hay giống các template cơ bản.

| Tên Skill | Khi nào nên gọi / Ứng dụng cụ thể cho AutoWash Pro |
| :--- | :--- |
| **`high-end-visual-design`** | Khi thiết kế các trang chủ, trang dịch vụ VIP, Hero section cần phong cách sang trọng xa xỉ (typography cao cấp, nhịp điệu không gian, chiều sâu mềm mại). |
| **`design-taste-frontend`** | Khi xây dựng giao diện với "gu" thẩm mỹ khắt khe, phối màu có tính toán (HSL curated palette), bảng màu Dark Mode lộng lẫy và responsive mượt mà. |
| **`design-spells`** | Khi muốn bổ sung các "phép thuật" micro-interactions (hiệu ứng hover từ tính, nút bấm sáng bóng, viền sáng gradient, transition bất ngờ). |
| **`frontend-design`** | Định hình tư duy kỹ sư kiêm nhà thiết kế (Designer-Engineer), đảm bảo code ra là một tác phẩm UI chứ không phải layout thô. |
| **`ui-ux-designer`** | Khi cần thiết kế wireframe, hệ thống tokens, giải quyết bài toán trải nghiệm người dùng (UX flow) cho quy trình đặt lịch (Booking Wizard). |
| **`iconsax-library`** | Khi cần tìm kiếm hoặc bổ sung bộ icon cao cấp sắc nét cho các card tính năng, thông số xe, bảng điều khiển. |

---

## 🏗️ 2. Kiến Trúc & Công Nghệ Core Frontend (Next.js / React / Styling)
Sử dụng nhóm này khi bắt tay vào viết code trang (Page), chia nhỏ Component, xử lý luồng dữ liệu hoặc cấu hình Tailwind CSS.

| Tên Skill | Khi nào nên gọi / Ứng dụng cụ thể cho AutoWash Pro |
| :--- | :--- |
| **`frontend-dev-guidelines`** | **Tiêu chuẩn vàng bắt buộc** cho kỹ sư Frontend: tuân thủ kiến trúc chuẩn, phân chia Server/Client component rõ ràng, xử lý mutation API an toàn. |
| **`react-nextjs-development`** | Phát triển tổng thể ứng dụng Next.js 14/15/16 App Router, TypeScript strict, Tailwind CSS và Server Components. |
| **`nextjs-app-router-patterns`** | Khi xây dựng luồng routing phức tạp, layout lồng nhau (Portal Shell cho Customer/Washer/Manager/Admin), parallel/intercepting routes. |
| **`tailwind-patterns`** | Khi viết CSS/Tailwind v4 (sử dụng biến CSS variables, container queries, hệ thống tokens trong `globals.css`). |
| **`shadcn`** | Khi cần quản lý, tùy biến hoặc mở rộng các component nguyên thủy của `shadcn/ui` (Dialog, Sheet, Select, Table) mà không làm vỡ chuẩn New York style. |
| **`ui-component`** | Khi cần tạo ra một UI component độc lập mới đảm bảo chuẩn mực StyleSeed Toss về ergonomics và dễ tái sử dụng. |
| **`typescript-expert`** / **`typescript-pro`** | Khi định nghĩa kiểu dữ liệu phức tạp (`lib/types/index.ts`), xử lý generic hooks hoặc fix các lỗi typing khắt khe. |

---

## ⚡ 3. Tối Ưu Hiệu Năng & Chẩn Đoán (Performance Optimization)
Sử dụng khi giao diện có hiện tượng giật lag, load chậm, hoặc khi làm việc với các thành phần nặng như WebGL / Canvas / Bảng biểu dữ liệu lớn.

| Tên Skill | Khi nào nên gọi / Ứng dụng cụ thể cho AutoWash Pro |
| :--- | :--- |
| **`react-best-practices`** | Cẩm nang tối ưu hiệu năng chính thức từ Vercel. Kích hoạt khi viết trang mới để đảm bảo tốc độ tải trang (LCP, CLS, FID) tối ưu nhất. |
| **`react-component-performance`** | Khi phát hiện một component bị re-render liên tục hoặc giật lag khi cuộn (ví dụ: các bảng danh sách lịch đặt xe lớn). |
| **`performance-profiling`** | Khi cần đo lường chuyên sâu và phân tích điểm nghẽn bộ nhớ/CPU của trình duyệt. |

---

## ♿ 4. Trải Nghiệm Khả Dụng & Đa Thiết Bị (Mobile & Accessibility)
Sử dụng để đảm bảo ứng dụng chạy hoàn hảo trên điện thoại di động và thân thiện với mọi đối tượng người dùng.

| Tên Skill | Khi nào nên gọi / Ứng dụng cụ thể cho AutoWash Pro |
| :--- | :--- |
| **`mobile-design`** | Khi tối ưu giao diện trên thiết bị di động (Touch-First, vùng bấm ngón tay thoải mái, bottom sheet, responsive mobile layouts). |
| **`fixing-accessibility`** | Kiểm tra và bổ sung ARIA labels, quản lý tiêu điểm bàn phím (focus ring), độ tương phản màu sắc cho các form đặt lịch. |
| **`wcag-audit-patterns`** | Kiểm toán toàn bộ trang web theo tiêu chuẩn quốc tế WCAG 2.2. |

---

## 📋 5. Lên Kế Hoạch & Làm Rõ Đặc Tả (Planning & Strategy)
Sử dụng trước khi bắt đầu một tính năng lớn hoặc một bước đột phá giao diện mới để tránh "làm sai hướng".

| Tên Skill | Khi nào nên gọi / Ứng dụng cụ thể cho AutoWash Pro |
| :--- | :--- |
| **`writing-plans`** / **`planning-with-files`** | Khi nhận yêu cầu phức tạp (như thiết kế lại Full Supercar Showroom 3D), giúp Agent lập kế hoạch mạch lạc và lưu trữ vào file markdown. |
| **`ask-questions-if-underspecified`** | Yêu cầu Agent đặt câu hỏi làm rõ nếu yêu cầu của bạn có điểm mơ hồ trước khi code. |
| **`executing-plans`** | Kiểm soát Agent thực thi chính xác từng bước theo kế hoạch đã được phê duyệt. |

---

## 🛡️ 6. Kiểm Thử Tự Động Giao Diện (E2E & UI Testing)
Sử dụng sau khi làm xong UI để đảm bảo không tạo ra lỗi regressions ảnh hưởng đến luồng đặt lịch hay thanh toán.

| Tên Skill | Khi nào nên gọi / Ứng dụng cụ thể cho AutoWash Pro |
| :--- | :--- |
| **`e2e-testing`** / **`playwright-skill`** | Viết kịch bản kiểm thử tự động Playwright (`tests/e2e/`) cho các luồng quan trọng: Đăng nhập -> Đặt lịch rửa xe -> Kiểm tra trạng thái. |
| **`e2e-testing-patterns`** | Áp dụng các mẫu viết test tin cậy, không bị lỗi flaky rình rập. |

---

## 🔍 7. Kiểm Toán Code & Triệt Tiêu Lỗi (Code Review & Debugging)
Sử dụng khi code xong một tính năng hoặc gặp lỗi khó hiểu cần xử lý triệt để.

| Tên Skill | Khi nào nên gọi / Ứng dụng cụ thể cho AutoWash Pro |
| :--- | :--- |
| **`ui-review`** | Kích hoạt để Agent tự đóng vai chuyên gia thẩm định lại UI vừa code xem đã chuẩn khoảng cách, responsive và thiết kế chưa. |
| **`vibe-code-auditor`** | Quét nhanh code vừa sinh ra để phát hiện các đoạn code giòn (fragile), hardcode hay tiềm ẩn lỗi production. |
| **`clean-code`** / **`simplify-code`** | Tái cấu trúc, dọn dẹp các đoạn code dài dòng trở nên xúc tích và dễ đọc. |
| **`systematic-debugging`** / **`debugger`** | Khi gặp lỗi runtime hoặc build lỗi, áp dụng phương pháp điều tra gốc rễ (Root Cause Analysis) một cách khoa học. |

---

## 💡 Quy Trình Mẫu Khi Bạn Quay Lại Nâng Cấp UI AutoWash Pro

Khi bạn chuẩn bị bắt tay vào việc nâng cấp phần **Full Supercar Showroom 3D** hoặc bất kỳ màn hình nào tiếp theo, hãy dùng câu lệnh kích hoạt kết hợp như sau để Agent phục vụ đúng ý đồ:

> *"Hãy kích hoạt skill **`high-end-visual-design`** và **`frontend-dev-guidelines`** để thiết kế và code cho tôi component FullSupercarModel đảm bảo chuẩn 60 FPS và phong cách sang trọng nhất."*

hoặc sau khi code xong:

> *"Hãy dùng skill **`ui-review`** và **`vibe-code-auditor`** kiểm tra lại toàn bộ trang tôi vừa sửa xem có lỗi thẩm mỹ hay hiệu năng nào không."*
