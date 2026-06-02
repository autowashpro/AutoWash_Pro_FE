"use client"

import { useState } from "react"
import { Gift, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { REWARDS, TIER_META, formatVND } from "@/lib/data"
import { TierBadge } from "@/components/status-badge"

const CURRENT_POINTS = 2450
const CURRENT_TIER = "GOLD"

const CATEGORIES = ["Tất cả", "Rửa xe", "Chăm sóc", "Bảo vệ"] as const

export default function RedeemRewardsPage() {
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>("Tất cả")

  const filteredRewards =
    selectedCategory === "Tất cả"
      ? REWARDS
      : REWARDS.filter((r) => r.category === selectedCategory)

  const canRedeem = (reward: typeof REWARDS[0]): boolean => {
    const tierOrder = { MEMBER: 0, SILVER: 1, GOLD: 2, PLATINUM: 3 }
    const currentTierOrder = tierOrder[CURRENT_TIER as keyof typeof tierOrder]
    const requiredTierOrder = tierOrder[reward.minTier as keyof typeof tierOrder]
    return CURRENT_POINTS >= reward.pointsCost && currentTierOrder >= requiredTierOrder
  }

  const getDisabledReason = (reward: typeof REWARDS[0]): string => {
    if (CURRENT_POINTS < reward.pointsCost) {
      return `Không đủ ${reward.pointsCost - CURRENT_POINTS} điểm`
    }
    const tierOrder = { MEMBER: 0, SILVER: 1, GOLD: 2, PLATINUM: 3 }
    const currentTierOrder = tierOrder[CURRENT_TIER as keyof typeof tierOrder]
    const requiredTierOrder = tierOrder[reward.minTier as keyof typeof tierOrder]
    if (currentTierOrder < requiredTierOrder) {
      return `Cần hạng ${TIER_META[reward.minTier].label}`
    }
    return "Không thể đổi"
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Đổi điểm lấy Voucher</h1>
        <p className="text-sm text-muted-foreground">
          Chọn voucher yêu thích và đổi bằng điểm thưởng của bạn.
        </p>
      </div>

      {/* Current points */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Điểm hiện có
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-primary">{CURRENT_POINTS}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Hạng hiện tại
          </p>
          <div className="mt-1">
            <TierBadge tier={CURRENT_TIER} />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Danh mục</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reward cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredRewards.map((reward) => {
          const canUse = canRedeem(reward)
          return (
            <div
              key={reward.id}
              className={`flex flex-col rounded-2xl border transition-all ${
                canUse
                  ? "border-border bg-card hover:border-primary/30"
                  : "border-border/50 bg-card/50 opacity-75"
              }`}
            >
              <div className="flex items-start justify-between border-b border-border/50 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Gift className="size-5" />
                </div>
                {reward.category === "Rửa xe" && (
                  <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    WASH
                  </span>
                )}
                {reward.category === "Chăm sóc" && (
                  <span className="rounded bg-flex/10 px-2 py-1 text-xs font-semibold text-flex">
                    FLEX
                  </span>
                )}
                {reward.category === "Bảo vệ" && (
                  <span className="rounded bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                    PRO
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2 p-4">
                <h3 className="font-semibold text-foreground">{reward.title}</h3>
                <p className="text-xs text-muted-foreground">{reward.description}</p>

                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="font-mono text-sm font-bold text-primary">{reward.pointsCost} điểm</p>
                </div>

                {reward.minTier !== "MEMBER" && (
                  <p className="text-xs text-muted-foreground">
                    Tối thiểu: <span className="font-medium">{TIER_META[reward.minTier].label}+</span>
                  </p>
                )}
              </div>

              <div className="border-t border-border/50 p-4">
                {canUse ? (
                  <Button size="sm" className="w-full">
                    <Check className="mr-1 size-4" />
                    Đổi ngay
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled className="w-full cursor-not-allowed">
                    {getDisabledReason(reward)}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredRewards.length === 0 && (
        <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
          <Gift className="mx-auto size-8 text-muted-foreground opacity-50" />
          <p className="mt-3 text-sm text-muted-foreground">Không có voucher trong danh mục này.</p>
        </div>
      )}
    </div>
  )
}
