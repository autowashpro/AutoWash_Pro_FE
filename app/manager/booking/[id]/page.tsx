"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle2, Clock, Loader2, CreditCard } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatusBadge, TierBadge } from "@/components/status-badge"
import { formatVND, formatDate } from "@/lib/data"
import { getManagerBookingDetail, confirmBooking, managerCheckIn, managerCancelBooking, markNoShow, createPayment } from "@/lib/api/bookings"
import type { BookingDetail } from "@/lib/types"
import { toast } from "sonner"
import { AssignWasherModal } from "@/components/manager/assign-washer-modal"

const getTrustScoreColor = (score: number) => {
  if (score >= 80) return "text-success bg-success/10 border-success/30"
  if (score >= 60) return "text-primary bg-primary/10 border-primary/30"
  if (score >= 40) return "text-gold bg-gold/10 border-gold/30"
  return "text-rose-600 bg-rose-50 border-rose-200"
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

  const fetchDetail = async () => {
    try {
      setLoading(true)
      const data = await getManagerBookingDetail(bookingId)
      setBooking(data)
    } catch (error) {
      console.error(error)
      toast.error("Không thể tải chi tiết đặt lịch")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bookingId) fetchDetail()
  }, [bookingId])

  const handleConfirm = async () => {
    try {
      setActionLoading(true)
      await confirmBooking(bookingId)
      toast.success("Xác nhận lịch hẹn thành công")
      fetchDetail()
    } catch (error) {
      toast.error("Lỗi xác nhận")
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
    } catch (error) {
      toast.error("Lỗi check-in")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    try {
      setActionLoading(true)
      await managerCancelBooking(bookingId, cancelPenalty === "true", cancelReason)
      toast.success("Đã hủy lịch hẹn")
      setShowCancelDialog(false)
      fetchDetail()
    } catch (error) {
      toast.error("Lỗi khi hủy lịch")
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
    } catch (error) {
      toast.error("Lỗi cập nhật")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreatePayment = async () => {
    if (!booking) return
    try {
      setCreatingPayment(true)
      await createPayment(bookingId, { method: paymentMethod, amount: booking.total_price })
      toast.success("Tạo thanh toán thành công")
      fetchDetail()
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi tạo thanh toán")
    } finally {
      setCreatingPayment(false)
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
        <Button asChild>
          <Link href="/manager">Quay lại</Link>
        </Button>
      </div>
    )
  }

  const isPending = booking.status === "PENDING_CONFIRMATION"
  const isConfirmed = booking.status === "CONFIRMED"
  const isAssigned = booking.status === "ASSIGNED"
  const canCancel = ["PENDING_CONFIRMATION", "CONFIRMED", "ASSIGNED"].includes(booking.status)
  const canNoShow = ["CONFIRMED", "ASSIGNED"].includes(booking.status)

  const payment = booking.payments?.[0]
  const beforeInspection = booking.inspections?.find(i => i.inspection_type === "BEFORE_SERVICE")
  const afterInspection = booking.inspections?.find(i => i.inspection_type === "AFTER_SERVICE")

  const statusProgress = ["PENDING_CONFIRMATION", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED"]
  const currentStatusIndex = statusProgress.indexOf(booking.status)

  return (
    <div className="min-h-screen bg-background pb-20">
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
                  let active = false
                  if (currentStatusIndex >= i) active = true
                  if (booking.status === "CHECKED_IN" && i <= 3) active = true
                  if (booking.status === "VEHICLE_INSPECTED" && i <= 3) active = true
                  if ((booking.status === "PAID" || booking.status === "CLOSED") && i <= 4) active = true

                  return (
                    <div key={s} className="flex flex-col items-center flex-1">
                      <div className={`size-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                        active
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}>
                        {i + 1}
                      </div>
                      <span className="text-xs text-center mt-2 text-muted-foreground">{
                        ["Chờ", "Xác nhận", "Phân công", "Đang làm", "Hoàn thành"][i]
                      }</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Customer Card */}
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
                  {booking.customer?.membership_tier && (
                    <TierBadge tier={booking.customer.membership_tier} />
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Card */}
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
                      {booking.vehicle?.vehicle_size}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Dịch vụ</h2>
              </div>
              <div className="space-y-3">
                {booking.services?.map(s => (
                  <div key={s.booking_service_id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{s.service_name}</p>
                    </div>
                    <span className="font-mono text-sm text-foreground">{formatVND(s.price)}</span>
                  </div>
                ))}
                <div className="pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tổng dịch vụ</span>
                    <span className="font-mono font-bold text-lg text-foreground">{formatVND(booking.total_price)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Phân công</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAssignModal(true)}
                >
                  {booking.assigned_washer_name ? "Phân công lại" : "Phân công NV"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nhân viên</p>
                  <p className="font-medium text-foreground">{booking.assigned_washer_name || "Chưa phân công"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cầu nâng</p>
                  <p className="font-medium text-foreground">{booking.bay_id ? `Cầu ${booking.bay_id.split('-')[1]}` : "Chưa chỉ định"}</p>
                </div>
              </div>
            </div>
            
            {/* Payment Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="size-4" />
                Thanh toán
              </h2>
              {payment ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Mã thanh toán</span>
                    <span className="font-mono text-sm text-foreground">{payment.paymentId}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Phương thức</span>
                    <span className="text-sm font-medium text-foreground">{payment.method === "CASH" ? "💵 Tiền mặt" : "💳 PayOS"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Số tiền</span>
                    <span className="font-mono font-bold text-foreground">{formatVND(payment.amount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Trạng thái</span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      payment.status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                      payment.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {payment.status === "PAID" ? "✓ Đã thanh toán" :
                       payment.status === "PENDING" ? "⏳ Chờ xử lý" :
                       payment.status}
                    </span>
                  </div>
                  {payment.paymentLink && (
                    <a
                      href={payment.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center text-xs text-primary underline mt-2"
                    >
                      Xem link thanh toán PayOS
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Chưa có giao dịch thanh toán</p>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">PHƯƠNG THỨC THANH TOÁN</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                          paymentMethod === "CASH" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <input type="radio" className="sr-only" checked={paymentMethod === "CASH"} onChange={() => setPaymentMethod("CASH")} />
                        <span className="text-xl">💵</span>
                        <span className="text-xs font-semibold text-foreground">Tiền mặt</span>
                      </label>
                      <label
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                          paymentMethod === "PAYOS" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <input type="radio" className="sr-only" checked={paymentMethod === "PAYOS"} onChange={() => setPaymentMethod("PAYOS")} />
                        <span className="text-xl">💳</span>
                        <span className="text-xs font-semibold text-foreground">PayOS</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-border">
                    <span className="text-sm font-semibold text-foreground">Tổng tiền</span>
                    <span className="font-mono font-bold text-lg text-foreground">{formatVND(booking.total_price)}</span>
                  </div>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    onClick={handleCreatePayment}
                    disabled={creatingPayment}
                  >
                    {creatingPayment ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                    Tạo thanh toán
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-1 space-y-6">
            {/* Primary Actions */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <h3 className="font-semibold text-primary mb-2">Thao tác</h3>
              {isPending && (
                <Button className="w-full" onClick={handleConfirm} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Xác nhận booking
                </Button>
              )}
              {isConfirmed && (
                <Button className="w-full" variant="outline" disabled>
                  Chờ phân công
                </Button>
              )}
              {isAssigned && (
                <Button className="w-full" onClick={handleCheckIn} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Check-in Khách
                </Button>
              )}
            </div>

            {/* Cancellation Actions */}
            {(canCancel || canNoShow) && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-3">
                <h3 className="font-semibold text-rose-800 mb-2">Xử lý ngoại lệ</h3>
                {canNoShow && (
                  <Button variant="outline" className="w-full border-rose-300 text-rose-700 bg-white" onClick={handleNoShow} disabled={actionLoading}>
                    Đánh dấu No-Show
                  </Button>
                )}
                {canCancel && (
                  <Button variant="outline" className="w-full border-rose-300 text-rose-700 bg-white" onClick={() => setShowCancelDialog(true)} disabled={actionLoading}>
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
                      <div className="flex justify-between items-center mt-1">
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

      {/* Assign Washer Modal */}
      {showAssignModal && (
        <AssignWasherModal
          bookingId={bookingId}
          isReassign={!!booking?.assigned_washer_name}
          onAssign={() => {
            setShowAssignModal(false)
            fetchDetail()
          }}
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
                <label className="text-sm font-semibold text-foreground mb-2 block">Lý do</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy..."
                  className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCancelDialog(false)}>Đóng</Button>
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={handleCancel} disabled={actionLoading}>
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
