import type { ReactNode } from "react"
import { PortalShell, type NavItem } from "@/components/portal-shell"

const NAV: NavItem[] = [
  { label: "Tổng quan", href: "/customer", icon: "dashboard" },
  { label: "Đặt lịch", href: "/customer/dat-lich", icon: "calendar" },
  { label: "Phương tiện", href: "/customer/phuong-tien", icon: "car" },
  { label: "Điểm thưởng", href: "/customer/diem-thuong", icon: "gift" },
]

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell
      roleName="Cổng khách hàng"
      nav={NAV}
      userName="Nguyễn Minh Anh"
      userMeta="Hạng Vàng · 412 điểm"
    >
      {children}
    </PortalShell>
  )
}
