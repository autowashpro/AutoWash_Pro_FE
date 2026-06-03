# Hướng Dẫn Sử Dụng Advanced Components

Dưới đây là cách sử dụng 4 components nâng cao mà tôi đã tạo sẵn cho bạn.

## 1. Skeleton Loading Component

### File: `components/ui/skeleton.tsx`

**Các loại sử dụng:**

```tsx
import { Skeleton, SkeletonCard, SkeletonTable } from '@/components/ui/skeleton'

// Skeleton đơn giản
<Skeleton width="100%" height="20px" variant="text" />

// Multiple skeletons
<Skeleton width="100%" height="16px" variant="text" count={3} />

// Skeleton Card (phù hợp cho card loading)
<SkeletonCard />

// Skeleton Table (phù hợp cho table loading)
<SkeletonTable rows={5} />

// Circular skeleton (cho avatar)
<Skeleton width="40px" height="40px" variant="circular" />

// Rounded skeleton
<Skeleton width="100%" height="100px" variant="rounded" />
```

### Ví dụ thực tế:

```tsx
"use client"
import { useState, useEffect } from 'react'
import { SkeletonTable } from '@/components/ui/skeleton'

export function DataTablePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])

  useEffect(() => {
    // Giả lập fetch data
    setTimeout(() => {
      setData([...]) // set real data
      setIsLoading(false)
    }, 2000)
  }, [])

  return (
    <div>
      {isLoading ? <SkeletonTable rows={8} /> : <YourTable data={data} />}
    </div>
  )
}
```

---

## 2. Toast Notification Component

### File: `components/ui/toast.tsx`

**Setup trong layout.tsx:**

```tsx
import { ToastProvider } from '@/components/ui/toast'

export default function RootLayout() {
  return (
    <html>
      <body>
        <ToastProvider>
          {/* Your app content */}
        </ToastProvider>
      </body>
    </html>
  )
}
```

**Sử dụng trong components:**

```tsx
"use client"
import { useToast } from '@/components/ui/toast'

export function MyComponent() {
  const toast = useToast()

  const handleSuccess = () => {
    toast.success('Thành công!', 'Dữ liệu đã được lưu')
  }

  const handleError = () => {
    toast.error('Lỗi!', 'Có lỗi xảy ra, vui lòng thử lại')
  }

  const handleInfo = () => {
    toast.info('Thông tin', 'Đây là thông báo thông tin')
  }

  return (
    <div className="space-y-4">
      <button onClick={handleSuccess}>Success Toast</button>
      <button onClick={handleError}>Error Toast</button>
      <button onClick={handleInfo}>Info Toast</button>
    </div>
  )
}
```

### Variants:
- `toast.success(title, description?)` - Xanh
- `toast.error(title, description?)` - Đỏ
- `toast.info(title, description?)` - Xanh dương
- `toast.message(title, description?)` - Mặc định

---

## 3. Page Header Component

### File: `components/shared/page-header.tsx`

**Sử dụng cơ bản:**

```tsx
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function AdminPage() {
  return (
    <div>
      <PageHeader
        title="Quản lý Người Dùng"
        description="Xem và quản lý danh sách tất cả người dùng trong hệ thống"
        action={
          <Button>
            <Plus className="size-4" />
            Thêm Người Dùng
          </Button>
        }
      />
      {/* Your page content */}
    </div>
  )
}
```

**Với tabs:**

```tsx
import { PageHeader, PageHeaderTabs } from '@/components/shared/page-header'
import { Users, Settings, FileText } from 'lucide-react'
import { useState } from 'react'

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('users')

  const tabs = [
    { label: 'Người dùng', value: 'users', icon: <Users /> },
    { label: 'Cài đặt', value: 'settings', icon: <Settings /> },
    { label: 'Báo cáo', value: 'reports', icon: <FileText /> },
  ]

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Quản lý toàn bộ hệ thống"
      >
        <PageHeaderTabs
          tabs={tabs}
          value={activeTab}
          onChange={setActiveTab}
        />
      </PageHeader>

      {activeTab === 'users' && <UsersContent />}
      {activeTab === 'settings' && <SettingsContent />}
      {activeTab === 'reports' && <ReportsContent />}
    </div>
  )
}
```

---

## 4. Loading Overlay Component

### File: `components/shared/loading-overlay.tsx`

**Sử dụng:**

```tsx
import { LoadingOverlay, LoadingSpinner } from '@/components/shared/loading-overlay'
import { useState } from 'react'

export function MyComponent() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    await saveToDB()
    setIsLoading(false)
  }

  return (
    <div>
      {/* Full screen loading overlay */}
      <LoadingOverlay
        isOpen={isLoading}
        message="Đang lưu dữ liệu..."
        fullScreen={true}
      />

      {/* Inline loading spinner */}
      {isLoading && <LoadingSpinner />}

      <button onClick={handleSave}>Lưu</button>
    </div>
  )
}
```

### Variants:
- `<LoadingOverlay fullScreen={true} />` - Full screen
- `<LoadingOverlay fullScreen={false} />` - Relative to parent
- `<LoadingSpinner />` - Chỉ icon spinner

---

## 5. Empty State Component

### File: `components/shared/empty-state.tsx`

**Sử dụng:**

```tsx
import { EmptyState } from '@/components/shared/empty-state'
import { InboxIcon } from 'lucide-react'

export function DataPage() {
  const [data, setData] = useState([])

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<InboxIcon />}
        title="Không có dữ liệu"
        description="Bạn chưa tạo bất kỳ mục nào. Hãy bắt đầu bằng cách thêm mục đầu tiên."
        action={{
          label: "Thêm Mục",
          onClick: () => handleCreate()
        }}
      />
    )
  }

  return <YourDataTable data={data} />
}
```

---

## CHECKLIST TRƯỚC KHI PULL VỀ

- [ ] Tất cả 4 components đã được tạo
- [ ] Skeleton hỗ trợ: text, circular, rectangular, rounded
- [ ] Toast Provider được wrap tại root layout
- [ ] PageHeader có thể dùng với/không tabs
- [ ] LoadingOverlay hỗ trợ fullScreen và relative
- [ ] EmptyState có action button

---

## INTEGRATION GUIDE

### Bước 1: Pull toàn bộ project

```bash
git clone your-project-url
cd your-project
pnpm install
```

### Bước 2: Thêm ToastProvider vào layout.tsx

```tsx
import { ToastProvider } from '@/components/ui/toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
```

### Bước 3: Bắt đầu sử dụng components

Tất cả components đã sẵn sàng để import và sử dụng ngay!

---

## TIPS & TRICKS

1. **Skeleton + Toast = Tốt**: Dùng skeleton khi loading, toast khi success/error
2. **PageHeader + Tabs = Professional**: Tạo multi-tab pages dễ dàng
3. **LoadingOverlay + Async**: Bọc async operations với loading state
4. **EmptyState + Data**: Luôn có fallback UI khi không có data
5. **Combine**: Mix & match các components để tạo UX tốt nhất

---

Bây giờ bạn đã sẵn sàng để pull project và tiếp tục phát triển!
