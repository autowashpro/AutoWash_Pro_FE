import type { ReactNode } from "react"
import { PortalShell, type NavItem } from "@/components/portal-shell"

const NAV: NavItem[] = [
  { label: "Tổng quan", href: "/manager", icon: "dashboard" },
  { label: "Phân công", href: "/manager/phan-cong", icon: "users" },
  { label: "Nhân viên", href: "/manager/nhan-vien", icon: "spray" },
  { label: "Khách vãng lai", href: "/manager/khach-vang-lai", icon: "walkin" },
  { label: "Quản lý Slot", href: "/manager/quan-ly-slot", icon: "clipboard" },
  { label: "Báo cáo", href: "/manager/bao-cao", icon: "chart" },
  { label: "Khiếu nại", href: "/manager/khieu-nai", icon: "message" },
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
