"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Phone, MapPin, Clock, Loader2 } from "lucide-react"
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
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Không tìm thấy công việc</p>
        <Button variant="outline" asChild>
          <Link href="/washer">Quay lại danh sách</Link>
        </Button>
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
        <Link href="/washer" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="size-4" />
          Quay lại
        </Link>
        <StatusBadge status={booking.status} />
      </div>

      {/* Booking code */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Chi tiết công việc</h1>
        <p className="font-mono text-sm font-semibold text-muted-foreground">{booking.booking_id}</p>
      </div>

      {/* Customer Info Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Thông tin khách hàng</h2>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tên khách</p>
            <p className="font-semibold text-foreground">{booking.customer_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="size-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Số điện thoại</p>
              <p className="font-mono text-sm text-foreground">{phoneDisplay}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Biển số</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-base font-semibold text-foreground">{booking.license_plate}</p>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {booking.vehicle_size}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Dịch vụ cần thực hiện</h2>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="flex flex-col gap-2">
            {booking.services?.map((svc: string, index: number) => (
              <p key={index} className="font-semibold text-foreground">• {svc}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Hành động</h2>
        <div className="space-y-3">
          {booking.status === "ASSIGNED" && (
            <Button 
              className="w-full bg-primary hover:bg-primary/90" 
              onClick={handleCheckIn}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Xác nhận khách đến
            </Button>
          )}

          {booking.status === "CHECKED_IN" && (
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" asChild>
              <Link href={`/washer/${bookingId}/kiem-tra`}>Bắt đầu kiểm tra xe</Link>
            </Button>
          )}

          {booking.status === "VEHICLE_INSPECTED" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-amber-800 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="font-medium text-sm">Đang chờ khách hàng xác nhận tình trạng xe...</p>
              </div>
              <p className="text-xs text-amber-600">Khách hàng sẽ xem biên bản và xác nhận trên thiết bị của họ</p>
            </div>
          )}

          {booking.status === "CUSTOMER_CONFIRMED_CONDITION" && (
            <Button 
              className="w-full bg-primary hover:bg-primary/90" 
              onClick={handleStartService}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Bắt đầu thực hiện dịch vụ
            </Button>
          )}

          {booking.status === "IN_PROGRESS" && (
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" asChild>
              <Link href={`/washer/executing?bookingId=${bookingId}`}>
                Chuyển đến màn hình thực hiện
              </Link>
            </Button>
          )}

          {(booking.status === "COMPLETED" || booking.status === "CLOSED" || booking.status === "PAID") && (
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" asChild>
              <Link href={`/washer/completed?bookingId=${bookingId}`}>
                Xem chi tiết hoàn thành
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Work Details Card */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Chi tiết lịch hẹn</h2>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Giờ dự kiến</p>
              <p className="font-mono font-semibold text-foreground">{booking.slot_start_time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Chi nhánh</p>
              <p className="font-semibold text-foreground">{booking.branch_name}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
