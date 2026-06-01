import type { ReactNode } from "react"
import { CalendarPlus, LayoutDashboard, Car, Gift } from "lucide-react"
import { PortalShell, type NavItem } from "@/components/portal-shell"

const NAV: NavItem[] = [
  { label: "Tổng quan", href: "/customer", icon: LayoutDashboard },
  { label: "Đặt lịch", href: "/customer/dat-lich", icon: CalendarPlus },
  { label: "Phương tiện", href: "/customer/phuong-tien", icon: Car },
  { label: "Điểm thưởng", href: "/customer/diem-thuong", icon: Gift },
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
