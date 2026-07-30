'use client'

import { useState, useEffect } from 'react'
import { Star, Gift, Crown, Shield, Gem, Award, ArrowRight, Zap, History, Sparkles, CreditCard, ChevronRight } from 'lucide-react'
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
  { label: string; colorClass: string; bgClass: string }
> = {
  EARN:       { label: 'Tích điểm',   colorClass: 'text-emerald-600 dark:text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/20' },
  REDEEM:     { label: 'Đổi điểm',    colorClass: 'text-rose-600 dark:text-rose-400', bgClass: 'bg-rose-500/10 border-rose-500/20' },
  ADJUSTMENT: { label: 'Điều chỉnh',  colorClass: 'text-sky-600 dark:text-sky-400', bgClass: 'bg-sky-500/10 border-sky-500/20' },
  EXPIRE:     { label: 'Hết hạn',     colorClass: 'text-amber-600 dark:text-amber-400', bgClass: 'bg-amber-500/10 border-amber-500/20' },
}

const TIER_METALLIC_CONFIG: Record<string, {
  cardGradient: string
  borderColor: string
  glowColor: string
  badgeBg: string
  chipColor: string
  icon: any
  multiplierText: string
  windowText: string
}> = {
  MEMBER: {
    cardGradient: "from-blue-600 via-sky-600 to-indigo-700 text-white",
    borderColor: "border-sky-400/40",
    glowColor: "shadow-sky-500/20",
    badgeBg: "bg-white/20 text-white backdrop-blur-md",
    chipColor: "from-amber-200 to-yellow-400",
    icon: Award,
    multiplierText: "×1.0 Điểm",
    windowText: "3 ngày",
  },
  SILVER: {
    cardGradient: "from-slate-700 via-zinc-800 to-slate-900 text-slate-100",
    borderColor: "border-slate-400/50",
    glowColor: "shadow-slate-500/25",
    badgeBg: "bg-slate-500/30 text-slate-100 backdrop-blur-md",
    chipColor: "from-slate-300 to-slate-100",
    icon: Shield,
    multiplierText: "×1.2 Điểm",
    windowText: "7 ngày",
  },
  GOLD: {
    cardGradient: "from-amber-600 via-amber-500 to-yellow-700 text-amber-50",
    borderColor: "border-amber-300/60",
    glowColor: "shadow-amber-500/30",
    badgeBg: "bg-amber-950/40 text-amber-200 border border-amber-300/30 backdrop-blur-md",
    chipColor: "from-yellow-200 via-amber-300 to-yellow-500",
    icon: Crown,
    multiplierText: "×1.5 Điểm",
    windowText: "10 ngày",
  },
  PLATINUM: {
    cardGradient: "from-purple-800 via-indigo-900 to-slate-950 text-purple-100",
    borderColor: "border-purple-400/50",
    glowColor: "shadow-purple-500/35",
    badgeBg: "bg-purple-950/50 text-purple-200 border border-purple-400/30 backdrop-blur-md",
    chipColor: "from-purple-300 via-indigo-200 to-pink-300",
    icon: Gem,
    multiplierText: "×2.0 Điểm",
    windowText: "14 ngày",
  },
}

