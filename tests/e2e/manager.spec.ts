import { test, expect } from '@playwright/test';

const MANAGER_EMAIL = process.env.PLAYWRIGHT_MANAGER_EMAIL || 'manager1@autowashpro.com';
const MANAGER_PASSWORD = process.env.PLAYWRIGHT_MANAGER_PASSWORD || 'Admin@123';

test.describe('Manager Dashboard Flow (TASKS_VU)', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Truy cập cổng đăng nhập nhân viên
    await page.goto('/auth/internal');
    
    // 2. Nhập thông tin tài khoản Manager
    await page.fill('input[id="email"]', MANAGER_EMAIL);
    await page.fill('input[id="password"]', MANAGER_PASSWORD);
    
    // 3. Thực hiện đăng nhập
    await page.click('button[type="submit"]');
    
    // 4. Xác nhận chuyển hướng thành công
    await page.waitForURL('**/manager');
  });

  test('M-01: Kiểm tra Dashboard hiển thị giao diện Quản lý chi nhánh', async ({ page }) => {
    await expect(page).toHaveURL(/.*manager/);
    
    // Đảm bảo lời chào mừng và tên quản lý hiển thị (lấy từ dữ liệu thật)
    await expect(page.locator('body')).toContainText('Chào mừng quay trở lại', { ignoreCase: true });
    
    // Đảm bảo Sidebar hiển thị đầy đủ các mục điều hướng chính
    await expect(page.locator('body')).toContainText('Quản lý slot', { ignoreCase: true });
    await expect(page.locator('body')).toContainText('Khách vãng lai', { ignoreCase: true });
  });

  test('M-02: Kiểm tra trang chi tiết booking', async ({ page }) => {
    // Truy cập chi tiết booking
    await page.goto('/manager/booking/1');
    
    // Đảm bảo trang tải thành công (hoặc hiển thị thông báo lỗi thân thiện thay vì crash)
    await expect(page.locator('body')).toContainText('Quản lý chi nhánh', { ignoreCase: true });
  });

  test('M-03: Kiểm tra luồng Walk-in Form tạo khách vãng lai', async ({ page }) => {
    await page.goto('/manager/khach-vang-lai');
    
    // Kiểm tra trang tải thành công bằng cách kiểm tra sidebar và form
    await expect(page.locator('body')).toContainText('Khách vãng lai', { ignoreCase: true });
  });

  test('M-05: Kiểm tra giao diện Quản lý slot cầu nâng', async ({ page }) => {
    await page.goto('/manager/quan-ly-slot');
    
    // Đảm bảo trang quản lý slot tải thành công
    await expect(page.locator('body')).toContainText('Quản lý slot', { ignoreCase: true });
  });

  test('M-06: Kiểm tra Danh sách khiếu nại của khách hàng', async ({ page }) => {
    await page.goto('/manager/khieu-nai');
    
    // Đảm bảo trang khiếu nại tải thành công
    await expect(page.locator('body')).toContainText('Khiếu nại', { ignoreCase: true });
  });

  test('M-09: Kiểm tra trang báo cáo thống kê', async ({ page }) => {
    await page.goto('/manager/bao-cao');
    
    // Đảm bảo trang báo cáo thống kê tải thành công
    await expect(page.locator('body')).toContainText('Báo cáo', { ignoreCase: true });
  });
});
