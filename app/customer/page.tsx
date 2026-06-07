"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarPlus, Clock, MapPin, Sparkles, Gift, ChevronRight, Loader2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge, TierBadge } from "@/components/status-badge"
import { getMyProfile, getMyBookings } from "@/lib/api"
import type { CustomerProfile, BookingSummary } from "@/lib/types"
import { formatVND } from "@/lib/data"
import { MonoText } from "@/components/shared/mono-text"

const UPCOMING_STATUSES = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "ASSIGNED",
  "CHECKED_IN",
  "VEHICLE_INSPECTED",
  "CUSTOMER_CONFIRMED_CONDITION",
  "IN_PROGRESS",
]

export default function CustomerDashboardPage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [bookings, setBookings] = useState<BookingSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true)

      // 1. Fetch Profile
      // TODO: connect API
      try {
        const profileData = await getMyProfile()
        setProfile(profileData)
      } catch (error) {
        console.warn("Failed to fetch customer profile, using mock fallback:", error)
        setProfile({
          user_id: "u-1",
          full_name: "Nguyễn Minh Anh",
          email: "minhanh@email.com",
          phone: "0987654321",
          membership_tier: "GOLD",
          total_points: 412,
          trust_score: 95,
          total_spending_12m: 12500000,
          tier_review_at: "2026-12-31",
          booking_window_days: 7
        })
      }

      // 2. Fetch Bookings
      // TODO: connect API
      try {
        const bookingsData = await getMyBookings({ limit: 10 })
        if (bookingsData && bookingsData.data) {
          setBookings(bookingsData.data)
        }
      } catch (error) {
        console.warn("Failed to fetch bookings, using mock fallback:", error)
        // Fallback to Nguyễn Minh Anh's mock bookings from lib/data.ts
        const mockBookings: BookingSummary[] = [
          {
            booking_id: "b-1",
            customer_name: "Nguyễn Minh Anh",
            license_plate: "51A-123.45",
            vehicle_size: "MEDIUM",
            services_summary: "Rửa xe cao cấp",
            slot_start_time: "2026-06-01 08:00:00",
            booking_type: "WASH",
            num_slots: 1,
            status: "IN_PROGRESS" as any,
            booking_source: "ONLINE"
          },
          {
            booking_id: "b-5",
            customer_name: "Nguyễn Minh Anh",
            license_plate: "51A-123.45",
            vehicle_size: "MEDIUM",
            services_summary: "Rửa xe tiêu chuẩn",
            slot_start_time: "2026-05-28 14:00:00",
            booking_type: "WASH",
            num_slots: 1,
            status: "COMPLETED" as any,
            booking_source: "ONLINE"
          }
        ]
        setBookings(mockBookings)
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu tổng quan...</p>
        </div>
      </div>
    )
  }

  // Fallback default username if not loaded
  const userName = profile?.full_name || "Khách hàng"
  const points = profile?.total_points ?? 0
  const tier = profile?.membership_tier || "MEMBER"
  const trustScore = profile?.trust_score ?? 100

  // Calculate points to next tier dynamically
  let nextTierText = ""
  if (points < 500) {
    nextTierText = `Còn ${500 - points} điểm nữa để đạt hạng Bạc và nhận ưu đãi 5%.`
  } else if (points < 2000) {
    nextTierText = `Còn ${2000 - points} điểm nữa để đạt hạng Vàng và nhận ưu đãi 10%.`
  } else if (points < 5000) {
    nextTierText = `Còn ${5000 - points} điểm nữa để đạt hạng Bạch Kim và nhận ưu đãi 15%.`
  } else {
    nextTierText = "Bạn đang ở hạng cao nhất (Bạch Kim) với ưu đãi 15%!"
  }

  // Filter fetched bookings
  const upcoming = bookings.filter((b) => UPCOMING_STATUSES.includes(b.status))
  const history = bookings.filter((b) => !UPCOMING_STATUSES.includes(b.status))

  // Parse custom format helper for API date
  const formatApiDate = (timeStr?: string) => {
    if (!timeStr) return ""
    try {
      // API might return "2026-06-01 09:00" or ISO format
      const normalized = timeStr.includes("T") ? timeStr : timeStr.replace(" ", "T")
      const d = new Date(normalized)
      if (isNaN(d.getTime())) return timeStr
      const formattedDate = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
      const formattedTime = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      return `${formattedDate} · ${formattedTime}`
    } catch {
      return timeStr
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Xin chào, {userName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi lịch rửa xe và ưu đãi thành viên của bạn.
          </p>
        </div>
        {/* Quick Trust Score display */}
        <div className="mt-2 sm:mt-0 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm">
          <Shield className="size-4 text-primary" />
          <span className="text-muted-foreground">Điểm uy tín:</span>
          <span className="font-mono font-bold text-foreground">{trustScore}</span>
        </div>
      </div>

      {/* Loyalty highlight */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground sm:col-span-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm/relaxed opacity-80">Điểm thưởng hiện có</p>
              <p className="font-mono text-4xl font-bold tracking-tight">{points}</p>
            </div>
            <TierBadge tier={tier} className="bg-primary-foreground/15 text-primary-foreground" />
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-xs opacity-80 text-pretty">
              {nextTierText}
            </p>
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="shrink-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link href="/customer/diem-thuong">
                <Gift className="size-4" />
                Đổi quà
              </Link>
            </Button>
          </div>
        </div>

        <Link
          href="/customer/dat-lich"
          className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <CalendarPlus className="size-5" />
          </span>
          <div className="mt-4">
            <p className="font-semibold text-foreground">Đặt lịch mới</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-primary">
              Bắt đầu ngay
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </p>
          </div>
        </Link>
      </div>

      {/* Upcoming */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Lịch sắp tới</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Bạn chưa có lịch hẹn nào sắp tới.
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div
                key={b.booking_id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Sparkles className="size-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{b.services_summary}</p>
                    <p className="text-sm text-muted-foreground">
                      <MonoText className="text-primary font-semibold">{b.license_plate}</MonoText>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {formatApiDate(b.slot_start_time)}
                      </span>
                      {b.assigned_washer && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          Thợ phụ trách: {b.assigned_washer}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <StatusBadge status={b.status} />
                  {/* Displays final price if available in the API response */}
                  {(b as any).final_estimate !== undefined && (
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {formatVND((b as any).final_estimate)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Lịch sử gần đây</h2>
        {history.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Chưa có lịch sử giao dịch.
          </p>
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {history.map((b) => (
              <div key={b.booking_id} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium text-foreground">{b.services_summary}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatApiDate(b.slot_start_time)} · <MonoText className="text-xs">{b.license_plate}</MonoText>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={b.status} />
                  {(b as any).final_estimate !== undefined && (
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {formatVND((b as any).final_estimate)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
