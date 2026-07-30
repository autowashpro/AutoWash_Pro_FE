'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Calendar, Ticket, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getMyVouchers } from '@/lib/api'
import type { CustomerVoucher, VoucherStatus } from '@/lib/types'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { formatDate } from '@/lib/data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type TabKey = 'ACTIVE' | 'USED' | 'EXPIRED'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ACTIVE',  label: 'Đang dùng được' },
  { key: 'USED',    label: 'Đã dùng'         },
  { key: 'EXPIRED', label: 'Hết hạn'         },
]

const STATUS_CONFIG: Record<VoucherStatus, { label: string; badgeClass: string }> = {
  ACTIVE:  { label: 'Còn hạn', badgeClass: 'bg-success/10 text-success'           },
  USED:    { label: 'Đã dùng', badgeClass: 'bg-muted text-muted-foreground'       },
  EXPIRED: { label: 'Hết hạn', badgeClass: 'bg-destructive/10 text-destructive'  },
}

/** Show discount value in a human-readable way */
function formatDiscount(reward_type: string, value: number): string {
  switch (reward_type) {
    case 'DISCOUNT_AMOUNT':  return `Giảm ${value.toLocaleString()}đ`
    case 'DISCOUNT_PERCENT': return `Giảm ${value}%`
    case 'FREE_WASH':        return 'Rửa xe miễn phí'
    case 'ADD_ON':           return 'Dịch vụ tặng thêm'
    default:                 return `Giảm ${value}`
  }
}

export default function MyVouchersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('ACTIVE')
  const [vouchers, setVouchers] = useState<CustomerVoucher[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const result = await getMyVouchers()
        setVouchers(result)
      } catch {
        toast.error('Không tải được voucher', { description: 'Vui lòng thử lại sau.' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Đã copy mã voucher!')
  }

  const filteredVouchers = vouchers.filter((v) => v.status === activeTab)

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Voucher của tôi"
          description="Quản lý các voucher và mã giảm giá của bạn."
        />
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/customer/diem-thuong">
            <Button size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
              Điểm thưởng
            </Button>
          </Link>
          <Link href="/customer/do-diem">
            <Button size="sm" className="rounded-xl text-xs font-semibold shadow-xs">
              Đổi thêm voucher
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {TABS.map((tab) => {
          const count = vouchers.filter((v) => v.status === tab.key).length
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'border-b-2 -mb-px px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {!loading && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card animate-pulse h-28"
            />
          ))}
        </div>
      ) : filteredVouchers.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'ACTIVE'
              ? 'Chưa có voucher nào'
              : `Không có voucher ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()}`
          }
          description={
            activeTab === 'ACTIVE'
              ? 'Hãy đổi điểm để nhận các ưu đãi hấp dẫn!'
              : undefined
          }
          action={
            activeTab === 'ACTIVE'
              ? { label: 'Đổi điểm ngay', onClick: () => router.push('/customer/do-diem') }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredVouchers.map((voucher) => {
            const displayValue = formatDiscount(voucher.reward_type, voucher.value)
            const statusCfg = STATUS_CONFIG[voucher.status]
            const isActive = voucher.status === 'ACTIVE'
            const isCopied = copiedId === voucher.customer_reward_id

            return (
              <div
                key={voucher.customer_reward_id}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-500 hover:shadow-lg sm:flex-row',
                  isActive
                    ? 'border-primary/20 bg-card hover:border-primary/40 hover:shadow-primary/5'
                    : 'border-border/50 bg-muted/30 opacity-75',
                )}
              >
                {/* Left section: Info */}
                <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 min-w-0">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12",
                        isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Ticket className="size-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-foreground truncate">
                          {voucher.reward_name}
                        </h3>
                        <p className="font-semibold text-primary">{displayValue}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-3 py-1 text-xs font-semibold tracking-wide',
                        statusCfg.badgeClass,
                      )}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4 shrink-0" />
                    {voucher.status === 'USED' && voucher.used_at
                      ? <span>Đã sử dụng lúc: <span className="font-medium text-foreground">{formatDate(voucher.used_at)}</span></span>
                      : <span>Có giá trị đến: <span className="font-medium text-foreground">{formatDate(voucher.expires_at)}</span></span>}
                  </div>
                </div>

                {/* Perforation line */}
                <div className="relative hidden w-0 flex-col items-center sm:flex border-l-2 border-dashed border-border/50">
                  <div className="absolute -top-[1px] h-6 w-6 -translate-y-1/2 rounded-full border border-border bg-background" />
                  <div className="absolute -bottom-[1px] h-6 w-6 translate-y-1/2 rounded-full border border-border bg-background" />
                </div>

                {/* Mobile divider */}
                <div className="mx-6 border-t-2 border-dashed border-border/50 sm:hidden" />

                {/* Right section: Code & Action (Expanded to sm:w-72 for spacious side-by-side buttons) */}
                <div className={cn(
                  "flex flex-col items-center justify-center gap-4 p-5 sm:w-72 sm:shrink-0 sm:p-6",
                  isActive ? "bg-primary/5" : "bg-transparent"
                )}>
                  <div className="w-full text-center transition-transform duration-300 group-hover:scale-[1.02]">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mã Voucher</p>
                    <div className={cn(
                      "rounded-xl border border-dashed py-2.5 px-3 text-center transition-colors shadow-xs",
                      isActive ? "border-primary/40 bg-background hover:border-primary/60" : "border-border/50 bg-background/50"
                    )}>
                      <p className={cn(
                        "font-mono text-lg font-black tracking-widest",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}>
                        {voucher.voucher_code || '---'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex w-full gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl text-xs font-bold shadow-none transition-all active:scale-95 px-2"
                      disabled={!isActive}
                      onClick={() => handleCopy(voucher.voucher_code, voucher.customer_reward_id)}
                    >
                      {isCopied ? (
                        <><Check className="mr-1.5 size-3.5 text-emerald-600" /> Đã copy</>
                      ) : (
                        <><Copy className="mr-1.5 size-3.5" /> Copy</>
                      )}
                    </Button>

                    {isActive && (
                      <Button
                        size="sm"
                        className="flex-1 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 hover:shadow-md hover:shadow-primary/20 px-2"
                        onClick={() => {
                          handleCopy(voucher.voucher_code, voucher.customer_reward_id)
                          router.push(`/customer/dat-lich?voucher=${encodeURIComponent(voucher.voucher_code)}`)
                        }}
                      >
                        Dùng ngay <ArrowRight className="ml-1 size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
