"use client"

import { ArrowLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BOOKINGS, CUSTOMERS_LOW_TRUST, formatVND, formatDate } from "@/lib/data"

const mockCustomer = CUSTOMERS_LOW_TRUST[0]

const getTrustScoreColor = (score: number) => {
  if (score >= 80) return { bg: "bg-success/10", text: "text-success", border: "border-success/30" }
  if (score >= 60) return { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" }
  if (score >= 40) return { bg: "bg-gold/10", text: "text-gold", border: "border-gold/30" }
  return { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" }
}

const getTrustScoreLabel = (score: number) => {
  if (score >= 80) return "Xuất sắc"
  if (score >= 60) return "Tốt"
  if (score >= 40) return "Bình thường"
  return "Cần cảnh báo"
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case "GOLD":
      return "bg-gold/10 text-gold border-gold/30"
    case "SILVER":
      return "bg-slate-100 text-slate-700 border-slate-300"
    case "BRONZE":
      return "bg-amber-100/50 text-amber-700 border-amber-300"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

// Mock data
const customerEmail = "khach@gmail.com"
const registeredDate = "2026-01-15"
const tier = "GOLD"
const loyaltyPoints = 1250
const totalSpent = 5_750_000

const recentBookings = BOOKINGS.slice(0, 5).map(b => ({
  id: b.id,
  code: b.code,
  service: b.serviceName,
  date: b.date,
  status: b.status,
}))

const penaltyHistory = [
  { date: "2026-05-20", reason: "Xe bị hỏng hư", score: -15 },
  { date: "2026-04-10", reason: "Không giữ giờ", score: -10 },
]

const statusBadgeColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-gold/10 text-gold"
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700"
    case "ASSIGNED":
      return "bg-primary/10 text-primary"
    case "IN_PROGRESS":
      return "bg-primary/10 text-primary"
    case "COMPLETED":
      return "bg-success/10 text-success"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    ASSIGNED: "Đã phân công",
    IN_PROGRESS: "Đang làm",
    COMPLETED: "Hoàn thành",
  }
  return labels[status] || status
}

export default function CustomerProfilePage() {
  const colors = getTrustScoreColor(mockCustomer.trustScore)
  const trustLabel = getTrustScoreLabel(mockCustomer.trustScore)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/manager/khach-hang">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hồ sơ khách hàng</h1>
            <p className="text-sm text-muted-foreground">{mockCustomer.name}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Personal Info - Row 1 Col 1 */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xs font-semibold text-muted-foreground mb-4">THÔNG TIN CÁ NHÂN</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Họ tên</p>
                <p className="font-semibold text-foreground text-lg">{mockCustomer.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm text-foreground">{customerEmail}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Số điện thoại</p>
                <p className="font-mono text-sm font-semibold text-foreground">{mockCustomer.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ngày đăng ký</p>
                <p className="text-sm text-foreground">{formatDate(registeredDate)}</p>
              </div>
            </div>
          </div>

          {/* Trust Score - Row 1 Col 2-3 (Tall) */}
          <div className={`col-span-2 rounded-2xl border ${colors.border} ${colors.bg} p-6 row-span-2 flex flex-col`}>
            <h2 className="text-xs font-semibold text-muted-foreground mb-4">TRUST SCORE</h2>
            <div className="flex items-end gap-6 mb-6 flex-1">
              <div className="flex-1">
                <div className={`text-6xl font-bold ${colors.text}`}>{mockCustomer.trustScore}</div>
                <p className={`text-sm font-semibold ${colors.text} mt-2`}>{trustLabel}</p>
              </div>
              <div className="flex-1">
                <div className="text-right">
                  <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${colors.bg}`}
                      style={{ width: `${(mockCustomer.trustScore / 100) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Tiến độ: {mockCustomer.trustScore}/100</p>
                </div>
              </div>
            </div>

            {/* Penalty History */}
            <div className="border-t border-border/50 pt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Lịch sử phạt</p>
              <div className="space-y-2">
                {penaltyHistory.length > 0 ? (
                  penaltyHistory.map((penalty, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-muted-foreground">{penalty.date}</p>
                        <p className="text-foreground font-medium">{penalty.reason}</p>
                      </div>
                      <span className="font-semibold text-rose-600">-{penalty.score}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Không có lịch sử phạt</p>
                )}
              </div>
            </div>
          </div>

          {/* Loyalty - Row 2 Col 1 */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xs font-semibold text-muted-foreground mb-4">LOYALTY</h2>
            <div className="space-y-4">
              <div>
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${getTierColor(tier)}`}>
                  {tier} TIER
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tổng điểm</p>
                <p className="text-2xl font-bold text-primary">{loyaltyPoints.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tổng chi tiêu</p>
                <p className="text-lg font-bold text-foreground">{formatVND(totalSpent)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings - Full Width */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground">LỊCH SỬ ĐẶT LỊCH (5 LẦN GẦN NHẤT)</h2>
            <Link href="#">
              <Button variant="outline" size="sm" className="gap-1">
                <span>Xem tất cả</span>
                <ChevronRight className="size-3" />
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-left font-semibold">Mã booking</th>
                  <th className="px-4 py-3 text-left font-semibold">Dịch vụ</th>
                  <th className="px-4 py-3 text-left font-semibold">Ngày</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/manager/booking/${booking.id}`}>
                        <span className="font-mono text-xs font-semibold text-primary hover:underline">
                          {booking.code}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground">{booking.service}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(booking.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeColor(booking.status)}`}>
                        {statusLabel(booking.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
