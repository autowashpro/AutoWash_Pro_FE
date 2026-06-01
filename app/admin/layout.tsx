import type { ReactNode } from "react"
import { BarChart3, Users, Wrench } from "lucide-react"
import { PortalShell, type NavItem } from "@/components/portal-shell"

const NAV: NavItem[] = [
  { label: "Báo cáo", href: "/admin", icon: BarChart3 },
  { label: "Người dùng", href: "/admin/nguoi-dung", icon: Users },
  { label: "Dịch vụ", href: "/admin/dich-vu", icon: Wrench },
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
