import type { ReactNode } from "react"
import { PortalShell, type NavItem } from "@/components/portal-shell"

const NAV: NavItem[] = [
  { label: "Tổng quan", href: "/manager", icon: "dashboard" },
  { label: "Quản lý slot", href: "/manager/quan-ly-slot", icon: "calendar" },
  { label: "Khách vãng lai", href: "/manager/khach-vang-lai", icon: "walkin" },
  { label: "Nhân viên", href: "/manager/nhan-vien", icon: "spray" },
  { label: "Khách hàng", href: "/manager/khach-hang", icon: "car" },
  { label: "Khiếu nại", href: "/manager/khieu-nai", icon: "message" },
  { label: "Báo cáo", href: "/manager/bao-cao", icon: "chart" },
]

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell
      roleName="Cổng quản lý"
      nav={NAV}
      userName="Trương Mỹ Linh"
      userMeta="Quản lý chi nhánh"
    >
      {children}
    </PortalShell>
  )
}
