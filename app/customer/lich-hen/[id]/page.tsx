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
import { StarRating } from '@/components/star-rating'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { getMyBookingDetail, cancelBooking, confirmVehicleCondition, rateBooking, acceptComplaintResolution, respondComplaint } from '@/lib/api'
import type { Booking, BookingStatus, BookingService, VehicleSize } from '@/lib/types'
import { BOOKING_STATUS_CONFIG, VEHICLE_SIZE_LABELS } from '@/lib/types'

// ─────────────────────────────────────
const complaintStatusMeta: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Chờ xử lý', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  IN_REVIEW: { label: 'Đang xử lý', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  WAITING_FOR_CUSTOMER: { label: 'Chờ phản hồi', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' },
  RESOLVED: { label: 'Đã giải quyết', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  REJECTED: { label: 'Từ chối', color: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
  CLOSED: { label: 'Đã đóng', color: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

// Progress steps (simplified flow)
// ─────────────────────────────────────

const PROGRESS_STEPS: {
  key: string
  label: string
  subLabel: string
}[] = [
  { key: 'CONFIRMED', label: 'Đã đặt', subLabel: 'lịch' },
  { key: 'T2H_CONFIRMED', label: 'Xác nhận', subLabel: 'đến' },
  { key: 'ASSIGNED', label: 'Phân', subLabel: 'công' },
  { key: 'VEHICLE_INSPECTED', label: 'Kiểm tra', subLabel: 'xe' },
  { key: 'IN_PROGRESS', label: 'Đang', subLabel: 'làm' },
  { key: 'COMPLETED', label: 'Hoàn', subLabel: 'thành' },
]

function getStepIndex(booking: Booking): number {
  const status = booking.status as BookingStatus
  const isT2hConfirmed = !!(booking.t2h_confirmed_at || (booking as any).t2hConfirmedAt || (booking as any).T2hConfirmedAt)

  if (['COMPLETED', 'PAID', 'CLOSED'].includes(status)) return 5
  if (status === 'IN_PROGRESS') return 4
  if (['VEHICLE_INSPECTED', 'CUSTOMER_CONFIRMED_CONDITION'].includes(status)) return 3
  if (['ASSIGNED', 'CHECKED_IN'].includes(status)) return 2
  if (isT2hConfirmed) return 1
  if (['CONFIRMED', 'PENDING_CONFIRMATION', 'SLOT_HELD'].includes(status)) return 0
  return -1
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
  const isT2hConfirmed = !!(booking.t2h_confirmed_at || (booking as any).t2hConfirmedAt || (booking as any).T2hConfirmedAt)
  if (isT2hConfirmed) return false
  if (['ASSIGNED', 'CHECKED_IN', 'VEHICLE_INSPECTED', 'CUSTOMER_CONFIRMED_CONDITION', 'IN_PROGRESS', 'COMPLETED', 'PAID', 'CLOSED'].includes(booking.status)) {
    return false
  }
  return ['PENDING_CONFIRMATION', 'SLOT_HELD', 'CONFIRMED'].includes(booking.status)
}

function isCancellableDisabled(_booking: Booking): boolean {
  // Loại bỏ hoàn toàn nút Hủy mờ khi đã gán thợ/xác nhận để tránh nút chết trên UI
  return false
}

function canConfirmVehicle(status: BookingStatus): boolean {
  return status === 'VEHICLE_INSPECTED'
}


function canRate(booking: Booking): boolean {
  if (booking.is_rated) return false
  return ['COMPLETED', 'PAID', 'CLOSED'].includes(booking.status)
}

function canComplain(booking: Booking): boolean {
  if (booking.has_complaint) return false
  return ['VEHICLE_INSPECTED', 'CUSTOMER_CONFIRMED_CONDITION', 'IN_PROGRESS', 'COMPLETED', 'PAID', 'CLOSED'].includes(booking.status)
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
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false)
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  // Quick Rating Dialog states
  const [rateDialogOpen, setRateDialogOpen] = useState(false)
  const [rateLoading, setRateLoading] = useState(false)
  const [qualityScore, setQualityScore] = useState(5)
  const [attitudeScore, setAttitudeScore] = useState(5)
  const [ratingComment, setRatingComment] = useState('')

  const handleRatingSubmit = async () => {
    if (!bookingId) return
    setRateLoading(true)
    try {
      const overall = Math.max(1, Math.round((qualityScore + attitudeScore) / 2))
      await rateBooking(bookingId, {
        overall_score: overall,
        service_quality_score: qualityScore,
        staff_attitude_score: attitudeScore,
        comment: ratingComment.trim() || undefined,
      })
      toast.success('Đánh giá dịch vụ thành công!', {
        description: 'Cảm ơn phản hồi quý báu của bạn.',
      })
      setRateDialogOpen(false)
      loadDetail()
    } catch (err: any) {
      console.error('rateBooking error:', err)
      toast.error(err?.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.')
    } finally {
      setRateLoading(false)
    }
  }

  // Complaint Action Dialog States
  const [respondComplaintId, setRespondComplaintId] = useState<string | null>(null)
  const [respondNote, setRespondNote] = useState('')
  const [respondFiles, setRespondFiles] = useState<File[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  const handleAcceptResolution = async (complaintId: string) => {
    setActionLoading(true)
    try {
      await acceptComplaintResolution(complaintId)
      toast.success('Cảm ơn bạn đã xác nhận!', {
        description: 'Khiếu nại đã được đánh dấu là hoàn tất và đóng thành công.',
      })
      await loadDetail()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xác nhận. Vui lòng thử lại.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRespondSubmit = async () => {
    if (!respondComplaintId || !respondNote.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi')
      return
    }
    setActionLoading(true)
    try {
      await respondComplaint(respondComplaintId, {
        response_note: respondNote.trim(),
        images: respondFiles.length > 0 ? respondFiles : undefined,
      })
      toast.success('Đã gửi phản hồi cho Quản lý!', {
        description: 'Khiếu nại của bạn đã được chuyển lại cho cửa hàng xem xét.',
      })
      setRespondComplaintId(null)
      setRespondNote('')
      setRespondFiles([])
      await loadDetail()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể gửi phản hồi. Vui lòng thử lại.')
    } finally {
      setActionLoading(false)
    }
  }

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

  // ─── Check Reschedule Availability ───
  function canRescheduleBooking(b: Booking): { eligible: boolean; reason?: string } {
    if (!isCancellableActive(b)) {
      return { eligible: false, reason: 'Trạng thái hiện tại không cho phép đổi lịch.' }
    }
    if (!b.slot?.date || !b.slot?.start_time) {
      return { eligible: false, reason: 'Thiếu thông tin ngày giờ.' }
    }

    try {
      const appointmentDateTime = new Date(`${b.slot.date}T${b.slot.start_time}:00`)
      if (isNaN(appointmentDateTime.getTime())) {
        return { eligible: false, reason: 'Thời gian không hợp lệ.' }
      }

      const now = new Date()
      const diffHours = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (diffHours <= 2) {
        return { eligible: false, reason: 'Chỉ hỗ trợ đổi giờ miễn phí trước 2 tiếng hẹn.' }
      }
      return { eligible: true }
    } catch {
      return { eligible: false, reason: 'Không xác định được thời gian.' }
    }
  }

  // ─── Reschedule booking ───
  async function handleReschedule() {
    if (!booking) return
    setRescheduleLoading(true)
    try {
      await cancelBooking(booking.booking_id)
      setRescheduleDialogOpen(false)
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('aw_booking_wizard_state')
      }
      toast.success('Đã giải phóng khung giờ cũ!', {
        description: 'Vui lòng chọn Ngày & Giờ mới cho lịch hẹn của bạn.',
      })
      router.push('/customer/dat-lich')
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      toast.error('Không thể đổi lịch hẹn', {
        description: errMsg || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
      })
    } finally {
      setRescheduleLoading(false)
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
  const currentStep = getStepIndex(booking)
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

            <StatusBadge status={status} isAttendanceConfirmed={!!(booking.t2h_confirmed_at || (booking as any).t2hConfirmedAt)} className="shrink-0 text-sm py-1 px-3" />
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


        {/* Đánh giá của bạn */}
        {booking.is_rated && booking.rating && (
          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5 dark:border-emerald-950/20 dark:bg-emerald-950/5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
              <Star className="size-4 text-emerald-500 fill-emerald-500" />
              Đánh giá của bạn
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground">Điểm đánh giá chung:</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < (booking.rating?.overall_score || 0)
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300 fill-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <span>Chất lượng dịch vụ: </span>
                  <strong className="text-foreground">{(booking.rating as any).service_quality_score ?? (booking.rating as any).serviceQualityScore}/5</strong>
                </div>
                <div>
                  <span>Thái độ nhân viên: </span>
                  <strong className="text-foreground">{(booking.rating as any).staff_attitude_score ?? (booking.rating as any).staffAttitudeScore}/5</strong>
                </div>
              </div>
              {booking.rating?.comment && (
                <div className="text-sm bg-accent/40 rounded-lg p-3 mt-2 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Nội dung đánh giá:</p>
                  <p className="text-foreground font-medium italic">"{booking.rating.comment}"</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Khiếu nại của bạn */}
        {booking.has_complaint && booking.complaints && booking.complaints.length > 0 && (
          <section className="rounded-2xl border border-rose-200 bg-rose-50/30 p-5 sm:p-6 dark:border-rose-900/30 dark:bg-rose-950/10 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                <MessageSquareWarning className="size-5 text-rose-500" />
                Khiếu nại & Tiến độ giải quyết
              </h2>
              <Link
                href="/customer/khieu-nai"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                Trang khiếu nại của tôi <ChevronLeft className="size-3 rotate-180" />
              </Link>
            </div>

            <div className="space-y-4">
              {booking.complaints.map((c) => {
                const meta = complaintStatusMeta[c.status] || { label: c.status, color: 'bg-slate-100 text-slate-600' }
                const isClosed = c.status === 'CLOSED'
                return (
                  <div key={c.complaint_id} className="space-y-3 rounded-xl border border-rose-100 bg-card p-4 dark:border-rose-900/20 shadow-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm font-black text-foreground">{c.title}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {c.description}
                    </p>

                    {/* Customer evidence images */}
                    {c.images && c.images.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-xs font-semibold text-muted-foreground">Ảnh minh chứng đã gửi:</p>
                        <div className="flex flex-wrap gap-2">
                          {c.images.map((imgUrl, idx) => (
                            <img
                              key={idx}
                              src={imgUrl}
                              alt="Minh chứng"
                              className="size-16 object-cover rounded-lg border border-border bg-muted cursor-zoom-in hover:scale-105 transition-transform"
                              onClick={() => window.open(imgUrl, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manager Resolution Note */}
                    {c.resolution_note && (
                      <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 space-y-1">
                        <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <ShieldCheck className="size-4 text-emerald-600" />
                          Phương án giải quyết từ Quản lý:
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-400 italic">"{c.resolution_note}"</p>
                      </div>
                    )}

                    {/* Action buttons if complaint is active */}
                    {!isClosed && (
                      <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading}
                          className="h-8 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => setRespondComplaintId(c.complaint_id)}
                        >
                          <RefreshCw className="size-3.5 mr-1" />
                          Chưa hài lòng / Phản hồi lại
                        </Button>

                        <Button
                          size="sm"
                          disabled={actionLoading}
                          className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleAcceptResolution(c.complaint_id)}
                        >
                          <CheckCircle2 className="size-3.5 mr-1" />
                          Hài lòng & Đóng khiếu nại
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Services */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
            <Sparkles className="size-4.5 text-primary" />
            Dịch vụ đã chọn
          </h2>
          <div className="space-y-3">
            {booking.services?.map((svc: BookingService) => (
              <div key={svc.service_id} className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-foreground">{svc.name}</p>
                <p className="font-mono text-sm font-extrabold text-foreground shrink-0">
                  {formatVND(svc.price)}
                </p>
              </div>
            ))}
            {booking.discount_amount > 0 && (
              <div className="flex items-center justify-between border-t border-border/60 pt-2">
                <p className="text-sm text-emerald-600 font-medium">Giảm giá (voucher)</p>
                <p className="font-mono text-sm font-bold text-emerald-600">
                  -{formatVND(booking.discount_amount)}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between rounded-xl bg-primary/5 p-4 border border-primary/15 mt-2">
              <p className="font-black text-foreground">Tổng cộng</p>
              <p className="font-mono text-xl font-black text-primary">
                {formatVND(booking.final_estimate ?? booking.estimated_total_price)}
              </p>
            </div>
          </div>
        </section>

        {/* Time & slot info (Bento Dual Card) */}
        <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <CalendarDays className="size-4.5 text-primary" />
            Thời gian đặt lịch
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Box 1: Date */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40 p-3.5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <CalendarDays className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ngày hẹn</p>
                <p className="font-mono text-sm font-extrabold text-foreground capitalize">{date || 'Chưa xác định'}</p>
              </div>
            </div>

            {/* Box 2: Time & Slot */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40 p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <Clock className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Khung giờ</p>
                  <p className="font-mono text-sm font-extrabold text-foreground">
                    {startTime}{endTime ? ` – ${endTime}` : ''}
                  </p>
                </div>
              </div>
              {numSlots && (
                <span className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-mono font-bold text-primary">
                  {numSlots} slot
                </span>
              )}
            </div>
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
            <>
              {canRescheduleBooking(booking).eligible ? (
                <Button
                  variant="outline"
                  className="flex-1 border-primary/30 text-primary hover:bg-primary/5 font-semibold"
                  onClick={() => setRescheduleDialogOpen(true)}
                >
                  <RefreshCw className="mr-2 size-4" />
                  Đổi sang giờ khác
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled
                  className="flex-1 border-border text-muted-foreground opacity-50 cursor-not-allowed"
                  title={canRescheduleBooking(booking).reason}
                >
                  <RefreshCw className="mr-2 size-4" />
                  Đổi sang giờ khác
                </Button>
              )}

              <Button
                variant="outline"
                className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/30 dark:hover:bg-rose-950/20"
                onClick={() => setCancelDialogOpen(true)}
              >
                <Ban className="mr-2 size-4" />
                Hủy lịch hẹn
              </Button>
            </>
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
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs"
              onClick={() => setRateDialogOpen(true)}
            >
              <Star className="mr-2 size-4 fill-primary-foreground text-primary-foreground" />
              Đánh giá dịch vụ
            </Button>
          )}
          {canComplain(booking) && (
            <Button variant="outline" className="flex-1 font-medium" asChild>
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

      {/* Reschedule Dialog */}
      <ConfirmDialog
        open={rescheduleDialogOpen}
        onClose={() => !rescheduleLoading && setRescheduleDialogOpen(false)}
        onConfirm={handleReschedule}
        title="Xác nhận đổi sang giờ khác"
        description="Hệ thống sẽ nhả khung giờ hiện tại (hoàn toàn miễn phí, không trừ điểm uy tín) và chuyển bạn sang màn hình chọn Ngày & Giờ mới."
        confirmLabel="Đồng ý & Chọn giờ mới"
        cancelLabel="Giữ lại lịch cũ"
        tone="info"
        loading={rescheduleLoading}
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

      {/* Quick Rating Modal */}
      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="size-5 text-amber-500" />
              Đánh giá dịch vụ
            </DialogTitle>
            <DialogDescription className="text-xs">
              Chia sẻ cảm nhận của bạn để giúp xưởng AutoWash Pro nâng cao chất lượng dịch vụ.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Criteria 1: Service Quality */}
            <div className="rounded-xl border border-border bg-slate-50/60 dark:bg-slate-900/40 p-3.5">
              <StarRating
                label="Chất lượng rửa & chăm sóc xe"
                value={qualityScore}
                onChange={setQualityScore}
                size="md"
              />
            </div>

            {/* Criteria 2: Staff Attitude */}
            <div className="rounded-xl border border-border bg-slate-50/60 dark:bg-slate-900/40 p-3.5">
              <StarRating
                label="Thái độ phục vụ của Kỹ thuật viên"
                value={attitudeScore}
                onChange={setAttitudeScore}
                size="md"
              />
            </div>

            {/* Comment area */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Ghi chú / Nhận xét thêm (Không bắt buộc)</label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Nhập ý kiến đóng góp của bạn..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setRateDialogOpen(false)}
              disabled={rateLoading}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              onClick={handleRatingSubmit}
              disabled={rateLoading}
              className="bg-primary text-primary-foreground font-bold rounded-xl"
            >
              {rateLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Gửi đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Respond Complaint */}
      <Dialog open={!!respondComplaintId} onOpenChange={(open) => !open && setRespondComplaintId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <MessageSquareWarning className="size-5" />
              Phản hồi phương án khiếu nại
            </DialogTitle>
            <DialogDescription>
              Hãy nêu rõ lý do bạn chưa đồng ý hoặc thông tin bổ sung để Quản lý tiếp tục xem xét.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Nội dung phản hồi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={respondNote}
                onChange={(e) => setRespondNote(e.target.value)}
                placeholder="Nhập nội dung phản hồi của bạn..."
                className="w-full rounded-xl border border-border bg-input p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Ảnh minh chứng bổ sung (nếu có)
              </label>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg"
                onChange={(e) => {
                  if (e.target.files) {
                    const filesArr = Array.from(e.target.files)
                    setRespondFiles((prev) => [...prev, ...filesArr].slice(0, 5))
                  }
                }}
                className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {respondFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {respondFiles.map((file, idx) => (
                    <div key={idx} className="relative text-xs bg-muted px-2 py-1 rounded border flex items-center gap-1">
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setRespondFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-rose-500 font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setRespondComplaintId(null)} disabled={actionLoading}>
              Hủy
            </Button>
            <Button onClick={handleRespondSubmit} disabled={actionLoading || !respondNote.trim()} className="bg-primary">
              {actionLoading && <Loader2 className="size-4 animate-spin mr-1.5" />}
              Gửi phản hồi cho Quản lý
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
