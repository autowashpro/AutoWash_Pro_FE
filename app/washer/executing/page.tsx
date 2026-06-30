"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BOOKINGS } from "@/lib/data"
import { useSearchParams } from "next/navigation"
import { getWasherTaskDetail } from "@/lib/api/bookings"

function ExecutingContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return
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
            license_plate: fallback.vehicle.plate,
            vehicle_size: fallback.vehicle.size,
            services: [fallback.serviceName],
            branch_name: "Chi nhánh Gò Vấp"
          })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [bookingId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 pb-20">
        <p className="text-muted-foreground">Không tìm thấy thông tin công việc</p>
        <Button asChild variant="outline">
          <Link href="/washer">Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header status */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm p-4">
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2 animate-pulse">
            <span className="text-2xl">🔄</span>
            <span className="text-sm font-semibold text-gold">Đang thực hiện</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Booking Card */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-foreground">{booking.license_plate}</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {booking.vehicle_size}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {booking.services?.map((svc: string, i: number) => (
                <p key={i} className="text-sm font-medium text-foreground">{svc}</p>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {booking.branch_name}
            </div>
          </div>
        </div>

        {/* Clean Status Card (Replacing checklist) */}
        <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-4 shadow-[var(--shadow-card)]">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl mx-auto animate-pulse">
            🚿
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Dịch vụ đang được xử lý</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Washer đang tiến hành làm sạch xe theo đúng quy chuẩn. Vui lòng bấm nút hoàn tất bên dưới khi đã xong công việc để bàn giao xe.
            </p>
          </div>
        </div>
      </div>

      {/* Complete Button Footer (Always enabled) */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm p-4">
        <Link href={`/washer/completed?bookingId=${bookingId}`}>
          <button
            className="w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-base font-semibold text-white shadow-[0_4px_24px_rgba(16,185,129,0.25)] transition-all duration-200 hover:shadow-[0_8px_40px_rgba(16,185,129,0.35)] hover:-translate-y-0.5"
          >
            Hoàn tất và kiểm tra lại xe →
          </button>
        </Link>
      </div>
    </div>
  )
}

export default function ExecutingPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <ExecutingContent />
    </Suspense>
  )
}
