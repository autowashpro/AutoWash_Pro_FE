"use client"

import { Star, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LOYALTY_ACTIVITIES, TIER_META, formatDate, formatVND } from "@/lib/data"
import { TierBadge } from "@/components/status-badge"

const CURRENT_TIER = "GOLD"
const CURRENT_POINTS = 2450
const TOTAL_SPENDING = 4500000
const ACTIVE_VOUCHERS = 3
const NEXT_TIER = "PLATINUM"
const NEXT_TIER_POINTS = 4000
const POINTS_NEEDED = NEXT_TIER_POINTS - CURRENT_POINTS

export default function LoyaltyDashboard() {
  const tiers: Array<"MEMBER" | "SILVER" | "GOLD" | "PLATINUM"> = [
    "MEMBER",
    "SILVER",
    "GOLD",
    "PLATINUM",
  ]
  const tierOrder = tiers.indexOf(CURRENT_TIER as any)
  const progress = Math.min(100, Math.round((CURRENT_POINTS / NEXT_TIER_POINTS) * 100))

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Điểm thưởng thành viên</h1>
        <p className="text-sm text-muted-foreground">
          Tích điểm sau mỗi lần rửa xe và đổi lấy ưu đãi hấp dẫn.
        </p>
      </div>

      {/* --- Bento grid --- */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Large: Current tier + points */}
        <div className="sm:col-span-1">
          <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Hạng hiện tại
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <TierBadge tier={CURRENT_TIER} />
                </div>
              </div>
              <Star className="size-5 fill-gold text-gold" />
            </div>
            <div className="mt-6 flex-1 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Điểm hiện có
              </p>
              <p className="font-mono text-3xl font-bold text-foreground">{CURRENT_POINTS}</p>
              <p className="text-xs text-muted-foreground">điểm</p>
            </div>
            <div className="mt-auto pt-4">
              <p className="text-xs text-muted-foreground">
                Ưu đãi: Giảm {TIER_META[CURRENT_TIER].discount}% mỗi đơn
              </p>
            </div>
          </div>
        </div>

        {/* Tall: Progress to next tier */}
        <div className="sm:col-span-2">
          <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tiến độ lên hạng
            </p>
            <div className="mt-4 flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{CURRENT_TIER}</span>
                  <span className="font-medium text-foreground">{NEXT_TIER}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-gold transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{CURRENT_POINTS} điểm</span>
                  <span className="text-xs text-muted-foreground">{NEXT_TIER_POINTS} điểm</span>
                </div>
              </div>
              <div className="rounded-lg bg-accent/50 p-3">
                <p className="text-sm font-semibold text-foreground">
                  Cần thêm{" "}
                  <span className="font-mono text-primary">{POINTS_NEEDED}</span> điểm để lên hạng{" "}
                  <span className="font-semibold">{NEXT_TIER}</span>
                </p>
              </div>
            </div>
            <div className="mt-auto pt-2">
              <Link href="/customer/dich-vu">
                <Button size="sm" variant="outline" className="w-full">
                  Đặt lịch để tích điểm
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Small: Vouchers */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Voucher đang có
          </p>
          <p className="mt-3 font-mono text-3xl font-bold text-primary">{ACTIVE_VOUCHERS}</p>
          <p className="mt-1 text-xs text-muted-foreground">voucher còn sử dụng được</p>
          <Link href="/customer/voucher">
            <Button size="sm" variant="outline" className="mt-4 w-full">
              Xem voucher
            </Button>
          </Link>
        </div>

        {/* Small: Total spending */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tổng chi tiêu
          </p>
          <p className="mt-3 font-mono text-2xl font-bold text-foreground">
            {formatVND(TOTAL_SPENDING)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">từ khi tạo tài khoản</p>
        </div>
      </div>

      {/* --- Tier cards horizontal --- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Hạng thành viên</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {tiers.map((tier, idx) => {
            const isActive = tier === CURRENT_TIER
            const isReached = idx <= tierOrder
            const meta = TIER_META[tier]
            return (
              <div
                key={tier}
                className={`rounded-xl border-2 p-4 transition-all ${
                  isActive
                    ? "border-gold bg-gold/5"
                    : isReached
                      ? "border-border bg-card"
                      : "border-border bg-card opacity-60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star
                    className={`size-4 ${isActive || isReached ? "fill-gold text-gold" : "text-muted-foreground"}`}
                  />
                  <p className="text-xs font-semibold text-foreground">{meta.label}</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {meta.discount === 0 ? "Không có ưu đãi" : `Giảm ${meta.discount}%`}
                </p>
                {isActive && (
                  <p className="mt-2 text-xs font-semibold text-gold">Hạng hiện tại</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* --- Points history table --- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Lịch sử điểm</h2>
          <Link href="/customer/do-diem">
            <Button size="sm" variant="outline">
              Đổi điểm
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Ngày</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Mô tả</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Cộng</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Trừ</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Số dư</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {LOYALTY_ACTIVITIES.map((activity, idx) => {
                const isPositive = activity.points > 0
                const balance =
                  CURRENT_POINTS +
                  LOYALTY_ACTIVITIES.slice(0, idx)
                    .reverse()
                    .reduce((sum, a) => sum - a.points, 0)
                return (
                  <tr key={activity.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(activity.date)}
                    </td>
                    <td className="px-4 py-3 text-foreground">{activity.label}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {isPositive ? (
                        <span className="text-success font-semibold">
                          +{activity.points}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {!isPositive ? (
                        <span className="text-destructive font-semibold">
                          {activity.points}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                      {balance}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
