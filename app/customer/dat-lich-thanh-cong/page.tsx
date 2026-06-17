"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CalendarClock, Check, Home, ListChecks, Mail } from "lucide-react"

import { SUCCESS_STORAGE_KEY } from "@/components/customer/booking-wizard"
import type { BookingSuccessSnapshot } from "@/components/customer/booking-wizard"
import { Button } from "@/components/ui/button"
import type { Booking, VehicleSize } from "@/lib/types"


function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateVi(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`))
}

function getQueryBookingId() {
  if (typeof window === "undefined") return ""
  return new URLSearchParams(window.location.search).get("booking_id") ?? ""
}

export default function BookingSuccessPage() {
  const [snapshot, setSnapshot] = useState<BookingSuccessSnapshot | null>(null)
  const [queryBookingId, setQueryBookingId] = useState("")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setQueryBookingId(getQueryBookingId())

    const raw = window.sessionStorage.getItem(SUCCESS_STORAGE_KEY)
    if (raw) {
      try {
        setSnapshot(JSON.parse(raw) as BookingSuccessSnapshot)
      } catch {
        window.sessionStorage.removeItem(SUCCESS_STORAGE_KEY)
      }
    }

    setReady(true)
  }, [])

  const bookingId = snapshot?.booking_id ?? queryBookingId
  const serviceNames = useMemo(
    () => snapshot?.services.map((service) => service.name).join(", ") ?? "Booking đã được tạo",
    [snapshot],
  )

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 flex size-20 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg">
        <Check className="size-12 animate-checkmark" strokeWidth={3} />
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground text-balance">Đặt lịch thành công!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          AutoWash Pro đã ghi nhận lịch hẹn của bạn.
        </p>
      </div>

      <div className="mb-6 w-full rounded-2xl border border-border bg-card p-5 text-center">
        <p className="mb-2 text-sm text-muted-foreground">Mã booking</p>
        <p className="break-all font-mono text-2xl font-bold tracking-wide text-primary">
          {ready ? bookingId || "Không tìm thấy mã booking" : "Đang tải..."}
        </p>
      </div>

      <div className="mb-6 w-full space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dịch vụ</p>
          <p className="mt-1 font-semibold text-foreground">{serviceNames}</p>
        </div>

        {snapshot && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ngày hẹn</p>
                <p className="mt-1 font-mono font-semibold text-foreground">{formatDateVi(snapshot.slot.date)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Giờ hẹn</p>
                <p className="mt-1 font-mono font-semibold text-foreground">
                  {snapshot.slot.start_time}
                  {snapshot.slot.end_time ? ` - ${snapshot.slot.end_time}` : ""}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phương tiện</p>
              <p className="mt-1 font-semibold text-foreground">{snapshot.vehicle_label}</p>
              {snapshot.vehicle_size && (
                <p className="mt-1 text-xs text-muted-foreground">Cỡ xe: {snapshot.vehicle_size}</p>
              )}
            </div>

            <div className="space-y-2 border-t border-dashed border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-mono text-foreground">{formatVND(snapshot.estimated_total_price)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Giảm giá</span>
                <span className="font-mono text-foreground">-{formatVND(snapshot.discount_amount)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-foreground">Dự kiến thanh toán</span>
                <span className="font-mono text-2xl font-extrabold text-primary">
                  {formatVND(snapshot.final_estimate)}
                </span>
              </div>
            </div>
          </>
        )}

        {!snapshot && ready && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
            Không còn dữ liệu tóm tắt trong phiên hiện tại. Bạn có thể xem chi tiết trong danh sách lịch hẹn.
          </div>
        )}
      </div>

      <div className="mb-8 flex w-full gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
        <Mail className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">Nhắc lịch T-2h qua email</p>
          <p className="mt-1 text-sm leading-relaxed">
            Hệ thống sẽ gửi email nhắc lịch trước giờ hẹn 2 tiếng. Vui lòng xác nhận để giữ lịch.
          </p>
        </div>
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2">
        <Button asChild>
          <Link href="/customer/lich-hen">
            <ListChecks className="size-4" />
            Xem lịch hẹn
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/customer">
            <Home className="size-4" />
            Về trang chủ
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarClock className="size-4" />
        Vui lòng đến đúng giờ để giữ Trust Score tốt.
      </div>
    </div>
  )
}
