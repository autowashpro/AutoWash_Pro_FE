'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  CheckCircle2,
  Zap,
  AlertCircle,
  Car,
  CalendarDays,
  Clock,
  User,
  Star,
  MessageSquareWarning,
  Loader2,
  RefreshCw,
  Camera,
  Ban,
  Copy,
  Check,
  Sparkles,
  Hash,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { getMyBookingDetail, cancelBooking, confirmVehicleCondition } from '@/lib/api'
import type { Booking, BookingStatus, BookingService, VehicleSize } from '@/lib/types'
import { BOOKING_STATUS_CONFIG, VEHICLE_SIZE_LABELS } from '@/lib/types'

// ─────────────────────────────────────
// Progress steps (simplified flow)
// ─────────────────────────────────────

const PROGRESS_STEPS: {
  key: BookingStatus | string
  label: string
  subLabel: string
}[] = [
  { key: 'PENDING_CONFIRMATION', label: 'Chờ', subLabel: 'xác nhận' },
  { key: 'CONFIRMED', label: 'Đã', subLabel: 'xác nhận' },
  { key: 'ASSIGNED', label: 'Phân', subLabel: 'công' },
  { key: 'VEHICLE_INSPECTED', label: 'Kiểm tra', subLabel: 'xe' },
  { key: 'IN_PROGRESS', label: 'Đang', subLabel: 'làm' },
  { key: 'COMPLETED', label: 'Hoàn', subLabel: 'thành' },
]

const STATUS_TO_STEP: Partial<Record<BookingStatus, number>> = {
  PENDING_CONFIRMATION: 0,
  CONFIRMED: 1,
  ASSIGNED: 2,
  CHECKED_IN: 2,
  VEHICLE_INSPECTED: 3,
  CUSTOMER_CONFIRMED_CONDITION: 3,
  IN_PROGRESS: 4,
  COMPLETED: 5,
  PAID: 5,
  CLOSED: 5,
}

