# Original User Request

## Initial Request — 2026-07-15T12:32:33Z

# Teamwork Project Prompt

Dự án tối ưu hóa hiệu năng toàn diện cho Frontend Next.js 16 (`AutoWash_Pro_FE`), giải quyết triệt để tình trạng tải chậm khi chạy `run dev`, chuyển trang (routing) và tương tác UI/tính năng bằng cách áp dụng Turbopack, cấu hình phân giải module tối ưu và Lazy Loading các thành phần đồ họa nặng.

Working directory: d:/SEMESTER-IN-FPT/SUMMER26/SWP/AutoWash_Pro_FE
Integrity mode: development

## Requirements

### R1. Kích hoạt Turbopack & Tối ưu Cấu hình Next.js (`package.json`, `next.config.mjs`)
- Cập nhật script `"dev": "next dev --turbo"` trong `package.json` để tăng tốc khởi động server và Hot Module Replacement (HMR).
- Bổ sung `optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', '@radix-ui/react-icons']` vào `next.config.mjs` nhằm ngăn chặn Webpack/Turbopack phải bundle toàn bộ thư viện icon lớn khi chỉ sử dụng một vài component.

### R2. Tối ưu Dynamic Import & Code Splitting cho 3D Canvas và Charts
- Chuyển đổi import tĩnh của các component nặng như `HeroCinematicStoryboard`, `Cinematic3DCanvas` (`@react-three/fiber`, `three`), và các biểu đồ `recharts` sang `next/dynamic` với thiết lập `ssr: false`.
- Việc này giúp giảm dung lượng bundle tải ban đầu (Initial JavaScript Payload), tránh block luồng chính (Main Thread) và tăng tốc độ Client-side Hydration.

## Acceptance Criteria

### Performance & Build Quality
- [ ] Lệnh `npm run dev` sử dụng Turbopack khởi động nhanh chóng (dưới 5 giây).
- [ ] Chuyển trang (Client-side Navigation) và tương tác trên các portal diễn ra tức thì, không bị khựng hoặc treo do tải module nặng.
- [ ] Lệnh kiểm chứng `npm run build` hoàn tất thành công 100% với `0 errors`, `0 typecheck errors`, đảm bảo không làm gãy hoặc vỡ bất kỳ giao diện/tính năng nào hiện có của hệ thống.
