'use client'

import { ArrowLeft, Phone, MapPin, Clock, Car, Wrench, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { BOOKINGS, CATALOG, formatVND } from "@/lib/data"
import { StatusBadge } from "@/components/status-badge"

export default function WasherTaskDetailPage() {
  const params = useParams()
  const booking = BOOKINGS.find((b) => b.id === params.id)

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-2xl mb-2">🔍</p>
        <p className="font-semibold text-foreground">Không tìm thấy công việc</p>
        <Link href="/washer" className="mt-4 text-sm text-primary hover:underline">← Quay lại danh sách</Link>
      </div>
    )
  }

  const service = CATALOG.find((s) => s.id === booking.serviceId)
  const phoneDisplay = `**** *** ${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`

  const actionConfig = {
    ASSIGNED: [
      { label: "Xác nhận khách đến", primary: true, icon: CheckCircle2 },
      { label: "Khiếu nại", primary: false, icon: null },
    ],
    IN_PROGRESS: [
      { label: "Kiểm tra xe", primary: true, icon: Car },
      { label: "Hoàn thành", primary: true, icon: CheckCircle2 },
      { label: "Khiếu nại", primary: false, icon: null },
    ],
    COMPLETED: [
      { label: "Xem báo cáo", primary: true, icon: CheckCircle2 },
    ],
  }

  const currentButtons = actionConfig[booking.status as keyof typeof actionConfig] || []

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
        <p className="font-mono text-sm font-semibold text-muted-foreground pl-3">{booking.code}</p>
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
              {booking.customerName.split(' ').map((n: string) => n[0]).slice(-2).join('')}
            </span>
            <div>
              <p className="font-semibold text-foreground">{booking.customerName}</p>
              <p className="font-mono text-sm text-muted-foreground">{phoneDisplay}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-border/50">
            <span className="font-mono text-xl font-extrabold text-foreground tracking-wider">{booking.vehicle.plate}</span>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">{booking.vehicle.size}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white ${service?.type === "WASH" ? "bg-primary" : "bg-violet-600"}`}>
              {service?.type ?? "WASH"}
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
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-foreground">{booking.serviceName}</p>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {service?.durationMinutes} phút thực hiện
              </p>
            </div>
            <p className="font-mono text-lg font-extrabold text-primary">{formatVND(booking.price)}</p>
          </div>
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
              <p className="font-mono font-bold text-foreground">{booking.timeSlot}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
              <MapPin className="size-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Cầu nâng</p>
              <p className="font-bold text-foreground">Cầu {booking.bayId === "bay-1" ? "#1" : "#2"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      {currentButtons.length > 0 && (
        <section className="space-y-3">
          {currentButtons.map((btn, idx) => (
            btn.primary ? (
              <button key={idx} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5">
                {btn.icon && <btn.icon className="size-4" />}
                {btn.label}
              </button>
            ) : (
              <button key={idx} className="w-full rounded-xl border border-border bg-card py-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-border/80 transition-all duration-150">
                {btn.label}
              </button>
            )
          ))}
        </section>
      )}
    </div>
  )
}
