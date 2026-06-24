'use client'

import { useState, useEffect } from 'react'
import { Gift, Check, Loader2, Ticket, Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getRewardCatalog, redeemReward, getMyProfile } from '@/lib/api'
import type { Reward, MemberTier, RedeemRewardResponse } from '@/lib/types'
import { TIER_LABELS } from '@/lib/types'
import { TierBadge } from '@/components/status-badge'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { formatDate } from '@/lib/data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const TIER_ORDER: Record<string, number> = { MEMBER: 0, SILVER: 1, GOLD: 2, PLATINUM: 3 }

const REWARD_TYPE_LABELS: Record<string, string> = {
  DISCOUNT_AMOUNT:  'Giảm tiền',
  DISCOUNT_PERCENT: 'Giảm %',
  FREE_WASH:        'Rửa xe miễn phí',
  ADD_ON:           'Dịch vụ tặng thêm',
}

export default function RedeemRewardsPage() {
  const router = useRouter()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPoints, setCurrentPoints] = useState(0)
  const [currentTier, setCurrentTier] = useState<MemberTier>('MEMBER')
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null)
  const [redeemResult, setRedeemResult] = useState<RedeemRewardResponse | null>(null)
  const [copiedVoucher, setCopiedVoucher] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [catalog, profile] = await Promise.all([getRewardCatalog(), getMyProfile()])
        setRewards(catalog)
        setCurrentPoints(profile.total_points)
        setCurrentTier(profile.membership_tier)
      } catch {
        toast.error('Không tải được danh sách phần thưởng', {
          description: 'Vui lòng thử lại sau.',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categories = [
    'Tất cả',
    ...Array.from(new Set(rewards.map((r) => r.category).filter(Boolean) as string[])),
  ]

  const filteredRewards =
    selectedCategory === 'Tất cả'
      ? rewards
      : rewards.filter((r) => r.category === selectedCategory)

  const canRedeem = (reward: Reward): boolean => {
    if (currentPoints < reward.points_required) return false
    if (reward.min_tier_required) {
      const required = TIER_ORDER[reward.min_tier_required] ?? 0
      const current = TIER_ORDER[currentTier] ?? 0
      if (current < required) return false
    }
    return true
  }

  const getDisabledReason = (reward: Reward): string => {
    if (currentPoints < reward.points_required) {
      return `Thiếu ${(reward.points_required - currentPoints).toLocaleString()} điểm`
    }
    if (reward.min_tier_required) {
      const required = TIER_ORDER[reward.min_tier_required] ?? 0
      const current = TIER_ORDER[currentTier] ?? 0
      if (current < required) {
        return `Cần hạng ${TIER_LABELS[reward.min_tier_required]}+`
      }
    }
    return 'Không thể đổi'
  }

  const handleRedeem = async (reward: Reward) => {
    setConfirmReward(null)
    setRedeemingId(reward.reward_id)
    try {
      const result = await redeemReward(reward.reward_id)
      setRedeemResult(result)
      setCurrentPoints(result.remaining_points)
      toast.success('Đổi điểm thành công!', {
        description: `Voucher ${result.voucher_code} đã được tạo.`,
      })
    } catch {
      toast.error('Không thể đổi điểm', { description: 'Vui lòng thử lại sau.' })
    } finally {
      setRedeemingId(null)
    }
  }

  const handleCopyVoucher = () => {
    if (!redeemResult) return
    navigator.clipboard.writeText(redeemResult.voucher_code)
    setCopiedVoucher(true)
    setTimeout(() => setCopiedVoucher(false), 2000)
    toast.success('Đã copy mã voucher!')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <PageHeader
        title="Đổi điểm lấy Voucher"
        description="Chọn voucher yêu thích và đổi bằng điểm thưởng của bạn."
      />

      {/* Current points bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Điểm hiện có
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-primary">
            {currentPoints.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Hạng hiện tại
          </p>
          <div className="mt-1">
            <TierBadge tier={currentTier} />
          </div>
        </div>
      </div>

      {/* Category filter */}
      {!loading && categories.length > 1 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Danh mục</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reward cards grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card animate-pulse h-60"
            />
          ))}
        </div>
      ) : filteredRewards.length === 0 ? (
        <EmptyState
          title="Không có phần thưởng"
          description="Không có phần thưởng trong danh mục này. Hãy thử danh mục khác."
          action={{
            label: 'Xem tất cả',
            onClick: () => setSelectedCategory('Tất cả'),
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredRewards.map((reward) => {
            const usable = canRedeem(reward)
            const isRedeeming = redeemingId === reward.reward_id
            return (
              <div
                key={reward.reward_id}
                className={cn(
                  'flex flex-col rounded-2xl border transition-all',
                  usable
                    ? 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                    : 'border-border/50 bg-card/50 opacity-70',
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-border/50 p-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Gift className="size-5" />
                  </div>
                  <span className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    {REWARD_TYPE_LABELS[reward.reward_type] ?? reward.reward_type}
                  </span>
                </div>

                {/* Body */}
                <div className="flex-1 space-y-2 p-4">
                  <h3 className="font-semibold leading-tight text-foreground">{reward.name}</h3>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="font-mono text-sm font-bold text-primary">
                      {reward.points_required.toLocaleString()} điểm
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hiệu lực: {reward.valid_days} ngày
                  </p>
                  {reward.min_tier_required && reward.min_tier_required !== 'MEMBER' && (
                    <p className="text-xs text-muted-foreground">
                      Tối thiểu:{' '}
                      <span
                        className={cn(
                          'font-medium',
                          usable ? 'text-gold' : 'text-destructive',
                        )}
                      >
                        {TIER_LABELS[reward.min_tier_required]}+
                      </span>
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-border/50 p-4">
                  {usable ? (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => setConfirmReward(reward)}
                      disabled={isRedeeming}
                    >
                      {isRedeeming ? (
                        <Loader2 className="mr-1 size-4 animate-spin" />
                      ) : (
                        <Check className="mr-1 size-4" />
                      )}
                      {isRedeeming ? 'Đang đổi...' : 'Đổi ngay'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="w-full cursor-not-allowed"
                    >
                      {getDisabledReason(reward)}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmReward}
        onClose={() => setConfirmReward(null)}
        onConfirm={() => confirmReward && handleRedeem(confirmReward)}
        title="Xác nhận đổi điểm"
        description={`Bạn có chắc chắn muốn dùng ${confirmReward?.points_required.toLocaleString()} điểm để đổi voucher "${confirmReward?.name}" không?`}
        confirmLabel="Đổi ngay"
        cancelLabel="Hủy"
        tone="info"
        loading={!!redeemingId}
      />

      {/* Redeem success dialog */}
      <Dialog open={!!redeemResult} onOpenChange={(open) => !open && setRedeemResult(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="size-5 text-primary" />
              Đổi điểm thành công!
            </DialogTitle>
          </DialogHeader>
          {redeemResult && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{redeemResult.reward_name}</p>

              {/* Voucher code */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Mã voucher
                </p>
                <p className="font-mono text-2xl font-bold tracking-widest text-primary">
                  {redeemResult.voucher_code}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Điểm đã trừ</p>
                  <p className="font-mono font-semibold text-destructive">
                    -{redeemResult.points_deducted.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Điểm còn lại</p>
                  <p className="font-mono font-semibold text-primary">
                    {redeemResult.remaining_points.toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Hết hạn: {formatDate(redeemResult.expires_at)}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyVoucher}
                >
                  {copiedVoucher ? (
                    <Check className="mr-1 size-4" />
                  ) : (
                    <Copy className="mr-1 size-4" />
                  )}
                  {copiedVoucher ? 'Đã copy!' : 'Copy mã'}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setRedeemResult(null)
                    router.push('/customer/voucher')
                  }}
                >
                  Xem voucher
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