// ─────────────────────────────────────
// Helpers
// ─────────────────────────────────────

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function parseSlot(slot: Booking['slot']): { date: string; startTime: string; endTime?: string } {
  if (!slot) return { date: '', startTime: '' }
  const date = slot.date
    ? new Date(slot.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    : ''
  return { date, startTime: slot.start_time || '', endTime: slot.end_time }
}

function isCancellableActive(booking: Booking): boolean {
  if (booking.t2h_confirmed_at || (booking as any).t2hConfirmedAt || (booking as any).T2hConfirmedAt) {
    return false
  }
  return booking.status === 'PENDING_CONFIRMATION' || booking.status === 'SLOT_HELD'
}

function isCancellableDisabled(booking: Booking): boolean {
  if (booking.t2h_confirmed_at || (booking as any).t2hConfirmedAt || (booking as any).T2hConfirmedAt) {
    return ['PENDING_CONFIRMATION', 'CONFIRMED', 'ASSIGNED'].includes(booking.status)
  }
  return ['CONFIRMED', 'ASSIGNED'].includes(booking.status)
}

function canConfirmVehicle(status: BookingStatus): boolean {
  return status === 'VEHICLE_INSPECTED'
}


function canRate(booking: Booking): boolean {
  // Logic chính xác (BE confirm sau phân tích lại):
  // 1. CLOSED → luôn được đánh giá (chu trình đã hoàn tất)
  // 2. COMPLETED + payment.status === 'PAID' → rửa xong và đã thanh toán
  if (booking.status === 'CLOSED') return true
  if (booking.status === 'COMPLETED') {
    const payment = booking.payments?.[0]
    return payment?.status === 'PAID'
  }
  return false
}

function canComplain(status: BookingStatus): boolean {
  return status === 'CLOSED'
}

// ─────────────────────────────────────
// Skeleton
// ─────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-12 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-36 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-6">
          <div className="space-y-3">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────
// Main Page
// ─────────────────────────────────────

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params?.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false)
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const loadDetail = useCallback(async () => {
    if (!bookingId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getMyBookingDetail(bookingId)
      setBooking(data)
    } catch (err) {
      console.error('getMyBookingDetail error:', err)
      setError('Không thể tải thông tin lịch hẹn. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  // ─── Cancel booking ───
  async function handleCancel() {
    if (!booking) return
    setCancelLoading(true)
    try {
      const result = await cancelBooking(booking.booking_id)
      setCancelDialogOpen(false)
      toast.success('Đã hủy lịch hẹn thành công', {
        description:
          result.trust_score_change < 0
            ? `Điểm tin cậy giảm ${Math.abs(result.trust_score_change)} điểm (còn lại: ${result.customer_trust_score_after} điểm).`
            : 'Lịch hẹn đã được hủy, không ảnh hưởng đến điểm tin cậy.',
      })
      await loadDetail()
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      toast.error('Không thể hủy lịch hẹn', {
        description: errMsg || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
      })
    } finally {
      setCancelLoading(false)
    }
  }

  // ─── Confirm vehicle condition ───
  async function handleConfirmVehicle() {
    if (!booking) return
    setVehicleLoading(true)
    try {
      await confirmVehicleCondition(booking.booking_id)
      setVehicleDialogOpen(false)
      toast.success('Đã xác nhận tình trạng xe', {
        description: 'Nhân viên sẽ bắt đầu thực hiện dịch vụ.',
      })
      await loadDetail()
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      toast.error('Xác nhận thất bại', {
        description: errMsg || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
      })
    } finally {
      setVehicleLoading(false)
    }
  }

  // ─────────────────────────────────────
  // Render states
  // ─────────────────────────────────────

  if (loading) return <DetailSkeleton />

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-12 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/30">
          <AlertCircle className="size-8 text-rose-500" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{error || 'Không tìm thấy lịch hẹn này'}</p>
          <p className="mt-1 text-sm text-muted-foreground">Lịch hẹn không tồn tại hoặc bạn không có quyền xem.</p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={loadDetail}>
            <RefreshCw className="mr-2 size-4" /> Thử lại
          </Button>
          <Button asChild>
            <Link href="/customer/lich-hen">Quay lại danh sách</Link>
          </Button>
        </div>
      </div>
    )
  }

  const status = booking.status as BookingStatus
  const currentStep = STATUS_TO_STEP[status] ?? -1
  const isCancelled = ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_MANAGER', 'AUTO_CANCELLED', 'NO_SHOW', 'CANCELLED', 'EXPIRED'].includes(status)
  const { date, startTime, endTime } = parseSlot(booking.slot)

  const shortId = (booking.booking_id || (booking as any).bookingId || bookingId).slice(0, 8).toUpperCase()
  const mainService = booking.services?.[0]?.name || (booking as any).services_summary || 'Dịch vụ chăm sóc xe VIP'
  const extraCount = (booking.services?.length || 1) - 1

  const licensePlate = booking.license_plate || (booking as any).licensePlate || (booking as any).vehicle?.license_plate || (booking as any).vehicle?.licensePlate || ''
  const vehicleSize = booking.vehicle_size || (booking as any).vehicleSize || (booking as any).vehicle?.vehicle_size || (booking as any).vehicle?.vehicleSize || 'MEDIUM'
  const numSlots = booking.num_slots || (booking as any).numSlots || (booking as any).slot?.num_slots || (booking as any).slot?.numSlots || 1

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6 pb-12">
        {/* Header Hero Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Button variant="outline" size="icon" className="shrink-0 rounded-xl size-10" asChild>
                <Link href="/customer/lich-hen" aria-label="Quay lại">
                  <ChevronLeft className="size-5" />
                </Link>
              </Button>
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-900 px-2.5 py-0.5 text-white shadow-2xs">
                    <span className="text-[9px] font-black text-slate-400">VN</span>
                    <span className="font-mono text-xs font-black tracking-wider uppercase">
                      {licensePlate || 'CHƯA CÓ BIỂN'}
                    </span>
                  </div>

                  {vehicleSize && (
                    <span className="text-xs font-semibold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {VEHICLE_SIZE_LABELS[vehicleSize as VehicleSize] || vehicleSize}
                    </span>
                  )}

                  {booking.booking_source === 'WALK_IN' && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                      WALK-IN
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight line-clamp-2">
                  {mainService}
                  {extraCount > 0 && (
                    <span className="ml-2 text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full align-middle">
                      +{extraCount} dịch vụ khác
                    </span>
                  )}
                </h1>

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-muted-foreground bg-muted/60 px-2 py-1 rounded-md">
                    <Hash className="size-3.5 text-primary" />
                    Mã đơn: #{shortId}
                  </span>
                </div>
              </div>
            </div>

            <StatusBadge status={status} className="shrink-0 text-sm py-1 px-3" />
          </div>
        </div>

        {/* Progress bar (chỉ hiển thị khi không bị hủy) */}
        {!isCancelled && currentStep >= 0 && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tiến độ xử lý
            </p>
            <div className="flex items-start gap-1">
              {PROGRESS_STEPS.map((step, index) => {
                const isDone = index < currentStep
                const isActive = index === currentStep
                return (
                  <div key={step.key} className="flex flex-1 flex-col items-center gap-2">
                    {/* Line + circle */}
                    <div className="flex w-full items-center">
                      {/* Left connector */}
                      {index > 0 && (
                        <div
                          className={`h-1 flex-1 rounded transition-colors ${
                            index <= currentStep ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      )}
                      {/* Circle */}
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-primary text-primary-foreground'
                            : isActive
                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="size-4" />
                        ) : isActive ? (
                          <Zap className="size-3.5 animate-pulse" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      {/* Right connector */}
                      {index < PROGRESS_STEPS.length - 1 && (
                        <div
                          className={`h-1 flex-1 rounded transition-colors ${
                            index < currentStep ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      )}
                    </div>
                    {/* Labels */}
                    <div className="text-center">
                      <p className={`text-[10px] font-semibold leading-tight ${isActive || isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{step.subLabel}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Cancelled banner */}
        {isCancelled && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20">
            <Ban className="mt-0.5 size-5 shrink-0 text-rose-500" />
            <div>
              <p className="font-semibold text-rose-700 dark:text-rose-400">Lịch hẹn đã bị hủy</p>
              <p className="text-sm text-rose-600 dark:text-rose-500">
                {BOOKING_STATUS_CONFIG[status]?.label || 'Lịch hẹn không còn hoạt động.'}
              </p>
            </div>
          </div>
        )}

        {/* Vehicle confirm CTA (nếu cần) */}
        {canConfirmVehicle(status) && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-800 dark:text-amber-400">Cần xác nhận tình trạng xe</p>
              <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-500">
                Nhân viên đã kiểm tra xe. Vui lòng xác nhận để bắt đầu dịch vụ.
              </p>
              <Button
                size="sm"
                className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => setVehicleDialogOpen(true)}
              >
                <ShieldCheck className="mr-2 size-4" />
                Xác nhận tình trạng xe
              </Button>
            </div>
          </div>
        )}

        {/* Vehicle condition confirmed banner */}
        {status === 'CUSTOMER_CONFIRMED_CONDITION' && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-400">Đã xác nhận tình trạng xe</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-500">
                Bạn đã đồng ý với biên bản kiểm tra xe. Dịch vụ sẽ sớm được bắt đầu.
              </p>
            </div>
          </div>
        )}

        {/* Inspection Report */}
        {booking.inspections && booking.inspections.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
              <Camera className="size-4 text-primary" />
              Biên bản kiểm tra xe
            </h2>
            <div className="space-y-4">
              {booking.inspections.map((inspection) => (
                <div key={inspection.inspection_id} className="space-y-3 border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {inspection.inspection_type === 'BEFORE_SERVICE' ? 'Trước dịch vụ' : 'Sau dịch vụ'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(inspection.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Tình trạng ngoại thất</p>
                      <p className="font-medium text-foreground mt-0.5">{inspection.exterior_condition || 'Không ghi nhận hư tổn'}</p>
                    </div>
                    {inspection.interior_condition && (
                      <div>
                        <p className="text-muted-foreground text-xs">Tình trạng nội thất</p>
                        <p className="font-medium text-foreground mt-0.5">{inspection.interior_condition}</p>
                      </div>
                    )}
                  </div>
                  {inspection.notes && (
                    <div className="text-sm bg-accent/30 rounded-lg p-2.5">
                      <p className="text-xs text-muted-foreground">Ghi chú kiểm tra</p>
                      <p className="text-foreground mt-0.5">{inspection.notes}</p>
                    </div>
                  )}
                  {inspection.images && inspection.images.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Hình ảnh ghi nhận</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {inspection.images.map((img) => (
                          <div key={img.image_id} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                            <img
                              src={img.url}
                              alt={img.description || 'Ảnh xe'}
                              className="object-cover w-full h-full hover:scale-105 transition-transform duration-200 cursor-zoom-in"
                              onClick={() => window.open(img.url, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}


        {/* Services */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
            <Star className="size-4 text-primary" />
            Dịch vụ đã chọn
          </h2>
          <div className="space-y-2">
            {booking.services?.map((svc: BookingService) => (
              <div key={svc.service_id} className="flex items-center justify-between gap-4">
                <p className="text-sm text-foreground">{svc.name}</p>
                <p className="font-mono text-sm font-semibold text-foreground shrink-0">
                  {formatVND(svc.price)}
                </p>
              </div>
            ))}
            {booking.discount_amount > 0 && (
              <div className="flex items-center justify-between border-t border-border pt-2">
                <p className="text-sm text-emerald-600">Giảm giá (voucher)</p>
                <p className="font-mono text-sm font-semibold text-emerald-600">
                  -{formatVND(booking.discount_amount)}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <p className="font-semibold text-foreground">Tổng cộng</p>
              <p className="font-mono text-lg font-bold text-primary">
                {formatVND(booking.final_estimate ?? booking.estimated_total_price)}
              </p>
            </div>
          </div>
        </section>

        {/* Time & slot info */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
            <CalendarDays className="size-4 text-primary" />
            Thời gian đặt lịch
          </h2>
          <div className="space-y-3">
            {date && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Ngày</p>
                <p className="font-mono text-sm font-semibold text-foreground capitalize">{date}</p>
              </div>
            )}
            {startTime && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Giờ</p>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {startTime}
                  {endTime && ` – ${endTime}`}
                </p>
              </div>
            )}
            {numSlots && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Số slot</p>
                <p className="font-mono text-sm text-foreground">{numSlots} slot</p>
              </div>
            )}
          </div>
        </section>

        {/* Vehicle */}
        {(licensePlate || vehicleSize) && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
              <Car className="size-4 text-primary" />
              Phương tiện
            </h2>
            <div className="space-y-3">
              {licensePlate && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Biển số</p>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {licensePlate}
                  </p>
                </div>
              )}
              {vehicleSize && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Cỡ xe</p>
                  <p className="text-sm text-foreground">
                    {VEHICLE_SIZE_LABELS[vehicleSize as VehicleSize] || vehicleSize}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Notes */}
        {booking.notes && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-2 text-base font-semibold text-foreground">Ghi chú</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{booking.notes}</p>
          </section>
        )}

        {/* T-2h confirmed notice */}
        {(booking.t2h_confirmed_at || (booking as any).t2hConfirmedAt || (booking as any).T2hConfirmedAt) && ['CONFIRMED', 'ASSIGNED'].includes(booking.status) && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 text-sm text-blue-900 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-200">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="space-y-1">
                <p className="font-semibold">Bạn đã xác nhận sẽ đến dịch vụ này</p>
                <p className="text-xs text-muted-foreground">
                  Hệ thống đã khóa chỗ cầu nâng và bố trí thợ cho xe của bạn. Nếu có thay đổi khẩn cấp không thể đến được, vui lòng liên hệ Hotline <span className="font-mono font-semibold text-primary">1900 8888</span> để Quản lý xưởng hỗ trợ.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System ID Box for Customer Support Reference */}
        <div className="rounded-2xl border border-border bg-card/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              Mã tra cứu hệ thống (Dành cho Tổng đài CSKH)
            </p>
            <p className="font-mono text-muted-foreground break-all">
              {booking.booking_id}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => {
              navigator.clipboard.writeText(booking.booking_id)
              setCopiedId(true)
              toast.success('Đã sao chép mã tra cứu', { description: booking.booking_id })
              setTimeout(() => setCopiedId(false), 2000)
            }}
          >
            {copiedId ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Sao chép mã</span>
              </>
            )}
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          {isCancellableActive(booking) && (
            <Button
              variant="outline"
              className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/30 dark:hover:bg-rose-950/20"
              onClick={() => setCancelDialogOpen(true)}
            >
              <Ban className="mr-2 size-4" />
              Hủy lịch hẹn
            </Button>
          )}
          {isCancellableDisabled(booking) && (
            <Button
              variant="outline"
              disabled
              className="flex-1 border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-500 cursor-not-allowed"
            >
              <Ban className="mr-2 size-4" />
              Hủy lịch hẹn
            </Button>
          )}
          {canRate(booking) && (
            <Button
              className="flex-1"
              asChild
            >
              <Link href={`/customer/danh-gia/${booking.booking_id}`}>
                <Star className="mr-2 size-4" />
                Đánh giá dịch vụ
              </Link>
            </Button>
          )}
          {canComplain(status) && (
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/customer/khieu-nai/${booking.booking_id}`}>
                <MessageSquareWarning className="mr-2 size-4" />
                Gửi khiếu nại
              </Link>
            </Button>
          )}
        </div>

        {/* Disabled Cancel Note / Hotline Assistance */}
        {isCancellableDisabled(booking) && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 shadow-2xs">
            <ShieldCheck className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-bold text-amber-950 dark:text-amber-100">
                🔒 Lịch hẹn đã được xác nhận tham dự & giữ chỗ cầu nâng
              </p>
              <p>
                Hệ thống đã khóa vị trí cầu nâng và chuẩn bị nhân sự cho xe của bạn nên nút hủy tạm thời vô hiệu hóa trên ứng dụng. Nếu gặp sự cố khẩn cấp không thể đến xưởng, vui lòng liên hệ Hotline:{' '}
                <a href="tel:19008888" className="font-mono font-bold text-amber-800 underline decoration-amber-600/60 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100">
                  1900 8888
                </a>{' '}
                để Quản lý xưởng hỗ trợ điều chỉnh kịp thời.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onClose={() => !cancelLoading && setCancelDialogOpen(false)}
        onConfirm={handleCancel}
        title="Xác nhận hủy lịch hẹn"
        description="Bạn có chắc muốn hủy lịch hẹn này không? Việc hủy lịch có thể ảnh hưởng đến điểm tin cậy của bạn."
        confirmLabel="Hủy lịch hẹn"
        cancelLabel="Giữ lại"
        tone="danger"
        loading={cancelLoading}
      />

      {/* Vehicle Condition Dialog */}
      <ConfirmDialog
        open={vehicleDialogOpen}
        onClose={() => !vehicleLoading && setVehicleDialogOpen(false)}
        onConfirm={handleConfirmVehicle}
        title="Xác nhận tình trạng xe"
        description="Bạn đã kiểm tra và đồng ý với tình trạng xe được ghi nhận bởi nhân viên. Dịch vụ sẽ bắt đầu sau khi bạn xác nhận."
        confirmLabel="Tôi đồng ý, bắt đầu dịch vụ"
        cancelLabel="Xem lại"
        tone="info"
        loading={vehicleLoading}
      />
    </>
  )
}
