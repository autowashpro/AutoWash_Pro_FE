"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  CalendarPlus, 
  Clock, 
  MapPin, 
  Sparkles, 
  Gift, 
  ChevronRight, 
  Loader2, 
  Shield, 
  Car, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  Award,
  CalendarCheck2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge, TierBadge } from "@/components/status-badge"
import { getMyProfile, getMyBookings, getMyVehicles } from "@/lib/api"
import type { CustomerProfile, BookingSummary, Vehicle } from "@/lib/types"
import { formatVND } from "@/lib/data"
import { MonoText } from "@/components/shared/mono-text"
import { TrustScoreDisplay } from "@/components/shared/trust-score-display"
import { cn } from "@/lib/utils"

const UPCOMING_STATUSES = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "ASSIGNED",
  "CHECKED_IN",
  "VEHICLE_INSPECTED",
  "CUSTOMER_CONFIRMED_CONDITION",
  "IN_PROGRESS",
]

const SIZE_LABELS: Record<string, string> = {
  SMALL: "Nhỏ (S)",
  MEDIUM: "Vừa (M)",
  LARGE: "Lớn (L)",
}

export default function CustomerDashboardPage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [bookings, setBookings] = useState<BookingSummary[]>([])
  const [defaultVehicle, setDefaultVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true)
      try {
        // Gọi song song 3 API để đảm bảo tốc độ tối đa
        const [profileData, bookingsData, vehiclesData] = await Promise.all([
          getMyProfile().catch(() => null),
          getMyBookings({ page: 1, limit: 10 }).catch(() => null),
          getMyVehicles().catch(() => null),
        ])

        // Helper toArray
        const toArray = <T,>(val: unknown): T[] => {
          if (Array.isArray(val)) return val as T[]
          if (val && typeof val === 'object') {
            const v = val as Record<string, unknown>
            if (Array.isArray(v['items'])) return v['items'] as T[]
            if (Array.isArray(v['data'])) return v['data'] as T[]
          }
          return []
        }

        // 1. Profile
        if (profileData) {
          setProfile(profileData)
        } else {
          setProfile(null)
        }

        // 2. Bookings (Lọc bỏ SLOT_HELD và EXPIRED giống trang lịch hẹn)
        const rawBookings = (bookingsData as any)?.data !== undefined ? (bookingsData as any).data : bookingsData
        const realBookings = toArray<BookingSummary>(rawBookings).filter(
          (b) => b.status !== 'SLOT_HELD' && b.status !== 'EXPIRED'
        )
        setBookings(realBookings)

        // 3. Vehicles (Lấy xe ưu tiên mặc định từ dữ liệu thật)
        const realVehicles = toArray<Vehicle>(vehiclesData)
        const def = realVehicles.find((v) => v.is_default) || realVehicles[0] || null
        setDefaultVehicle(def)
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-9 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground animate-pulse">Đang đồng bộ dữ liệu tổng quan VIP...</p>
        </div>
      </div>
    )
  }

  const userName = profile?.full_name || "Khách hàng VIP"
  const points = profile?.total_points ?? 0
  const tier = profile?.membership_tier || "MEMBER"
  const trustScore = profile?.trust_score ?? 100

  // Logic tiến trình điểm thưởng
  let nextTierText = ""
  let targetPoints = 500
  let progressPct = 0

  if (points < 500) {
    targetPoints = 500
    progressPct = Math.min(100, Math.round((points / 500) * 100))
    nextTierText = `Còn ${500 - points} điểm để đạt hạng BẠC (Giảm 5%)`
  } else if (points < 2000) {
    targetPoints = 2000
    progressPct = Math.min(100, Math.round(((points - 500) / 1500) * 100))
    nextTierText = `Còn ${2000 - points} điểm để đạt hạng VÀNG (Giảm 10%)`
  } else if (points < 5000) {
    targetPoints = 5000
    progressPct = Math.min(100, Math.round(((points - 2000) / 3000) * 100))
    nextTierText = `Còn ${5000 - points} điểm để đạt hạng BẠCH KIM (Giảm 15%)`
  } else {
    progressPct = 100
    nextTierText = "🎉 Bạn đang ở hạng cao nhất BẠCH KIM với ưu đãi 15%!"
  }

  const upcoming = bookings.filter((b) => UPCOMING_STATUSES.includes(b.status))
  const history = bookings.filter((b) => !UPCOMING_STATUSES.includes(b.status))

  const formatApiDate = (timeStr?: string) => {
    if (!timeStr) return ""
    try {
      const normalized = timeStr.includes("T") ? timeStr : timeStr.replace(" ", "T")
      const d = new Date(normalized)
      if (isNaN(d.getTime())) return timeStr
      const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
      const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      return `${date} · ${time}`
    } catch {
      return timeStr
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-28 pt-1">
      {/* 1. HERO GREETING VIP CARD */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-slate-900 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 size-52 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 size-52 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold tracking-wider uppercase">
              <span>Cổng Thành Viên AutoWash Pro</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="size-3.5" /> Trạng thái hoạt động tốt
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Xin chào, {userName} 👋
            </h1>
            <p className="text-sm font-medium text-slate-300 max-w-lg leading-relaxed">
              Quản lý phương tiện, theo dõi tiến độ chăm sóc xe theo thời gian thực và hưởng các đặc quyền ưu tiên của bạn.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Box uy tín */}
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md flex items-center justify-between sm:justify-start gap-4">
              <div className="size-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="size-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Uy tín</span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                    Thanh toán sau
                  </span>
                </div>
                <div className="font-mono text-xl font-black text-white flex items-baseline gap-1 mt-0.5">
                  <span>{trustScore}</span>
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BENTO GRID: LOYALTY CARD & QUICK BOOKING CTA */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Loyalty Progress Card (2 columns) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#1676bc] to-[#0f5a91] p-6 sm:p-7 text-white sm:col-span-2 flex flex-col justify-between shadow-lg">
          <div className="pointer-events-none absolute -top-10 -right-10 size-48 rounded-full bg-white/10 blur-2xl" />
          
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wider uppercase text-white backdrop-blur-xs">
                <Sparkles className="size-3.5 text-amber-300" />
                Điểm Thưởng Tích Lũy
              </span>
              <TierBadge tier={tier} className="bg-white text-slate-900 font-extrabold shadow-md scale-105" />
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-mono text-5xl sm:text-6xl font-black tracking-tight">{points}</span>
              <span className="text-sm font-extrabold tracking-widest text-primary-foreground/80 uppercase">POINTS</span>
            </div>
          </div>

          {/* Progress bar to next tier */}
          <div className="space-y-3 mt-8 pt-4 border-t border-white/15">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-white/95">{nextTierText}</span>
              <span className="font-mono px-2 py-0.5 rounded-md bg-white/20 text-white font-black border border-white/20 shadow-2xs">
                {progressPct}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-black/30 border border-white/10 overflow-hidden p-0.5 shadow-inner">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-white transition-all duration-500 shadow-sm" 
                style={{ width: `${Math.max(2, progressPct)}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between pt-1">
              <Button
                asChild
                size="sm"
                className="rounded-xl bg-white text-slate-900 font-bold hover:bg-white/90 shadow-md h-10 px-4 transition-transform hover:scale-105"
              >
                <Link href="/customer/diem-thuong">
                  <Gift className="size-4 mr-1.5 text-primary" />
                  Đổi Quà & Ưu Đãi
                </Link>
              </Button>
              <Link href="/customer/ho-so" className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1 underline underline-offset-4">
                Xem chỉ số hồ sơ <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Booking Card (1 column) */}
        <Link
          href="/customer/dat-lich"
          className="group relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-b from-primary/[0.04] to-background p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:border-primary hover:shadow-xl select-none"
        >
          <div>
            <div className="size-14 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <CalendarPlus className="size-7 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Lịch tiếp theo</span>
            <h3 className="text-xl font-extrabold text-foreground mt-1 group-hover:text-primary transition-colors">
              Đặt lịch rửa xe & chăm sóc ngay
            </h3>
            <p className="text-xs font-medium text-muted-foreground mt-2 leading-relaxed">
              Chọn giờ vắng khách, giữ chỗ cầu nâng trước 10 phút không cần cọc.
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-200/80 flex items-center justify-between text-sm font-extrabold text-primary">
            <span>Khởi tạo Wizard</span>
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center transition-transform group-hover:translate-x-1.5">
              <ChevronRight className="size-4 stroke-[3]" />
            </div>
          </div>
        </Link>
      </div>

      {/* 3. WIDGET MỚI CỰC HỮU DỤNG: XE ƯU TIÊN MẶC ĐỊNH CỦA BẠN */}
      <div className="rounded-3xl border-2 border-slate-200/90 bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Car className="size-5.5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <span>Phương tiện ưu tiên mặc định</span>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">
                  Sẵn sàng đặt lịch
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">Chiếc xe này sẽ được tự động chọn khi bạn vào luồng đặt lịch mới</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl font-semibold border-slate-200 hover:bg-slate-100">
            <Link href="/customer/phuong-tien">
              Quản lý danh sách xe <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>

        {defaultVehicle ? (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-900 px-3.5 py-1.5 text-white shadow-2xs">
                <span className="text-[10px] font-black text-slate-400">VN</span>
                <span className="font-mono text-base font-black tracking-widest uppercase">
                  {defaultVehicle.license_plate}
                </span>
              </div>
              <div>
                <p className="font-bold text-foreground text-base tracking-tight">
                  {defaultVehicle.brand} <span className="font-semibold text-slate-600">{defaultVehicle.model}</span>
                </p>
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mt-0.5">
                  <span>Màu: <strong className="text-foreground">{defaultVehicle.color}</strong></span>
                  <span>•</span>
                  <span>Phân hạng: <strong className="text-primary">{SIZE_LABELS[defaultVehicle.vehicle_size] || defaultVehicle.vehicle_size}</strong></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:self-center">
              <Button asChild size="sm" className="rounded-xl bg-primary text-white font-bold px-4">
                <Link href="/customer/dat-lich">
                  Rửa xe này ngay
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">Bạn chưa có phương tiện mặc định nào</p>
            <Button asChild size="sm" className="rounded-xl font-bold">
              <Link href="/customer/phuong-tien">Thêm xe mới ngay</Link>
            </Button>
          </div>
        )}
      </div>

      {/* 4. LỊCH SẮP TỚI (UPCOMING BOOKINGS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-2.5 rounded-full bg-primary animate-pulse" />
            <h2 className="text-lg font-extrabold text-foreground tracking-tight">Lịch hẹn sắp diễn ra</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {upcoming.length} lịch
            </span>
          </div>
          <Link href="/customer/lich-hen" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="size-3" />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center bg-card flex flex-col items-center justify-center space-y-3">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <CalendarCheck2 className="size-7 stroke-[2]" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">Bạn chưa có lịch hẹn nào sắp tới</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">Đặt lịch ngay hôm nay để giữ khoang chăm sóc và không phải chờ đợi</p>
            </div>
            <Button asChild className="rounded-xl font-bold px-6 shadow-md shadow-primary/20 mt-2">
              <Link href="/customer/dat-lich">Đặt lịch rửa xe ngay</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {upcoming.map((b) => (
              <div
                key={b.booking_id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border-2 border-slate-200/90 bg-card p-5.5 transition-all duration-200 hover:border-primary hover:shadow-md"
              >
                {/* Accent line on left */}
                <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-primary" />
                
                <div className="flex items-start gap-4 pl-2.5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <Sparkles className="size-6 stroke-[2]" />
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-sm font-black uppercase tracking-wider bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
                        {b.license_plate}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-base font-extrabold text-foreground tracking-tight pt-0.5">
                      {b.services_summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5 text-primary">
                        <Clock className="size-3.5" />
                        {formatApiDate(b.slot_start_time)}
                      </span>
                      {b.assigned_washer && (
                        <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                          <MapPin className="size-3.5 text-slate-500" />
                          Thợ phụ trách: <strong className="text-foreground">{b.assigned_washer}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pl-2.5 sm:pl-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                  {(b as any).final_estimate !== undefined ? (
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">Dự toán</span>
                      <span className="font-mono text-base font-black text-emerald-600">
                        {formatVND((b as any).final_estimate)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-mono font-bold text-muted-foreground">Mã đơn: #{b.booking_id.slice(0, 8).toUpperCase()}</span>
                  )}
                  
                  <Button asChild size="sm" variant="outline" className="rounded-xl font-bold border-slate-200 hover:bg-primary/5 hover:text-primary hover:border-primary/40">
                    <Link href={`/customer/lich-hen/${b.booking_id}`}>
                      Xem chi tiết <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. LỊCH SỬ GIAO DỊCH GẦN ĐÂY */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <span>Lịch sử chăm sóc gần đây</span>
          </h2>
          <Link href="/customer/lich-hen" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Xem toàn bộ lịch sử <ArrowRight className="size-3" />
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 p-8 text-center bg-card">
            <p className="text-sm font-medium text-muted-foreground">Chưa có lịch sử giao dịch dịch vụ nào hoàn thành.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-2xl border-2 border-slate-200/90 bg-card overflow-hidden shadow-xs">
            {history.map((b) => (
              <div key={b.booking_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-slate-50/80 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {b.license_plate}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="font-bold text-foreground text-sm pt-0.5">{b.services_summary}</p>
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3 text-slate-400" />
                    {formatApiDate(b.slot_start_time)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  {(b as any).final_estimate !== undefined && (
                    <span className="font-mono text-sm font-black text-foreground">
                      {formatVND((b as any).final_estimate)}
                    </span>
                  )}
                  <Button asChild size="sm" variant="ghost" className="rounded-xl font-semibold text-xs hover:bg-slate-100">
                    <Link href={`/customer/lich-hen/${b.booking_id}`}>
                      Biên nhận <ArrowRight className="size-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
