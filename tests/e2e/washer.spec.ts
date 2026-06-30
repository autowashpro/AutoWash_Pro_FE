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
    await expect(page.locator('body')).toContainText('Chào mừng quay trở lại', { ignoreCase: true });
    await expect(page.locator('body')).toContainText('Công việc hôm nay', { ignoreCase: true });
    await expect(page.locator('body')).toContainText('Đang xử lý', { ignoreCase: true });
  });

  test('W-02: Kiểm tra trang Chi tiết task và nhận việc', async ({ page }) => {
    // Click xem chi tiết task đầu tiên (nếu có)
    const taskLink = page.locator('text=Xem chi tiết →').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/washer\/[a-zA-Z0-9-]+/);
      
      await expect(page.locator('body')).toContainText('Chi tiết công việc', { ignoreCase: true });
      
      // Click "Xác nhận khách đến" nếu có
      const checkInBtn = page.locator('button:has-text("Xác nhận khách đến")');
      if (await checkInBtn.isVisible() && !(await checkInBtn.isDisabled())) {
        await checkInBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('W-03: Kiểm tra luồng kiểm tra xe (Car Inspection)', async ({ page }) => {
    // Truy cập thẳng trang kiểm tra xe của booking ID b-1
    await page.goto('/washer/b-1/kiem-tra');
    await expect(page.locator('body')).toContainText('Biên bản kiểm tra xe', { ignoreCase: true });
    
    // Step 0: Checklist ghi nhận hư hỏng
    const scratchCheckbox = page.locator('input[type="checkbox"]').first();
    await scratchCheckbox.waitFor({ state: 'visible' });
    await scratchCheckbox.check();
    // Nhập ghi chú ngoại thất/nội thất
    await page.fill('textarea[placeholder*="gương chiếu hậu"]', 'Vết trầy nhẹ gương phải');
    await page.fill('textarea[placeholder*="nhiều cát"]', 'Sạch sẽ bình thường');
    // Chọn mức nhiên liệu & ODO
    const fuelSelect = page.locator('select').first();
    await fuelSelect.selectOption('1/2');
    await page.fill('input[placeholder*="45.230"]', '12500');
    // Nhấn tiếp tục chụp ảnh
    await page.click('button:has-text("Chụp ảnh xe")');
    await page.waitForTimeout(500);

    // Step 1: Chụp ảnh xe (đảm bảo hiển thị giao diện tải ảnh góc)
    await expect(page.locator('body')).toContainText('Ảnh kiểm tra xe', { ignoreCase: true });
    
    // Ở môi trường E2E mock, ta có thể tải ảnh lên
    const fileChooserInput = page.locator('input[type="file"]').first();
    if (await fileChooserInput.isVisible()) {
      try {
        await fileChooserInput.setInputFiles({
          name: 'mock_car.png',
          mimeType: 'image/png',
          buffer: Buffer.from('fake-image-content')
        });
      } catch (err) {
        console.warn('Set input files failed:', err);
      }
    }

    // Nhấn tiếp tục gửi biên bản
    const nextBtn = page.locator('button:has-text("Gửi biên bản")');
    if (await nextBtn.isVisible() && !(await nextBtn.isDisabled())) {
      await nextBtn.click();
      await page.waitForTimeout(500);
      
      // Step 2: Xác nhận và ký nhận
      const confirmCheckbox = page.locator('input[type="checkbox"]').last();
      await confirmCheckbox.check();
      
      const submitBtn = page.locator('button:has-text("Xác nhận"), button:has-text("Gửi biên bản")').last();
      if (await submitBtn.isVisible() && !(await submitBtn.isDisabled())) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('body')).toContainText('Biên bản kiểm tra đã gửi', { ignoreCase: true });
      }
    }
  });

  test('W-04: Kiểm tra luồng thực hiện công việc (check các bước quy trình)', async ({ page }) => {
    // Truy cập trang executing của booking ID b-1
    await page.goto('/washer/executing?bookingId=b-1');
    await expect(page.locator('body')).toContainText('Đang thực hiện', { ignoreCase: true });
    
    // Click nút hoàn tất (nút này luôn enabled khi không còn checklist)
    const completeBtn = page.locator('button:has-text("Hoàn tất và kiểm tra lại xe")');
    await expect(completeBtn).toBeEnabled();
    await completeBtn.click({ force: true });
    await page.waitForURL('**/washer/completed**');
  });

  test('W-05: Kiểm tra luồng hoàn tất và bàn giao xe', async ({ page }) => {
    await page.goto('/washer/completed?bookingId=b-1');
    await expect(page.locator('body')).toContainText('Dịch vụ hoàn thành', { ignoreCase: true });
    
    // Nhập ghi chú
    await page.fill('textarea[id="notes"]', 'Xe đã rửa sạch bóng loáng, hút bụi kỹ càng.');
    
    // Tải ảnh hoàn thành (ít nhất 1 ảnh)
    const fileChooserInput = page.locator('input[type="file"]').first();
    if (await fileChooserInput.isVisible()) {
      try {
        await fileChooserInput.setInputFiles({
          name: 'done_car.png',
          mimeType: 'image/png',
          buffer: Buffer.from('fake-image-content-done')
        });
      } catch (err) {
        console.warn('Set input files for completion failed:', err);
      }
    }
    
    // Bàn giao xe
    const submitBtn = page.locator('button:has-text("Bàn giao xe")');
    if (await submitBtn.isVisible() && !(await submitBtn.isDisabled())) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/.*washer/);
    }
  });
});
