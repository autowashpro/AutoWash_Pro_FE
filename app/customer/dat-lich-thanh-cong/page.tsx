"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CalendarClock, Check, Copy, Home, ListChecks, Mail, Plus } from "lucide-react"

import { SUCCESS_STORAGE_KEY } from "@/components/customer/booking-wizard"
import type { BookingSuccessSnapshot } from "@/components/customer/booking-wizard"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getMyBookings } from "@/lib/api"
import { VEHICLE_SIZE_LABELS } from "@/lib/types"

function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateVi(date: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`))
  } catch {
    return date
  }
}

function getQueryBookingId() {
  if (typeof window === "undefined") return ""
  return new URLSearchParams(window.location.search).get("booking_id") ?? ""
}

export default function BookingSuccessPage() {
  const { toast } = useToast()
  const [snapshot, setSnapshot] = useState<BookingSuccessSnapshot | null>(null)
  const [queryBookingId, setQueryBookingId] = useState("")
  const [ready, setReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const [liveLicensePlate, setLiveLicensePlate] = useState<string | null>(null)
  const [liveVehicleInfo, setLiveVehicleInfo] = useState<string | null>(null)

  useEffect(() => {
    const qId = getQueryBookingId()
    setQueryBookingId(qId)

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

  // Tự động truy vấn BE để lấy Biển số xe thực tế nếu snapshot cũ bị thiếu
  useEffect(() => {
    if (!bookingId) return
    let active = true
    getMyBookings()
      .then((res) => {
        if (!active) return
        const items = res.data || []
        const match = items.find((item: any) => item.booking_id === bookingId)
        if (match) {
          if (match.license_plate && match.license_plate !== "CHƯA CÓ BIỂN") {
            setLiveLicensePlate(match.license_plate)
          }
          const itemAny = match as any
          const brand = itemAny.vehicle_brand || itemAny.brand || itemAny.vehicleBrand || ""
          const model = itemAny.vehicle_model || itemAny.model || itemAny.vehicleModel || ""
          if (brand || model) {
            setLiveVehicleInfo(`${brand} ${model}`.trim())
          }
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [bookingId])

  const handleCopyBookingId = () => {
    if (!bookingId) return
    navigator.clipboard.writeText(bookingId)
    setCopied(true)
    toast({
      title: "Đã sao chép mã booking!",
      description: "Mã đã được lưu vào khay nhớ tạm.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const serviceNames = useMemo(
    () => snapshot?.services.map((service) => service.name).join(", ") ?? "Dịch vụ chăm sóc xe AutoWash",
    [snapshot],
  )

  const { displayLicensePlate, displayVehicleName } = useMemo(() => {
    let plate = liveLicensePlate || snapshot?.license_plate || ""
    let name = liveVehicleInfo || ""

    if (snapshot?.vehicle_label && snapshot.vehicle_label !== "Chưa chọn xe") {
      const parts = snapshot.vehicle_label.split(" - ")
      if (parts.length >= 2) {
        plate = parts[0].trim()
        name = parts.slice(1).join(" - ").trim()
      } else {
        plate = snapshot.vehicle_label
      }
    }

    if (!plate && !name) {
      plate = "Xe của bạn"
    }

    return { displayLicensePlate: plate, displayVehicleName: name }
  }, [snapshot, liveLicensePlate, liveVehicleInfo])

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Header Banner với Checkmark nổi bật */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/25 ring-8 ring-emerald-500/10">
          <Check className="size-10 animate-checkmark stroke-[3]" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider mb-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            Đã xác nhận - Chờ phục vụ
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Đặt lịch rửa xe thành công!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AutoWash Pro đã ghi nhận lịch hẹn và chuẩn bị sẵn sàng phục vụ bạn.
          </p>
        </div>

        {/* Nút bấm hành động nhanh xuất hiện ngay trên đầu màn hình */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button size="lg" className="rounded-2xl font-bold px-6 shadow-md shadow-primary/25 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90" asChild>
            <Link href="/customer/lich-hen">
              <ListChecks className="size-4 mr-2" />
              Xem danh sách lịch hẹn của tôi
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-2xl font-semibold px-5 bg-card hover:bg-secondary/50 border-border" asChild>
            <Link href="/customer/dat-lich">
              <Plus className="size-4 mr-2 text-primary" />
              Đặt lịch rửa xe mới
            </Link>
          </Button>
        </div>
      </div>

      {/* Vé tóm tắt dịch vụ dạng Premium Receipt Ticket */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-xl shadow-primary/5">
        {/* Strip trang trí trên cùng */}
        <div className="h-2 w-full bg-gradient-to-r from-primary via-sky-400 to-emerald-500" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Mã Booking Box với Nút Copy 1-Click */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="text-center sm:text-left min-w-0">
              <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground">Mã Booking xác nhận</span>
              <p className="break-all font-mono text-lg sm:text-xl font-black text-primary leading-tight mt-0.5">
                {ready ? bookingId || "Không tìm thấy mã" : "Đang tải..."}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyBookingId}
              disabled={!bookingId}
              className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 shrink-0 font-bold gap-1.5 h-9"
            >
              {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              <span>{copied ? "Đã sao chép" : "Sao chép mã"}</span>
            </Button>
          </div>

          {/* Chi tiết lịch hẹn */}
          {snapshot ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-secondary/40 p-4 border border-border/50">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ngày hẹn làm dịch vụ</p>
                  <p className="mt-1 font-mono text-base font-bold text-foreground">{formatDateVi(snapshot.slot.date)}</p>
                </div>
                <div className="rounded-2xl bg-secondary/40 p-4 border border-border/50">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Khung giờ đặt chỗ</p>
                  <p className="mt-1 font-mono text-base font-bold text-foreground">
                    {snapshot.slot.start_time}
                    {snapshot.slot.end_time ? ` - ${snapshot.slot.end_time}` : ""}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-secondary/40 p-4 border border-border/50 space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phương tiện</p>

                  {/* Dòng 1: Biển số xe */}
                  <div>
                    <div className="inline-flex items-center overflow-hidden rounded-md border border-border font-mono font-extrabold text-sm bg-background">
                      <span className="bg-blue-600 px-1.5 py-0.5 text-[9px] text-white font-bold">VN</span>
                      <span className="px-2 py-0.5 tracking-wider text-foreground">{displayLicensePlate}</span>
                    </div>
                  </div>

                  {/* Dòng 2: Hãng & Dòng xe */}
                  {displayVehicleName && (
                    <p className="text-sm font-extrabold text-foreground">{displayVehicleName}</p>
                  )}

                  {/* Dòng 3: Phân loại cỡ xe */}
                  {snapshot.vehicle_size && (
                    <div className="pt-0.5">
                      <span className="inline-block text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        Phân loại: {VEHICLE_SIZE_LABELS[snapshot.vehicle_size] || snapshot.vehicle_size}
                      </span>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-secondary/40 p-4 border border-border/50">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Danh sách dịch vụ</p>
                  <p className="mt-1 text-sm font-semibold text-foreground leading-snug">{serviceNames}</p>
                </div>
              </div>

              {/* Đường cắt vé nét đứt (Receipt Dashed Divider) */}
              <div className="relative py-2">
                <div className="border-b-2 border-dashed border-border" />
              </div>

              {/* Chi tiết chi phí */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính dịch vụ</span>
                  <span className="font-mono font-bold text-foreground">{formatVND(snapshot.estimated_total_price)}</span>
                </div>
                {snapshot.discount_amount > 0 && (
                  <div className="flex items-center justify-between text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Voucher giảm giá</span>
                    <span className="font-mono font-bold">-{formatVND(snapshot.discount_amount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <div>
                    <span className="text-sm font-extrabold text-foreground uppercase tracking-wider block">DỰ KIẾN THANH TOÁN</span>
                    <span className="text-[11px] text-muted-foreground">Thanh toán trực tiếp sau khi làm dịch vụ</span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-primary">
                    {formatVND(snapshot.final_estimate)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            ready && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 p-4 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
                Lịch hẹn của bạn đã được ghi nhận vào hệ thống. Bạn có thể vào mục <strong>Lịch hẹn của tôi</strong> để theo dõi tiến độ xử lý.
              </div>
            )
          )}
        </div>
      </div>

      {/* Hộp thông tin Email Nhắc Lịch T-2h */}
      <div className="flex items-start gap-3.5 rounded-2xl border border-sky-500/30 bg-sky-50/60 dark:bg-sky-950/20 p-4 text-sky-900 dark:text-sky-300">
        <Mail className="mt-0.5 size-5 shrink-0 text-sky-600 dark:text-sky-400" />
        <div className="space-y-1 text-sm">
          <p className="font-bold">Nhắc lịch tự động trước 2 tiếng (T-2h)</p>
          <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
            Hệ thống AutoWash Pro sẽ tự động gửi email nhắc lịch hẹn kèm liên kết phản hồi trước 2 giờ làm dịch vụ. Vui lòng kiểm tra hộp thư để giữ slot của bạn.
          </p>
        </div>
      </div>

      {/* Footer Chú thích Trust Score */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
        <CalendarClock className="size-4 text-primary" />
        <span>Vui lòng đến đúng giờ hẹn để duy trì điểm tín nhiệm <strong>Trust Score (100p)</strong> của bạn.</span>
      </div>
    </div>
  )
}
