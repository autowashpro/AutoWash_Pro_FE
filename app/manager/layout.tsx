import type { ReactNode } from "react"
import { LayoutDashboard, Users, UserPlus } from "lucide-react"
import { PortalShell, type NavItem } from "@/components/portal-shell"

const NAV: NavItem[] = [
  { label: "Tổng quan", href: "/manager", icon: LayoutDashboard },
  { label: "Phân công", href: "/manager/phan-cong", icon: Users },
  { label: "Khách vãng lai", href: "/manager/khach-vang-lai", icon: UserPlus },
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
