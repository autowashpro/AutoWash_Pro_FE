'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { BOOKINGS, formatVND, formatDate, type BookingStatus } from '@/lib/data'

type TabFilter = 'all' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled'

const TAB_LABELS: Record<TabFilter, string> = {
  all: 'Tất cả',
  upcoming: 'Sắp tới',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

function filterBookingsByTab(bookings: typeof BOOKINGS, tab: TabFilter) {
  switch (tab) {
    case 'upcoming':
      return bookings.filter((b) => ['PENDING', 'CONFIRMED', 'ASSIGNED'].includes(b.status))
    case 'in_progress':
      return bookings.filter((b) => b.status === 'IN_PROGRESS')
    case 'completed':
      return bookings.filter((b) => b.status === 'COMPLETED')
    case 'cancelled':
      return bookings.filter((b) => ['AUTO_CANCELLED', 'CUSTOMER_CANCELLED'].includes(b.status))
    default:
      return bookings
  }
}

function getActionButton(status: BookingStatus) {
  switch (status) {
    case 'PENDING':
      return { label: 'Xác nhận tình trạng xe', variant: 'default' as const }
    case 'CONFIRMED':
      return { label: 'Xem chi tiết', variant: 'outline' as const }
    case 'ASSIGNED':
      return { label: 'Xem chi tiết', variant: 'outline' as const }
    case 'IN_PROGRESS':
      return { label: 'Xem chi tiết', variant: 'outline' as const }
    case 'COMPLETED':
      return { label: 'Đánh giá', variant: 'default' as const }
    default:
      return { label: 'Xem chi tiết', variant: 'outline' as const }
  }
}

export default function BookingListPage() {
  const [tab, setTab] = useState<TabFilter>('all')

  const myBookings = BOOKINGS.filter((b) => b.customerName === 'Nguyễn Minh Anh')
  const filtered = filterBookingsByTab(myBookings, tab)

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          Lịch hẹn của tôi
        </h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi và quản lý các lịch rửa xe của bạn.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 sm:mx-0 sm:px-0">
        {(Object.entries(TAB_LABELS) as Array<[TabFilter, string]>).map(([tabKey, label]) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === tabKey
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Booking cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent">
            <AlertCircle className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Bạn chưa có lịch hẹn nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === 'all'
              ? 'Hãy đặt lịch rửa xe ngay để bắt đầu.'
              : 'Không có lịch hẹn phù hợp với bộ lọc này.'}
          </p>
          <Button asChild className="mt-4">
            <Link href="/customer/dat-lich">Đặt lịch ngay</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const action = getActionButton(booking.status)
            return (
              <Link
                key={booking.id}
                href={`/customer/lich-hen/${booking.id}`}
                className="group block rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-sm"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Left column */}
                  <div className="space-y-3">
                    {/* Code */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Mã đặt lịch
                      </p>
                      <p className="font-mono text-lg font-bold text-foreground">
                        {booking.code}
                      </p>
                    </div>

                    {/* Service + group */}
                    <div>
                      <p className="font-medium text-foreground">{booking.serviceName}</p>
                      <p className="mt-1 inline-flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          WASH
                        </span>
                      </p>
                    </div>

                    {/* DateTime */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Ngày giờ
                      </p>
                      <p className="font-mono text-sm text-foreground">
                        {formatDate(booking.date)} • {booking.timeSlot}–
                        {(() => {
                          const [h, m] = booking.timeSlot.split(':').map(Number)
                          const endH = Math.floor((m + 40) / 60) + h
                          const endM = (m + 40) % 60
                          return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
                        })()}
                      </p>
                    </div>

                    {/* Bay (if WASH) */}
                    {booking.bayId && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Cầu nâng
                        </p>
                        <p className="text-sm text-foreground">
                          {booking.bayId === 'bay-1' ? 'Cầu nâng #1' : 'Cầu nâng #2'}
                        </p>
                      </div>
                    )}

                    {/* Washer */}
                    {booking.washerName && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Nhân viên
                        </p>
                        <p className="text-sm text-foreground">{booking.washerName}</p>
                      </div>
                    )}
                  </div>

                  {/* Right column */}
                  <div className="flex flex-col justify-between sm:items-end">
                    {/* Status badge */}
                    <div className="flex items-center gap-2">
                      {booking.status === 'COMPLETED' && (
                        <CheckCircle2 className="size-4 text-success" />
                      )}
                      {booking.status === 'IN_PROGRESS' && (
                        <Zap className="size-4 animate-pulse text-amber-500" />
                      )}
                      <StatusBadge status={booking.status} />
                    </div>

                    {/* Price */}
                    <div className="mt-4 text-right sm:mt-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Giá dịch vụ
                      </p>
                      <p className="font-mono text-lg font-bold text-foreground">
                        {formatVND(booking.price)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-4 border-t border-border pt-4 sm:mt-0 sm:border-t-0 sm:pt-0">
                  <Button
                    onClick={(e) => e.preventDefault()}
                    variant={action.variant}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {action.label}
                  </Button>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
