import { test, expect } from '@playwright/test';

const WASHER_EMAIL = process.env.PLAYWRIGHT_WASHER_EMAIL || 'washer1@autowashpro.com';
const WASHER_PASSWORD = process.env.PLAYWRIGHT_WASHER_PASSWORD || 'Admin@123';

test.describe('Washer Portal Flow (TASKS_VU)', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Truy cập cổng đăng nhập nhân viên
    await page.goto('/auth/internal');
    
    // 2. Nhập thông tin tài khoản Washer
    await page.fill('input[id="email"]', WASHER_EMAIL);
    await page.fill('input[id="password"]', WASHER_PASSWORD);
    
    // 3. Thực hiện đăng nhập
    await page.click('button[type="submit"]');
    
    // 4. Xác nhận chuyển hướng thành công đến trang của Washer
    await page.waitForURL('**/washer');
  });

  test('W-01: Kiểm tra Danh sách task hôm nay', async ({ page }) => {
    await expect(page).toHaveURL(/.*washer/);
    
    // Kiểm tra lời chào mừng và tên thợ rửa xe
    await expect(page.locator('body')).toContainText('Chào mừng quay trở lại', { ignoreCase: true });
    
    // Kiểm tra tiêu đề danh sách công việc
    await expect(page.locator('body')).toContainText('Công việc hôm nay', { ignoreCase: true });
    
    // Kiểm tra các thống kê stats cơ bản
    await expect(page.locator('body')).toContainText('Đang xử lý', { ignoreCase: true });
  });

  test('W-02: Kiểm tra trang Chi tiết task', async ({ page }) => {
    // Truy cập chi tiết task thử nghiệm
    await page.goto('/washer/1');
    
    // Đảm bảo trang tải thành công layout thợ rửa xe
    await expect(page.locator('body')).toContainText('Cổng thợ rửa xe', { ignoreCase: true });
  });

  test('W-03: Kiểm tra trang Form biên bản kiểm tra xe', async ({ page }) => {
    await page.goto('/washer/1/kiem-tra');
    
    // Đảm bảo trang tải thành công layout thợ rửa xe
    await expect(page.locator('body')).toContainText('Cổng thợ rửa xe', { ignoreCase: true });
  });
});
