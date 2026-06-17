'use client'

import { useState, useEffect } from 'react'
import { Star, Gift } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getLoyaltyDashboard } from '@/lib/api'
import type { LoyaltyDashboard, LoyaltyTransactionType } from '@/lib/types'
import { TIER_LABELS } from '@/lib/types'
import { TierBadge } from '@/components/status-badge'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { formatVND, formatDate } from '@/lib/data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const TIER_ORDER: Record<string, number> = { MEMBER: 0, SILVER: 1, GOLD: 2, PLATINUM: 3 }

const TRANSACTION_CONFIG: Record<
  LoyaltyTransactionType,
  { label: string; colorClass: string }
> = {
  EARN:       { label: 'Tích điểm',   colorClass: 'text-success'          },
  REDEEM:     { label: 'Đổi điểm',    colorClass: 'text-destructive'      },
  ADJUSTMENT: { label: 'Điều chỉnh',  colorClass: 'text-primary'          },
  EXPIRE:     { label: 'Hết hạn',     colorClass: 'text-muted-foreground' },
}

export default function LoyaltyDashboardPage() {
  const [data, setData] = useState<LoyaltyDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const result = await getLoyaltyDashboard()
        setData(result)
      } catch {
        toast.error('Không tải được thông tin điểm thưởng', {
          description: 'Vui lòng thử lại sau.',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const tiers = ['MEMBER', 'SILVER', 'GOLD', 'PLATINUM'] as const
  const currentTierOrder = data ? (TIER_ORDER[data.membership_tier] ?? 0) : 0

  // Progress bar based on spending towards next tier
  const progress = (() => {
    if (!data) return 0
    if (!data.next_tier) return 100
    const { total_spending_12m, spending_to_next_tier } = data
    if (!spending_to_next_tier || spending_to_next_tier <= 0) return 100
    return Math.min(
      100,
      Math.round((total_spending_12m / (total_spending_12m + spending_to_next_tier)) * 100),
    )
  })()

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        <PageHeader
          title="Điểm thưởng thành viên"
          description="Tích điểm sau mỗi lần rửa xe và đổi lấy ưu đãi hấp dẫn."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 animate-pulse h-44 sm:col-span-1" />
          <div className="rounded-2xl border border-border bg-card p-6 animate-pulse h-44 sm:col-span-2" />
          <div className="rounded-2xl border border-border bg-card p-6 animate-pulse h-32" />
          <div className="rounded-2xl border border-border bg-card p-6 animate-pulse h-32 sm:col-span-2" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl pb-12">
        <PageHeader
          title="Điểm thưởng thành viên"
          description="Tích điểm sau mỗi lần rửa xe và đổi lấy ưu đãi hấp dẫn."
        />
        <EmptyState title="Không tải được dữ liệu" description="Vui lòng tải lại trang." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <PageHeader
        title="Điểm thưởng thành viên"
        description="Tích điểm sau mỗi lần rửa xe và đổi lấy ưu đãi hấp dẫn."
      />

      {/* ── Bento grid ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Tier + Points */}
        <div className="sm:col-span-1">
          <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Hạng hiện tại
                </p>
                <div className="mt-2">
                  <TierBadge tier={data.membership_tier} />
                </div>
              </div>
              <Star className="size-5 fill-gold text-gold" />
            </div>
            <div className="mt-6 flex-1 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Điểm hiện có
              </p>
              <p className="font-mono text-3xl font-bold text-foreground">
                {data.total_points.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">điểm</p>
            </div>
            <div className="mt-auto pt-4">
              <p className="text-xs text-muted-foreground">
                Hệ số tích điểm:{' '}
                <span className="font-semibold text-primary">×{data.point_multiplier}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Progress to next tier */}
        <div className="sm:col-span-2">
          <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tiến độ lên hạng
            </p>
            {data.next_tier ? (
              <div className="mt-4 flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {TIER_LABELS[data.membership_tier]}
                    </span>
                    <span className="font-medium text-foreground">
                      {TIER_LABELS[data.next_tier]}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold to-amber-400 transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-accent/50 p-3">
                  <p className="text-sm font-semibold text-foreground">
                    Cần thêm{' '}
                    <span className="font-mono text-primary">
                      {formatVND(data.spending_to_next_tier!)}
                    </span>{' '}
                    chi tiêu để lên hạng{' '}
                    <span className="font-semibold">{TIER_LABELS[data.next_tier]}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-1 items-center justify-center">
                <div className="space-y-2 text-center">
                  <Star className="mx-auto size-10 fill-gold text-gold" />
                  <p className="font-semibold text-foreground">Bạch Kim — Hạng cao nhất!</p>
                  <p className="text-xs text-muted-foreground">
                    Bạn đang ở hạng cao nhất của hệ thống.
                  </p>
                </div>
              </div>
            )}
            <div className="mt-auto pt-2">
              <Link href="/customer/dat-lich">
                <Button size="sm" variant="outline" className="w-full">
                  Đặt lịch để tích điểm
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Spending 12m */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Chi tiêu 12 tháng
          </p>
          <p className="mt-3 font-mono text-2xl font-bold text-foreground">
            {formatVND(data.total_spending_12m)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">dùng để tính hạng thành viên</p>
        </div>

        {/* Redeem CTA */}
        <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Đổi điểm lấy voucher
              </p>
              <p className="font-semibold text-foreground">Khám phá các ưu đãi hấp dẫn</p>
              <p className="text-sm text-muted-foreground">
                Dùng{' '}
                <span className="font-mono font-bold text-primary">
                  {data.total_points.toLocaleString()}
                </span>{' '}
                điểm để đổi voucher giảm giá
              </p>
            </div>
            <Link href="/customer/do-diem" className="shrink-0">
              <Button size="sm">
                <Gift className="mr-1 size-4" />
                Đổi điểm
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Tier cards ── */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Hạng thành viên</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiers.map((tier, idx) => {
            const isActive = tier === data.membership_tier
            const isReached = idx <= currentTierOrder
            return (
              <div
                key={tier}
                className={cn(
                  'rounded-xl border-2 p-4 transition-all',
                  isActive
                    ? 'border-gold bg-gold/5'
                    : isReached
                    ? 'border-border bg-card'
                    : 'border-border bg-card opacity-50',
                )}
              >
                <div className="flex items-center gap-2">
                  <Star
                    className={cn(
                      'size-4',
                      isActive || isReached ? 'fill-gold text-gold' : 'text-muted-foreground',
                    )}
                  />
                  <p className="text-xs font-semibold text-foreground">{TIER_LABELS[tier]}</p>
                </div>
                {isActive ? (
                  <p className="mt-2 text-xs font-semibold text-gold">Hạng hiện tại ✓</p>
                ) : isReached ? (
                  <p className="mt-2 text-xs text-muted-foreground">Đã đạt</p>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">Chưa đạt</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Transaction history ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Lịch sử điểm</h2>
          <Link href="/customer/voucher">
            <Button size="sm" variant="outline">
              Voucher của tôi
            </Button>
          </Link>
        </div>

        {data.transactions.length === 0 ? (
          <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
            <Star className="mx-auto size-8 text-muted-foreground opacity-40" />
            <p className="mt-3 text-sm text-muted-foreground">
              Chưa có giao dịch điểm nào. Hãy đặt lịch rửa xe để bắt đầu tích điểm!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Ngày</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Loại</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Mô tả</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.transactions.map((tx) => {
                  const cfg = TRANSACTION_CONFIG[tx.type]
                  const isPositive = tx.points > 0
                  return (
                    <tr
                      key={tx.transaction_id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs font-semibold', cfg.colorClass)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{tx.description}</td>
                      <td
                        className={cn(
                          'px-4 py-3 text-right font-mono font-semibold',
                          cfg.colorClass,
                        )}
                      >
                        {isPositive ? '+' : ''}
                        {tx.points}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
