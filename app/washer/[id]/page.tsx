'use client'

import { ArrowLeft, Phone, MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BOOKINGS, CATALOG, formatVND } from "@/lib/data"
import { StatusBadge } from "@/components/status-badge"

export default function WasherTaskDetailPage() {
  const params = useParams()
  const booking = BOOKINGS.find((b) => b.id === params.id)
  
  if (!booking) {
    return <div className="text-center py-12">Không tìm thấy công việc</div>
  }

  const service = CATALOG.find((s) => s.id === booking.serviceId)
  const phoneDisplay = booking.customerName ? `**** *** ${Math.floor(Math.random() * 100).toString().padStart(2, '0')}` : "N/A"

  const actionButtons = {
    ASSIGNED: [
      { label: "Xác nhận khách đến", action: "check-in", primary: true },
      { label: "Khiếu nại", action: "complaint", primary: false },
    ],
    IN_PROGRESS: [
      { label: "Kiểm tra xe", action: "inspect", primary: true },
      { label: "Hoàn thành", action: "complete", primary: true },
      { label: "Khiếu nại", action: "complaint", primary: false },
    ],
    COMPLETED: [
      { label: "Xem báo cáo", action: "report", primary: true },
    ],
  }

  const currentButtons = actionButtons[booking.status as keyof typeof actionButtons] || []

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
        <p className="font-mono text-sm font-semibold text-muted-foreground">{booking.code}</p>
      </div>

      {/* Customer Info Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Thông tin khách hàng</h2>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tên khách</p>
            <p className="font-semibold text-foreground">{booking.customerName}</p>
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
            <p className="font-mono text-base font-semibold text-foreground">{booking.vehicle.plate}</p>
          </div>
        </div>
      </section>

      {/* Service Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Dịch vụ cần thực hiện</h2>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-foreground">{booking.serviceName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {service?.durationMinutes} phút
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono font-semibold text-foreground">{formatVND(booking.price)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Notes Section */}
      {booking.notes && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Ghi chú của khách</h2>
          <div className="rounded-2xl border border-gold/33 bg-gold/5 p-6">
            <p className="text-sm text-foreground whitespace-pre-wrap">{booking.notes}</p>
          </div>
        </section>
      )}

      {/* Timeline Actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Hành động</h2>
        <div className="space-y-3">
          {currentButtons.map((btn, idx) => (
            <Button
              key={idx}
              className={`w-full ${btn.primary ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"}`}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Work Details Card */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Chi tiết công việc</h2>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Giờ dự kiến</p>
              <p className="font-mono font-semibold text-foreground">{booking.timeSlot}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Cầu nâng</p>
              <p className="font-semibold text-foreground">Cầu {booking.bayId === "bay-1" ? "#1" : "#2"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
