import type { ReactNode } from "react"
import { PortalShell, type NavItem } from "@/components/portal-shell"

const NAV: NavItem[] = [
  { label: "Báo cáo", href: "/admin", icon: "chart" },
  { label: "Người dùng", href: "/admin/quan-ly-nguoi-dung", icon: "users" },
  { label: "Dịch vụ", href: "/admin/dich-vu", icon: "wrench" },
  { label: "Cấu hình điểm", href: "/admin/cau-hinh-diem", icon: "settings" },
  { label: "Cấu hình Tier", href: "/admin/cau-hinh-tier", icon: "settings" },
  { label: "Phần thưởng", href: "/admin/phan-thuong", icon: "gift" },
  { label: "Nhật ký", href: "/admin/nhat-ky-hoat-dong", icon: "clipboard" },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell
      roleName="Cổng quản trị"
      nav={NAV}
      userName="Bùi Anh Tuấn"
      userMeta="Quản trị viên hệ thống"
    >
      {children}
    </PortalShell>
  )
}
