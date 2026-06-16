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

  test('M-01: Kiểm tra Dashboard hiển thị giao diện và các bộ lọc', async ({ page }) => {
    await expect(page).toHaveURL(/.*manager/);
    await expect(page.locator('body')).toContainText('Chào mừng quay trở lại', { ignoreCase: true });
    await expect(page.locator('body')).toContainText('Quản lý slot', { ignoreCase: true });
    
    // Kiểm tra tương tác bộ lọc
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
    await dateInput.fill('2026-06-12');
    
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('PENDING');
    
    const typeSelect = page.locator('select').nth(1);
    await typeSelect.selectOption('WASH');
  });

  test('M-02: Kiểm tra trang chi tiết booking và các hành động xử lý', async ({ page }) => {
    // Truy cập chi tiết booking (sử dụng ID 1 hoặc b-1)
    await page.goto('/manager/booking/b-1');
    await expect(page.locator('body')).toContainText('Quản lý chi nhánh', { ignoreCase: true });
    
    // Kiểm tra và click Xác nhận lịch hẹn (nếu có)
    const confirmBtn = page.locator('button:has-text("Xác nhận lịch hẹn"), button:has-text("Xác nhận")').first();
    if (await confirmBtn.isVisible() && !(await confirmBtn.isDisabled())) {
      await confirmBtn.click();
      await page.waitForTimeout(500); // Đợi toast hiển thị
    }
    
    // Kiểm tra và click Check-in (nếu có)
    const checkInBtn = page.locator('button:has-text("Check-in"), button:has-text("Xác nhận khách đến")').first();
    if (await checkInBtn.isVisible() && !(await checkInBtn.isDisabled())) {
      await checkInBtn.click();
      await page.waitForTimeout(500);
    }

    // Kiểm tra tạo thanh toán (nếu có)
    const paymentBtn = page.locator('button:has-text("Tạo thanh toán")').first();
    if (await paymentBtn.isVisible() && !(await paymentBtn.isDisabled())) {
      await paymentBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('M-03: Kiểm tra luồng Phân công thợ rửa xe', async ({ page }) => {
    // Trên Dashboard tìm nút Phân công của các booking PENDING/CONFIRMED
    const assignBtn = page.locator('button:has-text("Phân công")').first();
    if (await assignBtn.isVisible()) {
      await assignBtn.click();
      
      // Đợi modal phân công xuất hiện
      await expect(page.locator('body')).toContainText('nhân viên', { ignoreCase: true });
      
      // Chọn thợ đầu tiên rảnh
      const firstWasherCard = page.locator('button:has-text("Gán"), button:has-text("Chọn ✓")').first();
      if (await firstWasherCard.isVisible()) {
        await firstWasherCard.click();
        
        // Xác nhận phân công
        const confirmBtn = page.locator('button:has-text("Xác nhận phân công")');
        await confirmBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('M-04: Kiểm tra luồng tạo đặt lịch tại quầy (Walk-in Form)', async ({ page }) => {
    await page.goto('/manager/khach-vang-lai');
    await expect(page.locator('body')).toContainText('Tiếp nhận khách vãng lai', { ignoreCase: true });

    // Nhập số điện thoại khách hàng
    await page.fill('input[type="tel"]', '0901234567');
    await page.click('button:has-text("Tìm kiếm")');
    await page.waitForTimeout(500);

    // Điền thông tin khách mới (nếu form hiển thị)
    const nameInput = page.locator('input[placeholder="Họ tên"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('Khách Vãng Lai A');
      await page.fill('input[placeholder="Email"]', 'khach.vanglai@example.com');
    }

    // Điền thông tin xe
    await page.fill('input[placeholder*="Biển số"]', '51A-999.99');
    await page.selectOption('select', 'MEDIUM');
    await page.fill('input[placeholder="Hãng xe"]', 'Honda');
    await page.fill('input[placeholder="Model"]', 'Civic');
    await page.fill('input[placeholder="Màu"]', 'Trắng');

    // Chọn dịch vụ
    const serviceSelect = page.locator('select').nth(1);
    await serviceSelect.selectOption({ index: 1 }); // Chọn dịch vụ thứ 2 trong list
    await page.waitForTimeout(500);

    // Chọn khung giờ trống (nếu có các nút giờ hiển thị)
    const slotBtn = page.locator('button:has-text("08:"), button:has-text("09:"), button:has-text("10:")').first();
    if (await slotBtn.isVisible()) {
      await slotBtn.click();
    }

    // Chọn nhân viên thực hiện
    const washerSelect = page.locator('select').last();
    if (await washerSelect.isVisible()) {
      await washerSelect.selectOption({ index: 1 });
    }

    // Gửi form tạo đặt lịch
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible() && !(await submitBtn.isDisabled())) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText('Đã tạo phiếu dịch vụ Walk-in', { ignoreCase: true });
    }
  });

  test('M-05: Kiểm tra giao diện Quản lý slot và cập nhật cấu hình', async ({ page }) => {
    await page.goto('/manager/quan-ly-slot');
    await expect(page.locator('body')).toContainText('Quản lý slot', { ignoreCase: true });

    // Tăng/Giảm số nhân viên online
    const washerConfigBtn = page.locator('button:has-text("+"), button:has-text("-")').first();
    if (await washerConfigBtn.isVisible()) {
      await washerConfigBtn.click();
    }

    // Lưu cấu hình
    const saveBtn = page.locator('button:has-text("Lưu cấu hình")');
    await saveBtn.click();
    await page.waitForTimeout(500);
  });

  test('M-06: Kiểm tra xử lý khiếu nại của khách hàng', async ({ page }) => {
    await page.goto('/manager/khieu-nai');
    await expect(page.locator('body')).toContainText('Khiếu nại', { ignoreCase: true });

    // Click xem khiếu nại đầu tiên (nếu có)
    const viewDetailBtn = page.locator('text=Xem chi tiết, text=Xem →').first();
    if (await viewDetailBtn.isVisible()) {
      await viewDetailBtn.click();
      await page.waitForURL(/\/manager\/khieu-nai\/.+/);
      
      // Xử lý khiếu nại
      const noteArea = page.locator('textarea[id="response"]');
      if (await noteArea.isVisible()) {
        await noteArea.fill('Đã kiểm tra lại camera và xác nhận bồi thường cho khách hàng 100k.');
        await page.selectOption('select[id="conclusion"]', 'RESOLVED');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
        await expect(page.locator('body')).toContainText('Đã lưu kết quả', { ignoreCase: true });
      }
    }
  });
});
