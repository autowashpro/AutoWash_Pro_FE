'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Zap, CheckCircle2, AlertCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { BOOKINGS, formatVND, formatDate, STATUS_META, type BookingStatus } from '@/lib/data'

const PROGRESS_STEPS: BookingStatus[] = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED']

function getStepIndex(status: BookingStatus): number {
  return Math.max(0, PROGRESS_STEPS.indexOf(status))
}

function getActionButtonsForStatus(status: BookingStatus) {
  switch (status) {
    case 'PENDING':
      return [
        { label: 'Xác nhận sẽ đến', variant: 'default' as const },
        { label: 'Hủy lịch', variant: 'outline' as const },
      ]
    case 'CONFIRMED':
      return [{ label: 'Hủy lịch', variant: 'outline' as const }]
    case 'ASSIGNED':
      return [{ label: 'Hủy lịch', variant: 'outline' as const }]
    case 'IN_PROGRESS':
      return [{ label: 'Khiếu nại', variant: 'outline' as const }]
    case 'COMPLETED':
      return [{ label: 'Đánh giá dịch vụ', variant: 'default' as const }]
    default:
      return []
  }
}

export default function BookingDetailPage() {
  const params = useParams()
  const bookingId = params?.id as string
  const booking = BOOKINGS.find((b) => b.id === bookingId)

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-12 text-center">
        <p className="text-muted-foreground">Không tìm thấy lịch hẹn này.</p>
        <Button asChild variant="outline">
          <Link href="/customer/lich-hen">Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  const currentStep = getStepIndex(booking.status)
  const actionButtons = getActionButtonsForStatus(booking.status)

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customer/lich-hen">
            <ChevronLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex-1 text-center">
          <p className="font-mono text-2xl font-bold text-foreground">{booking.code}</p>
          <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Status progress bar */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="space-y-6">
          {/* Progress line */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Tiến độ xử lý
            </p>
            <div className="flex items-center gap-2">
              {PROGRESS_STEPS.map((step, index) => (
                <div key={step} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      index <= currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="size-5" />
                    ) : index === currentStep ? (
                      <Zap className="size-4 animate-pulse" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < PROGRESS_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 transition-colors ${
                        index < currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step labels */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div>
              <p className="font-medium text-foreground">Chờ</p>
              <p className="text-muted-foreground">xác nhận</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Xác</p>
              <p className="text-muted-foreground">nhận</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Phân</p>
              <p className="text-muted-foreground">công</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Đang</p>
              <p className="text-muted-foreground">làm</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Hoàn</p>
              <p className="text-muted-foreground">thành</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service info */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Thông tin dịch vụ</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-foreground">{booking.serviceName}</p>
            <p className="font-semibold text-foreground">{formatVND(booking.price)}</p>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">Tổng cộng</p>
              <p className="font-mono text-lg font-bold text-primary">
                {formatVND(booking.price)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Time & bay info */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Thông tin thời gian & cầu nâng</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Ngày</p>
            <p className="font-mono font-semibold text-foreground">
              {formatDate(booking.date)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Giờ</p>
            <p className="font-mono font-semibold text-foreground">
              {booking.timeSlot}–
              {(() => {
                const [h, m] = booking.timeSlot.split(':').map(Number)
                const endH = Math.floor((m + 40) / 60) + h
                const endM = (m + 40) % 60
                return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
              })()}
            </p>
          </div>
          {booking.bayId && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Cầu nâng</p>
              <p className="font-semibold text-foreground">
                {booking.bayId === 'bay-1' ? 'Cầu nâng #1' : 'Cầu nâng #2'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Assigned staff */}
      {booking.washerName && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Nhân viên phụ trách</h2>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <span className="text-lg font-bold">
                {booking.washerName.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{booking.washerName}</p>
              <p className="text-sm text-muted-foreground">Thợ rửa xe</p>
            </div>
          </div>
        </section>
      )}

      {/* Vehicle condition check */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Tình trạng kiểm tra xe
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Trước
            </p>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-slate-200">
                <AlertCircle className="size-4 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-foreground">Chưa kiểm tra</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Sau
            </p>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-slate-200">
                <AlertCircle className="size-4 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-foreground">Chưa kiểm tra</span>
            </div>
          </div>
        </div>
      </section>

      {/* Payment status */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Trạng thái thanh toán</h2>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-5 text-success" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Đã thanh toán</p>
            <p className="text-sm text-muted-foreground">{formatVND(booking.price)}</p>
          </div>
        </div>
      </section>

      {/* Action buttons */}
      {actionButtons.length > 0 && (
        <div className="flex gap-3">
          {actionButtons.map((btn, idx) => (
            <Button key={idx} variant={btn.variant} className="flex-1">
              {btn.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
