"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle2, Clock, Loader2, CreditCard, ExternalLink, RefreshCw, Mail } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatusBadge, TierBadge } from "@/components/status-badge"
import { formatVND, formatDate } from "@/lib/data"
import { getManagerBookingDetail, confirmBooking, managerCheckIn, managerCancelBooking, markNoShow, createPayment, retryPayosLink, sendT2hReminderEmail, validateVoucher } from "@/lib/api/bookings"
import type { BookingDetail } from "@/lib/types"
import { toast } from "sonner"
import { AssignWasherModal } from "@/components/manager/assign-washer-modal"

const getTrustScoreColor = (score: number) => {
  if (score >= 80) return "text-success bg-success/10 border-success/30"
  if (score >= 60) return "text-primary bg-primary/10 border-primary/30"
  if (score >= 40) return "text-gold bg-gold/10 border-gold/30"
  return "text-rose-600 bg-rose-50 border-rose-200"
}

/** Statuses đã thanh toán xong */
const PAID_STATUSES = ["PAID", "CLOSED"]
/** Statuses hoàn thành dịch vụ chưa thanh toán */
const COMPLETED_STATUSES = ["COMPLETED"]

function formatVehicleSize(size: string | undefined): string {
  if (!size) return "-"
  const s = size.toUpperCase()
  switch (s) {
    case "SMALL": return "Nhỏ (S)"
    case "MEDIUM": return "Vừa (M)"
    case "LARGE": return "Lớn (L)"
    case "XLARGE": return "Rất lớn (XL)"
    case "XXLARGE": return "Cực lớn (XXL)"
    default: return size
  }
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelPenalty, setCancelPenalty] = useState("true")
  const [cancelReason, setCancelReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "PAYOS">("CASH")
  const [creatingPayment, setCreatingPayment] = useState(false)
  const [retryingPayment, setRetryingPayment] = useState(false)
  const [payingCash, setPayingCash] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [voucherCodeInput, setVoucherCodeInput] = useState("")
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount_amount: number; final_amount: number } | null>(null)
  const [validatingVoucher, setValidatingVoucher] = useState(false)
  const [voucherError, setVoucherError] = useState("")

  const fetchDetail = async (isSilent = false) => {
    try {
      if (!isSilent && !booking) setLoading(true)
      const data = await getManagerBookingDetail(bookingId)
      setBooking(data)
    } catch (error) {
      console.error(error)
      if (!isSilent) toast.error("Không thể tải chi tiết đặt lịch")
    } finally {
      if (!isSilent) setLoading(false)
    }
  }

  useEffect(() => {
    if (bookingId) fetchDetail()
  }, [bookingId])

  // Smart polling khi payment đang ở trạng thái PENDING (chờ PayOS Webhook)
  useEffect(() => {
    const paymentStatus = booking?.payments?.[0]?.status
    if (!booking || paymentStatus !== "PENDING") return

    const interval = setInterval(async () => {
      try {
        const data = await getManagerBookingDetail(bookingId)
        const newPaymentStatus = data?.payments?.[0]?.status
        if (newPaymentStatus === "PAID" || data?.status === "PAID" || data?.status === "CLOSED") {
          setBooking(data)
          toast.success("✓ Thanh toán PayOS thành công! Đơn hàng đã tự động cập nhật.")
        } else if (newPaymentStatus !== "PENDING") {
          setBooking(data)
        }
      } catch (e) {
        console.error("Polling error:", e)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [booking?.payments?.[0]?.status, booking?.status, bookingId])

  const handleConfirm = async () => {
    try {
      setActionLoading(true)
      await confirmBooking(bookingId)
      toast.success("Xác nhận lịch hẹn thành công")
      fetchDetail()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xác nhận lịch hẹn thất bại")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckIn = async () => {
    try {
      setActionLoading(true)
      await managerCheckIn(bookingId)
      toast.success("Check-in thành công")
      fetchDetail()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Check-in thất bại")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy lịch")
      return
    }
    try {
      setActionLoading(true)
      await managerCancelBooking(bookingId, cancelPenalty === "true", cancelReason)
      toast.success("Đã hủy lịch hẹn")
      setShowCancelDialog(false)
      fetchDetail()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Hủy lịch thất bại")
    } finally {
      setActionLoading(false)
    }
  }

  const handleNoShow = async () => {
    try {
      setActionLoading(true)
      await markNoShow(bookingId, "Khách không đến")
      toast.success("Đã đánh dấu khách không đến")
      fetchDetail()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Cập nhật No-show thất bại")
    } finally {
      setActionLoading(false)
    }
  }

  // Issue 2 fix: mở PayOS link sau khi tạo payment

  const handleSendT2hEmail = async () => {
    try {
      setSendingEmail(true)
      await sendT2hReminderEmail(bookingId)
      toast.success("✅ Đã gửi email xác nhận đến khách hàng", {
        description: "Khách sẽ nhận được link xác nhận trong hòm thư.",
      })
    } catch (error) {
      console.error(error)
      toast.error("Gửi email thất bại", {
        description: "Vui lòng thử lại hoặc kiểm tra kết nối BE.",
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const handleApplyVoucherManager = async () => {
    if (!booking) return
    if (!voucherCodeInput.trim()) {
      setVoucherError("Vui lòng nhập mã voucher.")
      return
    }
    setValidatingVoucher(true)
    setVoucherError("")
    try {
      const baseAmount = booking.total_price || 0
      const res = await validateVoucher(voucherCodeInput.trim(), baseAmount, booking.customer_id || booking.customer?.id || booking.customer?.user_id || undefined)
      setAppliedVoucher({
        code: res.voucher_code,
        discount_amount: res.discount_amount,
        final_amount: res.final_amount,
      })
      toast.success(`Áp dụng mã ${res.voucher_code} thành công (-${formatVND(res.discount_amount)})`)
    } catch (err: any) {
      setAppliedVoucher(null)
      const msg = err?.response?.data?.message || "Mã giảm giá không hợp lệ, hết hạn hoặc không đủ điều kiện."
      setVoucherError(msg)
      toast.error(msg)
    } finally {
      setValidatingVoucher(false)
    }
  }

  const handleCreatePayment = async () => {
    if (!booking) return
    try {
      setCreatingPayment(true)
      const finalAmount = appliedVoucher ? appliedVoucher.final_amount : booking.total_price
      const payment = await createPayment(bookingId, {
        method: paymentMethod,
        amount: finalAmount,
        voucherCode: appliedVoucher ? appliedVoucher.code : (voucherCodeInput.trim() || undefined),
      })
      if (paymentMethod === "PAYOS" && payment.paymentLink) {
        toast.success("Đã tạo thanh toán — đang mở trang PayOS...")
        window.open(payment.paymentLink, "_blank", "noopener,noreferrer")
      } else {
        toast.success("Đã ghi nhận thanh toán tiền mặt")
      }
      fetchDetail()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Lỗi khi tạo thanh toán")
    } finally {
      setCreatingPayment(false)
    }
  }

  // Issue 2.1 fix: retry PayOS link
  const handleRetryPayos = async () => {
    try {
      setRetryingPayment(true)
      const result = await retryPayosLink(bookingId)
      if (result.payment_link) {
        toast.success("Đã tạo lại link thanh toán — đang mở...")
        window.open(result.payment_link, "_blank", "noopener,noreferrer")
      } else {
        toast.error("Không nhận được link thanh toán mới")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi tạo lại link thanh toán")
    } finally {
      setRetryingPayment(false)
    }
  }

  // Thu tiền mặt thay thế khi PayOS thất bại (chỉ áp dụng Trust Score >= 60)
  const handlePayCash = async () => {
    if (!booking) return
    try {
      setPayingCash(true)
      await createPayment(bookingId, {
        method: "CASH",
        amount: booking.final_total_price || booking.total_price,
      })
      toast.success("✅ Đã ghi nhận thanh toán tiền mặt", {
        description: `Thu ${formatVND(booking.final_total_price || booking.total_price)} — booking sẽ chuyển sang PAID.`,
      })
      fetchDetail()
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi ghi nhận tiền mặt"
      toast.error(msg)
    } finally {
      setPayingCash(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Không tìm thấy thông tin</p>
        <Button asChild><Link href="/manager">Quay lại</Link></Button>
      </div>
    )
  }

  const isPending = booking.status === "PENDING_CONFIRMATION"
  const isConfirmed = booking.status === "CONFIRMED"
  const isAssigned = booking.status === "ASSIGNED"
  const canCancel = ["PENDING_CONFIRMATION", "CONFIRMED", "ASSIGNED"].includes(booking.status)
  const canNoShow = ["CONFIRMED", "ASSIGNED"].includes(booking.status)
  // Chỉ gửi email nhắc khi booking đã CONFIRMED hoặc ASSIGNED (có slot cụ thể)
  const canSendReminder = ["CONFIRMED", "ASSIGNED"].includes(booking.status)

  // Issue 1 fix: dùng booking.status (BE không trả payments[] trong detail DTO)
  const isPaid = PAID_STATUSES.includes(booking.status)
  const showPaymentForm = COMPLETED_STATUSES.includes(booking.status)

  // Payment object nếu BE có trả (future)
  const payment = booking.payments?.[0]
  const showRetryPayos = payment?.status === "PENDING" && payment?.method === "PAYOS"
  // Cho phép thu tiền mặt khi PayOS đang pending + Trust Score >= 60 (BR-PAY-03)
  const trustScore = booking.customer?.trust_score ?? 100
  // BE đã fix (commit 40be29b): khi tạo CASH, nếu có PENDING payment nào → tự mark FAILED rồi insert mới
  // Nên giờ "Thu tiền mặt thay thế" hoạt động được khi PayOS đang PENDING + Trust Score >= 60
  const canPayCash = showRetryPayos && trustScore >= 60
  const cashBlockedByTrustScore = showRetryPayos && trustScore < 60

  const statusProgress = ["PENDING_CONFIRMATION", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED"]
  const currentStatusIndex = statusProgress.indexOf(booking.status)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/manager">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-mono">{booking.booking_id}</h1>
            <p className="text-sm text-muted-foreground">{booking.slot_start_time} - {booking.slot_end_time}</p>
          </div>
          <div className="ml-auto">
            <StatusBadge status={booking.status} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* Status Progress */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4">Tiến độ</h2>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-5 left-8 right-8 h-0.5 bg-border -z-10" />
                {["PENDING", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED"].map((s, i) => {
                  let active = currentStatusIndex >= i
                  if (["CHECKED_IN", "VEHICLE_INSPECTED", "CUSTOMER_CONFIRMED_CONDITION"].includes(booking.status) && i <= 3) active = true
                  if (["PAID", "CLOSED"].includes(booking.status) && i <= 4) active = true
                  return (
                    <div key={s} className="flex flex-col items-center flex-1">
                      <div className={`size-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                        active ? "bg-primary text-white" : "bg-muted text-muted-foreground border border-border"
                      }`}>{i + 1}</div>
                      <span className="text-xs text-center mt-2 text-muted-foreground">
                        {["Chờ", "Xác nhận", "Phân công", "Đang làm", "Hoàn thành"][i]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Customer */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4">Khách hàng</h2>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-foreground">{booking.customer?.full_name || "Khách hàng"}</p>
                  <p className="text-sm text-muted-foreground">{booking.customer?.phone_number || "-"}</p>
                </div>
                <div className="flex gap-2">
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold border ${getTrustScoreColor(booking.customer?.trust_score || 50)}`}>
                    Trust: {booking.customer?.trust_score || 50}
                  </div>
                  {booking.customer?.membership_tier && <TierBadge tier={booking.customer.membership_tier} />}
                </div>
              </div>
            </div>

            {/* Vehicle */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4">Phương tiện</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Biển số</p>
                  <p className="font-mono text-lg font-bold text-foreground">{booking.vehicle?.license_plate || "-"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Hãng/Model</p>
                    <p className="font-medium text-foreground">{booking.vehicle?.make} {booking.vehicle?.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cỡ</p>
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {formatVehicleSize(booking.vehicle?.vehicle_size)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4">Dịch vụ</h2>
              <div className="space-y-3">
                {booking.services?.map(s => (
                  <div key={s.booking_service_id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <p className="font-medium text-foreground">{s.service_name}</p>
                    <span className="font-mono text-sm text-foreground">{formatVND(s.price)}</span>
                  </div>
                ))}
                <div className="pt-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng dịch vụ</span>
                  <span className="font-mono font-bold text-lg text-foreground">{formatVND(booking.total_price)}</span>
                </div>
              </div>
            </div>

            {/* Assignment — Issue 3 fix */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Phân công</h2>
                <Button variant="outline" size="sm" onClick={() => setShowAssignModal(true)}>
                  {booking.assigned_washer_name ? "Phân công lại" : "Phân công NV"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nhân viên</p>
                  <p className="font-medium text-foreground">
                    {booking.assigned_washer_name?.trim()
                      ? booking.assigned_washer_name
                      : <span className="text-muted-foreground italic text-sm">Chưa phân công</span>}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cầu nâng</p>
                  <p className="font-medium text-foreground">
                    {booking.bay_id?.trim()
                      ? (booking.bay_id.startsWith("bay-")
                          ? `Cầu ${booking.bay_id.replace("bay-", "")}`
                          : `Cầu ${booking.bay_id}`)
                      : <span className="text-muted-foreground italic text-sm">Tự động phân công</span>}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                * Cầu nâng được hệ thống tự động phân công theo slot — không thể chỉnh thủ công
              </p>
            </div>

            {/* Payment — Issue 1+2+2.1 fix */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="size-4" />
                Thanh toán
              </h2>

              {/* PAID/CLOSED: ẩn form tạo payment */}
              {isPaid ? (
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">Đã thanh toán</p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">
                      Booking đã hoàn tất — {formatVND(booking.total_price)}
                    </p>
                  </div>
                </div>
              ) : payment ? (
                /* Có payment object từ BE */
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Mã thanh toán</span>
                    <span className="font-mono text-xs text-foreground">{payment.paymentId}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Phương thức</span>
                    <span className="text-sm font-medium">{payment.method === "CASH" ? "💵 Tiền mặt" : "💳 PayOS"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Số tiền</span>
                    <span className="font-mono font-bold">{formatVND(payment.amount || booking.final_total_price || booking.total_price || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Trạng thái</span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      payment.status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                      payment.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {payment.status === "PAID" ? "✓ Đã thanh toán" :
                       payment.status === "PENDING" ? "⏳ Chờ khách quét PayOS (Tự động cập nhật...)" :
                       payment.status}
                    </span>
                  </div>
                  {payment.paymentLink && (
                    <a href={payment.paymentLink} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1.5 text-xs text-primary underline mt-2">
                      <ExternalLink className="size-3" /> Xem link thanh toán PayOS
                    </a>
                  )}
                  {/* Retry PayOS + Thu tiền mặt thay thế */}
                  {showRetryPayos && (
                    <div className="space-y-2 pt-1">
                      <Button variant="outline"
                        className="w-full gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                        onClick={handleRetryPayos} disabled={retryingPayment || payingCash}>
                        {retryingPayment ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                        Thử lại thanh toán PayOS
                      </Button>

                      {canPayCash ? (
                        <Button
                          className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={handlePayCash} disabled={payingCash || retryingPayment}>
                          {payingCash ? <Loader2 className="size-4 animate-spin" /> : <span>💵</span>}
                          Thu tiền mặt thay thế
                        </Button>
                      ) : cashBlockedByTrustScore ? (
                        <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
                          ⚠️ Trust Score &lt; 60 — khách chỉ được thanh toán qua PayOS (BR-PAY-03)
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : showPaymentForm ? (
                /* COMPLETED: tạo payment mới */
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Chưa có giao dịch thanh toán</p>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">PHƯƠNG THỨC THANH TOÁN</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                        paymentMethod === "CASH" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                        <input type="radio" className="sr-only" checked={paymentMethod === "CASH"} onChange={() => setPaymentMethod("CASH")} />
                        <span className="text-xl">💵</span>
                        <span className="text-xs font-semibold">Tiền mặt</span>
                      </label>
                      <label className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                        paymentMethod === "PAYOS" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                        <input type="radio" className="sr-only" checked={paymentMethod === "PAYOS"} onChange={() => setPaymentMethod("PAYOS")} />
                        <span className="text-xl">💳</span>
                        <span className="text-xs font-semibold">PayOS</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-border">
                    <label className="text-xs font-semibold text-muted-foreground">MÃ GIẢM GIÁ / VOUCHER</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCodeInput}
                        onChange={(e) => {
                          setVoucherCodeInput(e.target.value)
                          setVoucherError("")
                          if (appliedVoucher && e.target.value.trim().toUpperCase() !== appliedVoucher.code) {
                            setAppliedVoucher(null)
                          }
                        }}
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleApplyVoucherManager}
                        disabled={validatingVoucher || !voucherCodeInput.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3"
                      >
                        {validatingVoucher ? <Loader2 className="size-3 animate-spin" /> : "Áp dụng"}
                      </Button>
                    </div>
                    {voucherError && <p className="text-[11px] text-destructive font-medium">{voucherError}</p>}
                    {appliedVoucher && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        ✓ Đã áp dụng mã {appliedVoucher.code}: -{formatVND(appliedVoucher.discount_amount)}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-border">
                    <span className="text-sm font-semibold">Tổng tiền</span>
                    <span className="font-mono font-bold text-lg text-primary">
                      {formatVND(appliedVoucher ? appliedVoucher.final_amount : booking.total_price)}
                    </span>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    onClick={handleCreatePayment} disabled={creatingPayment}>
                    {creatingPayment ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                    {paymentMethod === "PAYOS" ? "Tạo QR PayOS" : "Xác nhận thanh toán"}
                  </Button>
                </div>
              ) : (
                /* Chưa đến COMPLETED → không thể thanh toán */
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <Clock className="size-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Thanh toán sẽ khả dụng sau khi dịch vụ hoàn thành
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-1 space-y-6">
            {/* Actions */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <h3 className="font-semibold text-primary mb-2">Thao tác</h3>
              {isPending && (
                <Button className="w-full" onClick={handleConfirm} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Xác nhận booking
                </Button>
              )}
              {isConfirmed && <Button className="w-full" variant="outline" disabled>Chờ phân công</Button>}
              {isAssigned && (
                <Button className="w-full" onClick={handleCheckIn} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Check-in Khách
                </Button>
              )}
              {isPaid && (
                <div className="flex items-center justify-center gap-2 py-2 text-emerald-600">
                  <CheckCircle2 className="size-4" />
                  <span className="text-sm font-semibold">Đã hoàn tất</span>
                </div>
              )}
              {!isPending && !isConfirmed && !isAssigned && !isPaid && (
                <p className="text-xs text-muted-foreground text-center">Đang xử lý dịch vụ</p>
              )}

              {/* Demo helper: gửi email xác nhận thủ công */}
              {canSendReminder && (
                <div className="pt-1 border-t border-primary/20">
                  <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Demo
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-dashed border-amber-400 text-amber-700 hover:bg-amber-50 hover:border-amber-500"
                    onClick={handleSendT2hEmail}
                    disabled={sendingEmail}
                    title="Gửi email xác nhận ngay (bỏ qua điều kiện T-2h) — chỉ dùng để demo"
                  >
                    {sendingEmail
                      ? <Loader2 className="size-3.5 animate-spin" />
                      : <Mail className="size-3.5" />
                    }
                    Gửi email xác nhận ngay
                  </Button>
                </div>
              )}
            </div>

            {/* Cancel Actions */}
            {(canCancel || canNoShow) && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-3">
                <h3 className="font-semibold text-rose-800 mb-2">Xử lý ngoại lệ</h3>
                {canNoShow && (
                  <Button variant="outline" className="w-full border-rose-300 text-rose-700 bg-white"
                    onClick={handleNoShow} disabled={actionLoading}>
                    Đánh dấu No-Show
                  </Button>
                )}
                {canCancel && (
                  <Button variant="outline" className="w-full border-rose-300 text-rose-700 bg-white"
                    onClick={() => setShowCancelDialog(true)} disabled={actionLoading}>
                    Hủy lịch hẹn
                  </Button>
                )}
              </div>
            )}

            {/* Activity Log */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-4">Hoạt động</h3>
              <div className="space-y-3">
                {booking.activities?.map((log, i) => (
                  <div key={log.activity_id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-2 rounded-full bg-primary mt-1.5" />
                      {i < (booking.activities?.length || 0) - 1 && <div className="w-px h-full bg-border my-1" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm font-medium text-foreground">{log.action_type}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{log.actor_type}</span>
                        <span className="text-xs font-mono text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {!booking.activities?.length && (
                  <p className="text-sm text-muted-foreground">Chưa có hoạt động</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <AssignWasherModal
          bookingId={bookingId}
          isReassign={!!booking?.assigned_washer_name}
          onAssign={() => { setShowAssignModal(false); fetchDetail() }}
          onClose={() => setShowAssignModal(false)}
        />
      )}

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold text-foreground mb-4">Xác nhận hủy lịch</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Loại hủy</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30">
                    <input type="radio" checked={cancelPenalty === "true"} onChange={() => setCancelPenalty("true")} className="size-4 accent-primary" />
                    <span className="text-sm font-medium text-foreground">Có phạt</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30">
                    <input type="radio" checked={cancelPenalty === "false"} onChange={() => setCancelPenalty("false")} className="size-4 accent-primary" />
                    <span className="text-sm font-medium text-foreground">Không phạt</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Lý do <span className="text-rose-500">*</span>
                </label>
                <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy..."
                  className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCancelDialog(false)}>Đóng</Button>
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={handleCancel} disabled={actionLoading || !cancelReason.trim()}>
                {actionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Xác nhận hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
