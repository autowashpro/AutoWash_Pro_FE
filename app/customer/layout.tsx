"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { PortalShell, type NavItem } from "@/components/portal-shell"
import { getMyProfile } from "@/lib/api"
import type { CustomerProfile } from "@/lib/types"
import { TIER_LABELS } from "@/lib/types"

const NAV: NavItem[] = [
  { label: "Tổng quan", href: "/customer", icon: "dashboard" },
  { label: "Đặt lịch", href: "/customer/dat-lich", icon: "calendar" },
  { label: "Phương tiện", href: "/customer/phuong-tien", icon: "car" },
  { label: "Điểm thưởng", href: "/customer/diem-thuong", icon: "gift" },
  { label: "Khiếu nại", href: "/customer/khieu-nai", icon: "message" },
  { label: "Hồ sơ cá nhân", href: "/customer/ho-so", icon: "users" },
]

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)

  useEffect(() => {
    async function loadProfile() {
      // TODO: connect API
      try {
        const data = await getMyProfile()
        setProfile(data)
      } catch (error) {
        console.warn("Failed to load customer profile in layout, using mock fallback:", error)
        setProfile({
          user_id: "u-1",
          full_name: "Nguyễn Minh Anh",
          email: "minhanh@email.com",
          phone: "0987654321",
          membership_tier: "GOLD",
          total_points: 412,
          trust_score: 95,
          total_spending_12m: 12500000,
          tier_review_at: "2026-12-31",
          booking_window_days: 7
        })
      }
    }
    loadProfile()
  }, [])

  const userName = profile?.full_name || "Khách hàng"
  const tierLabel = profile ? TIER_LABELS[profile.membership_tier] || profile.membership_tier : "Thành viên"
  const userMeta = profile 
    ? `Hạng ${tierLabel} · ${profile.total_points} điểm`
    : "Đang tải thông tin..."

  return (
    <PortalShell
      roleName="Cổng khách hàng"
      nav={NAV}
      userName={userName}
      userMeta={userMeta}
    >
      {children}
    </PortalShell>
  )
}
