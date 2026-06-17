'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Calendar, Ticket } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
      <PageHeader
        title="Voucher của tôi"
        description="Quản lý các voucher và mã giảm giá của bạn."
      />

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
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {!loading && (
                <span className="ml-2 rounded-full bg-muted px-2 text-xs">{count}</span>
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
                  'rounded-2xl border p-4 transition-all',
                  isActive
                    ? 'border-border bg-card hover:border-primary/30'
                    : 'border-border/50 bg-muted/30',
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: title + code */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Ticket
                        className={cn('size-4', isActive ? 'text-primary' : 'text-muted-foreground')}
                      />
                      <h3 className="text-base font-semibold text-foreground">
                        {voucher.reward_name}
                      </h3>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          statusCfg.badgeClass,
                        )}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">{displayValue}</p>

                    {/* Code block */}
                    <div
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-lg border p-3 font-mono text-sm font-bold tracking-wider',
                        isActive
                          ? 'border-primary/30 bg-primary/5 text-primary'
                          : 'border-border/50 bg-muted/50 text-muted-foreground',
                      )}
                    >
                      <span className="break-all">{voucher.voucher_code}</span>
                      <button
                        onClick={() =>
                          handleCopy(voucher.voucher_code, voucher.customer_reward_id)
                        }
                        disabled={!isActive}
                        className="shrink-0 rounded p-1 transition-colors hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/10"
                        aria-label="Copy mã voucher"
                      >
                        {isCopied ? (
                          <Check className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right: expiry + action */}
                  <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="size-4" />
                      {voucher.status === 'USED' && voucher.used_at
                        ? `Dùng lúc: ${formatDate(voucher.used_at)}`
                        : `HSD: ${formatDate(voucher.expires_at)}`}
                    </div>
                    {isActive && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleCopy(voucher.voucher_code, voucher.customer_reward_id)
                        }
                        className="w-full sm:w-auto"
                      >
                        {isCopied ? 'Đã copy!' : 'Copy mã'}
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