export default function LoyaltyDashboardPage() {
  const [data, setData] = useState<LoyaltyDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [txFilter, setTxFilter] = useState<'ALL' | 'EARN' | 'REDEEM'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 5

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
  const activeMetallic = data ? TIER_METALLIC_CONFIG[data.membership_tier] ?? TIER_METALLIC_CONFIG.MEMBER : TIER_METALLIC_CONFIG.MEMBER
  const TierIcon = activeMetallic.icon

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

  const filteredTransactions = data?.transactions.filter((tx) => {
    if (txFilter === 'EARN') return tx.type === 'EARN'
    if (txFilter === 'REDEEM') return tx.type === 'REDEEM'
    return true
  }) ?? []

  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        <PageHeader
          title="Điểm thưởng thành viên"
          description="Tích điểm sau mỗi lần rửa xe và đổi lấy ưu đãi hấp dẫn."
        />
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-6 animate-pulse h-64 sm:col-span-1" />
          <div className="rounded-3xl border border-border bg-card p-6 animate-pulse h-64 sm:col-span-2" />
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

      {/* ── METALLIC VIP MEMBERSHIP CARD & BEN-TO HERO ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Metallic Credit Card Style */}
        <div className="lg:col-span-5 flex flex-col">
          <div className={cn(
            "relative overflow-hidden rounded-3xl p-6 shadow-2xl transition-all duration-500 hover:scale-[1.02] flex flex-col justify-between min-h-[240px] border",
            `bg-gradient-to-br ${activeMetallic.cardGradient}`,
            activeMetallic.borderColor,
            activeMetallic.glowColor
          )}>
            {/* Background Hologram Patterns */}
            <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 size-40 rounded-full bg-black/20 blur-xl pointer-events-none" />
            
            {/* Top row: Brand & Tier Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-yellow-300 animate-pulse" />
                <span className="font-extrabold tracking-widest text-xs uppercase opacity-90">AUTOWASH PRO VIP</span>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-xs font-bold tracking-wide shadow-sm flex items-center gap-1.5", activeMetallic.badgeBg)}>
                <TierIcon className="size-3.5" />
                {TIER_LABELS[data.membership_tier]}
              </span>
            </div>

            {/* Chip & Multiplier */}
            <div className="relative z-10 my-4 flex items-center justify-between">
              <div className={cn("h-7 w-10 rounded-md bg-gradient-to-tr shadow-inner border border-white/20", activeMetallic.chipColor)} />
              <div className="flex items-center gap-1 rounded-lg bg-black/20 px-2.5 py-1 text-xs font-mono font-semibold backdrop-blur-sm">
                <Zap className="size-3.5 text-yellow-300" />
                Hệ số {activeMetallic.multiplierText}
              </div>
            </div>

            {/* Bottom Row: Points Balance */}
            <div className="relative z-10 space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider opacity-80">Số dư điểm khả dụng</p>
              <div className="flex items-baseline justify-between gap-2 flex-wrap sm:flex-nowrap">
                <p className="font-mono text-3xl font-black tracking-tight drop-shadow-md">
                  {data.total_points.toLocaleString()} <span className="text-sm font-normal opacity-80">điểm</span>
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link href="/customer/voucher">
                    <Button size="sm" variant="secondary" className="rounded-xl bg-white/20 text-white hover:bg-white/30 backdrop-blur-md font-bold text-xs shadow-xs border border-white/20">
                      Voucher của tôi
                    </Button>
                  </Link>
                  <Link href="/customer/do-diem">
                    <Button size="sm" className="rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 shadow-md text-xs">
                      Đổi điểm <ChevronRight className="ml-0.5 size-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Progress & Stats Bento */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Progress Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Tiến độ thăng hạng thành viên
                </p>
                {data.next_tier && (
                  <span className="text-xs font-semibold text-primary">
                    Hạng kế tiếp: <strong className="font-bold">{TIER_LABELS[data.next_tier]}</strong>
                  </span>
                )}
              </div>

              {data.next_tier ? (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground">{TIER_LABELS[data.membership_tier]}</span>
                      <span className="font-mono text-primary font-bold">{progress}%</span>
                      <span className="text-muted-foreground">{TIER_LABELS[data.next_tier]}</span>
                    </div>
                    <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-muted/80 p-0.5 border border-border/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-amber-400 to-amber-500 shadow-sm transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-accent/40 p-3.5 border border-accent">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Tổng chi tiêu 12 tháng qua</p>
                      <p className="font-mono text-base font-bold text-foreground">
                        {formatVND(data.total_spending_12m)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Còn thiếu</p>
                      <p className="font-mono text-base font-bold text-primary">
                        {formatVND(data.spending_to_next_tier!)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="my-6 text-center space-y-2">
                  <Crown className="mx-auto size-10 text-amber-500 fill-amber-500/20" />
                  <p className="font-bold text-lg text-foreground">Hạng Bạch Kim (Platinum) — Đỉnh cao đặc quyền!</p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Chúc mừng bạn đã đạt hạng cao nhất của hệ thống AutoWash Pro với ưu đãi tích x2.0 điểm và ưu tiên đặt lịch trước 14 ngày.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Tích điểm tự động sau khi rửa xe thành công</span>
              <Link href="/customer/dat-lich">
                <Button size="sm" variant="outline" className="rounded-xl font-medium text-xs">
                  Đặt lịch ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── TIER BENEFITS COMPARISON ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Đặc Quyền 4 Hạng Thành Viên</h2>
            <p className="text-xs text-muted-foreground">Hạng càng cao · Ưu đãi càng đậm · Đặt lịch càng xa</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {tiers.map((tier, idx) => {
            const isActive = tier === data.membership_tier
            const isReached = idx <= currentTierOrder
            const cfg = TIER_METALLIC_CONFIG[tier]
            const Icon = cfg.icon

            return (
              <div
                key={tier}
                className={cn(
                  'relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 p-4 transition-all duration-300',
                  isActive
                    ? 'border-primary bg-card shadow-lg ring-4 ring-primary/10'
                    : isReached
                    ? 'border-border bg-card opacity-90'
                    : 'border-border/40 bg-card/40 opacity-60 grayscale-[25%]'
                )}
              >
                {isActive && (
                  <div className="absolute -right-8 -top-8 size-16 bg-primary/10 rounded-full blur-lg" />
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={cn("flex size-9 items-center justify-center rounded-xl", isActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground")}>
                      <Icon className="size-4.5" />
                    </div>
                    {isActive ? (
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Hiện tại
                      </span>
                    ) : isReached ? (
                      <span className="text-[10px] font-medium text-muted-foreground">Đã đạt</span>
                    ) : (
                      <span className="text-[10px] font-medium text-muted-foreground/60">Chưa đạt</span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-foreground">{TIER_LABELS[tier]}</h3>
                    <p className="text-xs font-semibold text-primary">{cfg.multiplierText}</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-border/50 pt-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Đặt lịch trước:</span>
                    <span className="font-bold text-foreground">{cfg.windowText}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── TRANSACTION HISTORY WITH FILTER ── */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">Lịch sử tích & đổi điểm</h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-card p-1 text-xs">
            <button
              onClick={() => { setTxFilter('ALL'); setCurrentPage(1); }}
              className={cn('rounded-lg px-3 py-1.5 font-medium transition-colors', txFilter === 'ALL' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}
            >
              Tất cả
            </button>
            <button
              onClick={() => { setTxFilter('EARN'); setCurrentPage(1); }}
              className={cn('rounded-lg px-3 py-1.5 font-medium transition-colors', txFilter === 'EARN' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground')}
            >
              Tích điểm
            </button>
            <button
              onClick={() => { setTxFilter('REDEEM'); setCurrentPage(1); }}
              className={cn('rounded-lg px-3 py-1.5 font-medium transition-colors', txFilter === 'REDEEM' ? 'bg-rose-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground')}
            >
              Đổi điểm
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card/60 p-8 text-center space-y-2">
            <Star className="mx-auto size-8 text-muted-foreground opacity-30" />
            <p className="text-sm font-medium text-muted-foreground">Không có giao dịch nào trong danh mục này.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
              <div className="divide-y divide-border/60">
                {paginatedTransactions.map((tx) => {
                  const cfg = TRANSACTION_CONFIG[tx.type]
                  const isPositive = tx.points > 0

                  return (
                    <div
                      key={tx.transaction_id}
                      className="flex items-center justify-between p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("flex size-10 items-center justify-center rounded-xl border text-xs font-bold", cfg.bgClass)}>
                          {isPositive ? '+' : ''}{tx.points}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-sm text-foreground">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-bold', cfg.colorClass)}>
                          {cfg.label}
                        </span>
                        <p className={cn("font-mono font-bold text-sm mt-0.5", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                          {isPositive ? `+${tx.points}` : tx.points}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                <span>
                  Hiển thị <strong className="text-foreground">{(currentPage - 1) * PAGE_SIZE + 1}</strong> - <strong className="text-foreground">{Math.min(currentPage * PAGE_SIZE, filteredTransactions.length)}</strong> trong <strong className="text-foreground">{filteredTransactions.length}</strong> giao dịch
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg text-xs font-semibold"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Trang trước
                  </Button>
                  <span className="font-mono font-bold text-foreground">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg text-xs font-semibold"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Trang sau
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
