import type { ReactNode } from "react"
import { PortalShell, type NavItem } from "@/components/portal-shell"

const NAV: NavItem[] = [
  { label: "Công việc", href: "/washer", icon: "clipboard" },
  { label: "Báo cáo kiểm tra", href: "/washer/bao-cao", icon: "camera" },
]

export default function WasherLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell
      roleName="Cổng thợ rửa xe"
      nav={NAV}
      userName="Trần Văn Hùng"
      userMeta="Điểm tín nhiệm 98"
    >
      {children}
    </PortalShell>
  )
}
