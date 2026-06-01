import type { ReactNode } from "react"
import { PortalShell, type NavItem } from "@/components/portal-shell"

const NAV: NavItem[] = [
  { label: "Tổng quan", href: "/manager", icon: "dashboard" },
  { label: "Phân công", href: "/manager/phan-cong", icon: "users" },
  { label: "Khách vãng lai", href: "/manager/khach-vang-lai", icon: "walkin" },
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
