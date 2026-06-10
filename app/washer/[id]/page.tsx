"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Phone, MapPin, Clock, Loader2, Car, Wrench, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { getWasherTaskDetail, washerCheckIn, startService } from "@/lib/api/bookings"
import { BOOKINGS } from "@/lib/data" // Fallback data
import { toast } from "sonner"

export default function WasherTaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchTaskDetail = async () => {
    try {
      setLoading(true)
      const data = await getWasherTaskDetail(bookingId)
      setBooking(data)
    } catch (error) {
      console.error("Failed to fetch task detail, falling back", error)
      const fallback = BOOKINGS.find((b) => b.id === bookingId)
      if (fallback) {
        setBooking({
          booking_id: fallback.id,
          customer_name: fallback.customerName,
          phone: "090xxxxxxx",
          license_plate: fallback.vehicle.plate,
          vehicle_size: fallback.vehicle.size,
          branch_name: "Chi nhánh Gò Vấp",
          slot_start_time: fallback.timeSlot,
          slot_end_time: "Unknown",
          services: [fallback.serviceName],
          booking_type: "WASH",
          status: fallback.status,
          booking_notes: ""
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTaskDetail()
  }, [bookingId])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center pb-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-2xl mb-2">🔍</p>
        <p className="font-semibold text-foreground">Không tìm thấy công việc</p>
        <Link href="/washer" className="mt-4 text-sm text-primary hover:underline">← Quay lại danh sách</Link>
      </div>
    )
  }

  const phoneDisplay = booking.phone || "N/A"

  const handleCheckIn = async () => {
    try {
      setActionLoading(true)
      await washerCheckIn(bookingId)
      toast.success("Đã xác nhận khách đến")
      fetchTaskDetail() // Reload status
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi xác nhận check-in")
      // Mock update for testing
      setBooking({ ...booking, status: "CHECKED_IN" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleStartService = async () => {
    try {
      setActionLoading(true)
      await startService(bookingId)
      toast.success("Đã bắt đầu dịch vụ")
      router.push(`/washer/executing?bookingId=${bookingId}`)
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi bắt đầu dịch vụ")
      // Mock update for testing
      router.push(`/washer/executing?bookingId=${bookingId}`)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/washer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80 transition-opacity">
          <ArrowLeft className="size-4" />
          Quay lại
        </Link>
        <StatusBadge status={booking.status} />
      </div>

      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Chi tiết công việc</h1>
        </div>
        <p className="font-mono text-sm font-semibold text-muted-foreground pl-3">{booking.booking_id}</p>
      </div>

      {/* Customer Info */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
          <h2 className="text-base font-bold text-foreground">Thông tin khách hàng</h2>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-400 text-sm font-bold text-white shadow-[var(--shadow-glow)]">
              {(booking.customer_name || "KH").split(' ').map((n: string) => n[0]).slice(-2).join('')}
            </span>
            <div>
              <p className="font-semibold text-foreground">{booking.customer_name}</p>
              <p className="font-mono text-sm text-muted-foreground">{phoneDisplay}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-border/50">
            <span className="font-mono text-xl font-extrabold text-foreground tracking-wider">{booking.license_plate}</span>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">{booking.vehicle_size}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white ${booking.booking_type === "WASH" ? "bg-primary" : "bg-violet-600"}`}>
              {booking.booking_type ?? "WASH"}
            </span>
          </div>
        </div>
      </section>

      {/* Service */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
          <h2 className="text-base font-bold text-foreground">Dịch vụ cần thực hiện</h2>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] space-y-2">
          {booking.services?.map((svc: string, index: number) => (
            <p key={index} className="font-semibold text-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary"></span>
              {svc}
            </p>
          ))}
        </div>
      </section>

      {/* Work Details */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
          <h2 className="text-base font-bold text-foreground">Chi tiết công việc</h2>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
              <Clock className="size-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Giờ dự kiến</p>
              <p className="font-mono font-bold text-foreground">{booking.slot_start_time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
              <MapPin className="size-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{booking.bay_id ? "Cầu nâng" : "Chi nhánh"}</p>
              <p className="font-bold text-foreground">{booking.bay_id ? booking.bay_id.replace("bay-", "Cầu #") : booking.branch_name}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
          <h2 className="text-base font-bold text-foreground">Hành động</h2>
        </div>
        <div className="space-y-3">
          {booking.status === "ASSIGNED" && (
            <button
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5"
              onClick={handleCheckIn}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4" />}
              Xác nhận khách đến
            </button>
          )}

          {booking.status === "CHECKED_IN" && (
            <Link href={`/washer/${bookingId}/kiem-tra`}>
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5">
                <Car className="size-4" />
                Bắt đầu kiểm tra xe
              </button>
            </Link>
          )}

          {booking.status === "VEHICLE_INSPECTED" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-amber-800 space-y-3 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400">
              <div className="flex items-center justify-center gap-2">
                <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="font-medium text-sm">Đang chờ khách hàng xác nhận tình trạng xe...</p>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500">Khách hàng sẽ xem biên bản và xác nhận trên thiết bị của họ</p>
            </div>
          )}

          {booking.status === "CUSTOMER_CONFIRMED_CONDITION" && (
            <button
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5"
              onClick={handleStartService}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Wrench className="size-4" />}
              Bắt đầu thực hiện dịch vụ
            </button>
          )}

          {booking.status === "IN_PROGRESS" && (
            <Link href={`/washer/executing?bookingId=${bookingId}`}>
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5">
                Chuyển đến màn hình thực hiện
              </button>
            </Link>
          )}

          {(booking.status === "COMPLETED" || booking.status === "CLOSED" || booking.status === "PAID") && (
            <Link href={`/washer/completed?bookingId=${bookingId}`}>
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5">
                <CheckCircle2 className="size-4" />
                Xem chi tiết hoàn thành
              </button>
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
