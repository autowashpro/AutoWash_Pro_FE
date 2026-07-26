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

  const userName = profile?.full_name || "Thanh Đạt"
  const points = profile?.total_points ?? 0
  const tier = profile?.membership_tier || "MEMBER"
  const trustScore = profile?.trust_score ?? 100

  // Lấy DỮ LIỆU THẬT cho Tổng chi tiêu: Lấy từ profile.total_spending_12m hoặc tổng hóa đơn đã hoàn thành
  const completedSpending = bookings
    .filter((b) => b.status === "COMPLETED" || b.status === "PAID" || b.status === "CLOSED")
    .reduce((acc, b) => acc + ((b as any).final_estimate || (b as any).total_price || 0), 0)
  const totalSpent = profile?.total_spending_12m || completedSpending || 0

  // Logic tiến trình thăng hạng dựa trên TỔNG CHI TIÊU THỰC TẾ LŨY KẾ (VND)
  let nextTierText = ""
  let progressPct = 0

  if (tier === "PLATINUM") {
    progressPct = 100
    nextTierText = `🎉 Độc quyền Hạng BẠCH KIM cao nhất (Tổng chi tiêu thực tế: ${formatVND(totalSpent)})`
  } else if (tier === "GOLD") {
    const target = 10000000
    const need = Math.max(0, target - totalSpent)
    progressPct = Math.min(99, Math.round((totalSpent / target) * 100))
    nextTierText = need > 0 ? `Chi tiêu thêm ${formatVND(need)} để thăng Hạng BẠCH KIM (Giảm 15%)` : "Đã đủ hạn mức chi tiêu thăng Hạng BẠCH KIM"
  } else if (tier === "SILVER") {
    const target = 5000000
    const need = Math.max(0, target - totalSpent)
    progressPct = Math.min(99, Math.round((totalSpent / target) * 100))
    nextTierText = need > 0 ? `Chi tiêu thêm ${formatVND(need)} để thăng Hạng VÀNG (Giảm 10%)` : "Đã đủ hạn mức chi tiêu thăng Hạng VÀNG"
  } else {
    const target = 2000000
    const need = Math.max(0, target - totalSpent)
    progressPct = Math.min(99, Math.round((totalSpent / target) * 100))
    nextTierText = need > 0 ? `Chi tiêu thêm ${formatVND(need)} để thăng Hạng BẠC (Giảm 5%)` : "Đã đủ hạn mức chi tiêu thăng Hạng BẠC"
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

function renderTimeGreeting(fullName: string) {
  const cleanName = fullName.replace(/^(anh\/chị|anh|chị)\s+/i, "").trim() || "Thanh Đạt"
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return (
      <>
        Sáng nay xế cưng đã sẵn sàng{" "}
        <span className="text-amber-300 font-extrabold underline decoration-amber-400/50 underline-offset-4">
          "tắm mát"
        </span>{" "}
        chưa, anh <span className="text-amber-300 font-extrabold">{cleanName}</span>? 🚗✨
      </>
    )
  }
  if (hour >= 12 && hour < 18) {
    return (
      <>
        Chiều rồi,{" "}
        <span className="text-amber-300 font-extrabold underline decoration-amber-400/50 underline-offset-4">
          giữ chỗ cầu nâng
        </span>{" "}
        tân trang xế cưng thôi anh <span className="text-amber-300 font-extrabold">{cleanName}</span>! 🚿⚡
      </>
    )
  }
  return (
    <>
      Tối nay vi vu phố xá, xế cưng của anh <span className="text-amber-300 font-extrabold">{cleanName}</span> đã đủ{" "}
      <span className="text-amber-300 font-extrabold underline decoration-amber-400/50 underline-offset-4">
        kiêu hãnh
      </span>{" "}
      chưa? ✨🚘
    </>
  )
}

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-background to-background dark:from-slate-950 -m-4 md:-m-8 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8 pb-28 pt-1">
        {/* 1. HERO GREETING VIP CARD (Tối ưu thoáng đạt, gọn gàng, tích hợp Nút Action & Text Điểm Nhấn) */}
        <div className={cn(
          "relative overflow-hidden rounded-3xl border-2 p-6 sm:p-8 text-white shadow-2xl transition-all duration-300",
          tier === "PLATINUM" && "border-purple-500/60 bg-gradient-to-br from-purple-950 via-slate-950 to-zinc-950 shadow-purple-950/40",
          tier === "GOLD" && "border-amber-400/60 bg-gradient-to-br from-amber-950 via-stone-950 to-zinc-950 shadow-amber-950/40",
          tier === "SILVER" && "border-slate-300/60 bg-gradient-to-br from-slate-900 via-zinc-950 to-slate-950 shadow-slate-950/30",
          tier === "MEMBER" && "border-sky-400/60 bg-gradient-to-br from-blue-950 via-slate-950 to-slate-950 shadow-blue-950/30"
        )}>
          <div className="pointer-events-none absolute -right-12 -top-12 size-60 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 size-60 rounded-full bg-amber-500/15 blur-3xl animate-pulse" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-wider uppercase">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/15 backdrop-blur-md">
                  <Sparkles className="size-3.5 text-amber-400" /> HẠNG {tier} VIP
                </span>
                <span className="text-white/40">•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="size-3.5" /> UY TÍN {trustScore}/100 (Thanh toán sau)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                {renderTimeGreeting(userName)}
              </h1>
              
              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                Giữ chỗ cầu nâng 1-click · Ưu tiên thợ 5★ · Trải nghiệm dịch vụ chăm sóc xe đạt chuẩn Premium.
              </p>
            </div>

            <div className="shrink-0 pt-2 md:pt-0">
              <Button asChild size="lg" className="group rounded-2xl bg-white text-slate-950 font-extrabold hover:bg-white/95 shadow-xl shadow-black/30 h-12 px-6 transition-all duration-300 hover:scale-105 border border-white/20">
                <Link href="/customer/dat-lich">
                  Đặt Lịch Rửa Xe Ngay <ArrowRight className="size-4 ml-2 text-primary stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 2. BENTO GRID 2 CỘT: XE MẶC ĐỊNH & THẺ VIP METALLIC POINTS */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Thẻ 1: Xe ưu tiên mặc định (Double-Bezel Garage Card với 3D Glow-on-Hover) */}
          <div className="p-1.5 rounded-3xl bg-slate-200/70 dark:bg-slate-900/60 border border-slate-300/70 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-300">
            <div className="p-5.5 rounded-[1.35rem] bg-card border border-border/50 flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Car className="size-5.5 stroke-[2]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Xe ưu tiên mặc định
                      </span>
                      <h3 className="text-base font-extrabold text-foreground tracking-tight mt-0.5">
                        {defaultVehicle ? `${defaultVehicle.brand} ${defaultVehicle.model}` : "Chưa chọn xe mặc định"}
                      </h3>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="rounded-xl font-bold text-xs hover:bg-slate-100">
                    <Link href="/customer/phuong-tien">
                      Quản lý xe <ArrowRight className="size-3 ml-1" />
                    </Link>
                  </Button>
                </div>

                {defaultVehicle ? (
                  <div className="mt-4 space-y-3.5">
                    {/* Thẻ biển số màu Slate kim loại nguyên khối với 3D Ambient Glow-on-Hover */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md transition-all duration-300 hover:ring-2 hover:ring-sky-400/50 hover:shadow-sky-950/40">
                      <div className="inline-flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400">VN</span>
                        <span className="font-mono text-lg font-black tracking-widest uppercase text-white">
                          {defaultVehicle.license_plate}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold bg-primary/20 text-sky-300 border border-sky-400/30 px-2.5 py-1 rounded-lg uppercase">
                        Phân hạng {SIZE_LABELS[defaultVehicle.vehicle_size] || defaultVehicle.vehicle_size}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                      <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
                        <span className="text-muted-foreground block text-[11px]">Màu ngoại thất:</span>
                        <strong className="text-foreground text-xs font-bold mt-0.5 block">{defaultVehicle.color || "Trắng Pearl"}</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
                        <span className="text-muted-foreground block text-[11px]">Cầu nâng tương thích:</span>
                        <strong className="text-primary text-xs font-bold mt-0.5 block">Nâng gầm 4 trụ (WASH)</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-5 rounded-2xl border border-dashed border-slate-300 bg-secondary/30 text-center space-y-2">
                    <p className="text-sm font-semibold text-foreground">Bạn chưa cài đặt phương tiện mặc định nào</p>
                    <Button asChild size="sm" className="rounded-xl font-bold">
                      <Link href="/customer/phuong-tien">Thêm xe mới ngay</Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="pt-3.5 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Tự động điền khi đặt lịch</span>
                <Button asChild size="sm" className="group rounded-xl bg-primary text-white font-bold px-5 shadow-md shadow-primary/20 hover:scale-105 transition-transform">
                  <Link href="/customer/dat-lich">
                    Rửa xe này ngay <ArrowRight className="size-3.5 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Thẻ 2: Metallic VIP Loyalty Card (Bento với Iridescent Light Flare Shimmer on hover) */}
          <div className={cn(
            "group relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-300 border-2",
            tier === "PLATINUM" && "bg-gradient-to-br from-purple-950 via-slate-950 to-zinc-950 border-purple-400/50 shadow-purple-950/40",
            tier === "GOLD" && "bg-gradient-to-br from-amber-950 via-stone-950 to-zinc-950 border-amber-400/50 shadow-amber-950/40",
            tier === "SILVER" && "bg-gradient-to-br from-slate-900 via-zinc-950 to-slate-950 border-slate-300/50 shadow-slate-950/30",
            tier === "MEMBER" && "bg-gradient-to-br from-blue-950 via-slate-950 to-slate-950 border-sky-400/50 shadow-blue-950/30"
          )}>
            {/* Iridescent Light Flare Shimmer on Hover */}
            <div className="pointer-events-none absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-pulse group-hover:opacity-100 transition-all duration-700" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-50" />
            <div className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-white/10 blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wider uppercase text-white backdrop-blur-md border border-white/20">
                  <Sparkles className="size-3.5 text-amber-300" />
                  Thẻ VIP Metallic
                </span>
                <TierBadge tier={tier} className="bg-white text-slate-900 font-extrabold shadow-md scale-105" />
              </div>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-mono text-5xl sm:text-6xl font-black tracking-tight drop-shadow-md">{points}</span>
                <span className="text-sm font-extrabold tracking-widest text-white/80 uppercase">POINTS</span>
              </div>
            </div>

            {/* Progress bar to next tier */}
            <div className="relative z-10 space-y-3 mt-6 pt-4 border-t border-white/15">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white/95">{nextTierText}</span>
                <span className="font-mono px-2 py-0.5 rounded-md bg-white/20 text-white font-black border border-white/20 shadow-2xs">
                  {progressPct}%
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-black/40 border border-white/15 overflow-hidden p-0.5 shadow-inner">
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
  </div>
  )
}
