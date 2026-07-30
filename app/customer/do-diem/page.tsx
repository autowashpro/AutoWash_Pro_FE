'use client'

import { useState, useEffect } from 'react'
import { Gift, Check, Loader2, Ticket, Copy, Sparkles, ArrowRight, Flame, ShieldAlert, History } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

  const isExpiredReward = (r: Reward) => {
    const rawStatus = (r as any).status || ''
    if (rawStatus === 'INACTIVE' || rawStatus === 'EXPIRED') return true
    const dateStr = (r as any).expiryDate || (r as any).expires_at
    if (dateStr) {
      const exp = new Date(dateStr)
      exp.setHours(23, 59, 59, 999)
      if (exp.getTime() < Date.now()) return true
    }
    return false
  }

  const activeCatalog = rewards.filter((r) => !isExpiredReward(r))

  const categories = [
    'Tất cả',
    ...Array.from(new Set(activeCatalog.map((r) => r.category).filter(Boolean) as string[])),
  ]

  const filteredRewards =
    selectedCategory === 'Tất cả'
      ? activeCatalog
      : activeCatalog.filter((r) => r.category === selectedCategory)

  const canRedeem = (reward: Reward): boolean => {
    if (currentPoints < reward.points_required) return false
    if (reward.min_tier_required) {
      const required = TIER_ORDER[reward.min_tier_required] ?? 0
      const current = TIER_ORDER[currentTier] ?? 0
      const isExact = Boolean((reward as any).is_exact_tier_only || (reward as any).isExactTierOnly)
      if (isExact) {
        if (current !== required) return false
      } else {
        if (current < required) return false
      }
    }
    return true
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

      {/* ── HEADER POINTS BANNER (GLASSMORPHISM) ── */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-primary/5 p-6 shadow-md backdrop-blur-md">
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ví điểm thưởng của bạn
              </p>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="font-mono text-3xl font-black text-primary drop-shadow-xs">
                {currentPoints.toLocaleString()}
              </p>
              <span className="text-sm font-semibold text-muted-foreground">điểm khả dụng</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-border/80 bg-card/80 px-4 py-2 text-right shadow-xs backdrop-blur-xs">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Hạng hiện tại</p>
              <div className="mt-0.5">
                <TierBadge tier={currentTier} />
              </div>
            </div>

            <div className="flex gap-2">
              <Link href="/customer/diem-thuong">
                <Button size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
                  <History className="mr-1.5 size-3.5" /> Lịch sử điểm
                </Button>
              </Link>
              <Link href="/customer/voucher">
                <Button size="sm" className="rounded-xl text-xs font-semibold shadow-xs">
                  <Ticket className="mr-1.5 size-3.5" /> Voucher của tôi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORY FILTER ── */}
      {!loading && categories.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Danh mục quà tặng</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs',
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-primary/20 scale-[1.02]'
                    : 'bg-card border border-border text-foreground hover:bg-muted/80',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── REWARD CATALOG TICKET GRID ── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-border bg-card animate-pulse h-64"
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRewards.map((reward) => {
            const usable = canRedeem(reward)
            const isRedeeming = redeemingId === reward.reward_id
            const pointsNeeded = reward.points_required - currentPoints
            const pointProgress = Math.min(100, Math.round((currentPoints / reward.points_required) * 100))

            return (
              <div
                key={reward.reward_id}
                className={cn(
                  'group relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 hover:shadow-lg',
                  usable
                    ? 'border-primary/20 bg-card hover:border-primary/40 hover:shadow-primary/5'
                    : 'border-border/60 bg-card/60 opacity-80',
                )}
              >
                {/* Top Section */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("flex size-11 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6", usable ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                        <Gift className="size-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {REWARD_TYPE_LABELS[reward.reward_type] ?? reward.reward_type}
                        </span>
                        <h3 className="font-bold text-base text-foreground leading-snug">{reward.name}</h3>
                      </div>
                    </div>

                    {reward.min_tier_required && reward.min_tier_required !== 'MEMBER' && (
                      <span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {TIER_LABELS[reward.min_tier_required]}+
                      </span>
                    )}
                  </div>

                  {/* Points requirement pill */}
                  <div className="flex items-center justify-between rounded-2xl bg-primary/5 p-3 border border-primary/10">
                    <span className="text-xs text-muted-foreground font-medium">Chi phí đổi</span>
                    <span className="font-mono text-base font-black text-primary">
                      {reward.points_required.toLocaleString()} điểm
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Thời hạn sử dụng: <strong className="text-foreground">{reward.valid_days} ngày</strong> kể từ khi đổi
                  </p>
                </div>

                {/* Perforation Line & Cutouts */}
                <div className="relative flex w-full items-center">
                  <div className="absolute -left-3 h-5 w-5 rounded-full border border-border bg-background" />
                  <div className="w-full border-t-2 border-dashed border-border/60" />
                  <div className="absolute -right-3 h-5 w-5 rounded-full border border-border bg-background" />
                </div>

                {/* Footer Section */}
                <div className="p-5 bg-muted/20 space-y-3">
                  {usable ? (
                    <Button
                      className="w-full rounded-2xl font-bold text-xs shadow-xs transition-all active:scale-95 hover:shadow-md hover:shadow-primary/20"
                      onClick={() => setConfirmReward(reward)}
                      disabled={isRedeeming}
                    >
                      {isRedeeming ? (
                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                      ) : (
                        <Check className="mr-1.5 size-4" />
                      )}
                      {isRedeeming ? 'Đang đổi...' : 'Đổi voucher ngay'}
                    </Button>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                        <span>Thiếu {pointsNeeded > 0 ? pointsNeeded.toLocaleString() : 0} điểm</span>
                        <span>{pointProgress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted border border-border/40">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all duration-500"
                          style={{ width: `${pointProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── CONFIRM DIALOG ── */}
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

      {/* ── VICTORY CELEBRATION MODAL ── */}
      <Dialog open={!!redeemResult} onOpenChange={(open) => !open && setRedeemResult(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl border-primary/20 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-primary font-bold">
              <Sparkles className="size-6 text-yellow-500 animate-bounce" />
              Đổi điểm thành công!
            </DialogTitle>
          </DialogHeader>

          {redeemResult && (
            <div className="space-y-5 pt-2">
              {/* Ticket Preview Box */}
              <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-5 text-center shadow-inner">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Voucher vừa nhận
                </p>
                <p className="font-extrabold text-lg text-foreground mb-3">{redeemResult.reward_name}</p>

                <div className="rounded-xl border border-dashed border-primary/40 bg-background/80 py-3 font-mono text-2xl font-black tracking-widest text-primary shadow-xs">
                  {redeemResult.voucher_code}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-muted/60 p-3 text-center border border-border/50">
                  <p className="text-muted-foreground font-medium">Điểm đã trừ</p>
                  <p className="font-mono text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    -{redeemResult.points_used.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3 text-center border border-border/50">
                  <p className="text-muted-foreground font-medium">Điểm còn lại</p>
                  <p className="font-mono text-base font-bold text-primary mt-0.5">
                    {redeemResult.remaining_points.toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Hạn dùng: <strong className="text-foreground">{formatDate(redeemResult.expires_at)}</strong>
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl text-xs font-semibold"
                  onClick={handleCopyVoucher}
                >
                  {copiedVoucher ? (
                    <><Check className="mr-1.5 size-4" /> Đã copy</>
                  ) : (
                    <><Copy className="mr-1.5 size-4" /> Copy mã</>
                  )}
                </Button>
                <Button
                  className="flex-1 rounded-xl text-xs font-semibold shadow-xs"
                  onClick={() => {
                    setRedeemResult(null)
                    router.push(`/customer/dat-lich?voucher=${encodeURIComponent(redeemResult.voucher_code)}`)
                  }}
                >
                  Dùng ngay <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
