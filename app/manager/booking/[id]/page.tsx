"use client"

import { useState } from "react"
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { BOOKINGS, SERVICES, formatVND, formatDate } from "@/lib/data"
import { TierBadge } from "@/components/status-badge"

const mockBooking = BOOKINGS.find(b => b.id === "b-1")!
const service = SERVICES.find(s => s.id === mockBooking.serviceId)!

const getTrustScoreColor = (score: number) => {
  if (score >= 80) return "text-success bg-success/10 border-success/30"
  if (score >= 60) return "text-primary bg-primary/10 border-primary/30"
  if (score >= 40) return "text-gold bg-gold/10 border-gold/30"
  return "text-rose-600 bg-rose-50 border-rose-200"
}

const activityLog = [
  { time: "08:00", action: "Đặt lịch thành công", actor: "Hệ thống" },
  { time: "08:05", action: "Xác nhận booking", actor: "Manager" },
  { time: "08:10", action: "Phân công: Trần Văn Hùng - Cầu 1", actor: "Manager" },
  { time: "08:15", action: "Check-in khách hàng", actor: "Trần Văn Hùng" },
]

export default function BookingDetailPage() {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelPenalty, setCancelPenalty] = useState("có")
  const [cancelReason, setCancelReason] = useState("")

  const isInProgress = mockBooking.status === "IN_PROGRESS"
  const isPending = mockBooking.status === "PENDING"
  const isAssigned = mockBooking.status === "ASSIGNED"

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/manager">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{mockBooking.code}</h1>
            <p className="text-sm text-muted-foreground">{formatDate(mockBooking.date)}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* Status Progress */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4">Tiến độ</h2>
              <div className="flex items-center justify-between">
                {["PENDING", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED"].map((s, i) => (
                  <div key={s} className="flex flex-col items-center flex-1">
                    <div className={`size-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                      ["PENDING", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED"].indexOf(mockBooking.status) >= i
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </div>
                    <span className="text-xs text-center mt-2 text-muted-foreground">{
                      ["Chờ", "Xác nhận", "Phân công", "Đang làm", "Hoàn thành"][i]
                    }</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4">Khách hàng</h2>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-foreground">{mockBooking.customerName}</p>
                  <p className="text-sm text-muted-foreground">0987654321</p>
                </div>
                <div className="flex gap-2">
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold border ${getTrustScoreColor(65)}`}>
                    Trust: 65
                  </div>
                  <TierBadge tier="GOLD" />
                </div>
              </div>
            </div>

            {/* Vehicle Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4">Phương tiện</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Biển số</p>
                  <p className="font-mono text-lg font-bold text-foreground">{mockBooking.vehicle.plate}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Hãng/Model</p>
                    <p className="font-medium text-foreground">Toyota Camry</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cỡ</p>
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {mockBooking.vehicle.size}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Màu sắc</p>
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded-full border border-border" style={{ backgroundColor: mockBooking.vehicle.colorHex || "#ffffff" }} />
                    <span className="text-sm font-medium text-foreground">{mockBooking.vehicle.color}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Dịch vụ</h2>
                {isInProgress && <Button variant="outline" size="sm">Chỉnh sửa</Button>}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-foreground">{mockBooking.serviceName}</p>
                  <p className="text-sm text-muted-foreground">~{service?.durationMinutes || 50} phút</p>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Giá dịch vụ</span>
                    <span className="font-mono font-bold text-lg text-foreground">{formatVND(mockBooking.price)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Phân công</h2>
                {!isInProgress && <Button variant="outline" size="sm">Phân công lại</Button>}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nhân viên</p>
                  <p className="font-medium text-foreground">{mockBooking.washerName || "Chưa phân công"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cầu nâng</p>
                  <p className="font-medium text-foreground">{mockBooking.bayId ? `Cầu ${mockBooking.bayId.split('-')[1]}` : "Chưa chỉ định"}</p>
                </div>
              </div>
            </div>

            {/* Inspection Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4">Kiểm tra xe</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Trước dịch vụ</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    <CheckCircle2 className="size-3.5" />
                    Hoàn thành
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sau dịch vụ</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                    <Clock className="size-3.5" />
                    Chờ xác nhận
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">Xem biên bản</Button>
              </div>
            </div>

            {/* Payment Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-4">Thanh toán</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Tổng tiền</span>
                  <span className="font-mono font-bold text-lg text-foreground">{formatVND(mockBooking.price)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Phương thức</span>
                  <span className="text-sm font-medium text-foreground">Tiền mặt</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Trạng thái</span>
                  <span className="inline-flex rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                    Chờ thanh toán
                  </span>
                </div>
                <Button className="w-full mt-4 bg-primary hover:bg-primary/90">Xác nhận thanh toán</Button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-1 space-y-6">
            {/* Primary Action */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
              {isPending && <Button className="w-full h-11 bg-primary hover:bg-primary/90">Xác nhận booking</Button>}
              {isAssigned && <Button className="w-full h-11 bg-primary hover:bg-primary/90">Check-in khách</Button>}
              {isInProgress && <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700">Đánh dấu hoàn thành</Button>}
            </div>

            {/* Cancel Button */}
            <Button
              variant="outline"
              className="w-full border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={() => setShowCancelDialog(true)}
            >
              Hủy lịch
            </Button>

            {/* Activity Log */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-4">Hoạt động</h3>
              <div className="space-y-3">
                {activityLog.map((log, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-2 rounded-full bg-primary" />
                      {i < activityLog.length - 1 && <div className="w-px h-6 bg-border mt-1" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-mono text-muted-foreground">{log.time}</p>
                      <p className="text-sm font-medium text-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold text-foreground mb-4">Xác nhận hủy lịch</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Loại hủy</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30">
                    <input type="radio" checked={cancelPenalty === "có"} onChange={() => setCancelPenalty("có")} className="size-4 accent-primary" />
                    <span className="text-sm font-medium text-foreground">Có phạt (50% giá dịch vụ)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30">
                    <input type="radio" checked={cancelPenalty === "không"} onChange={() => setCancelPenalty("không")} className="size-4 accent-primary" />
                    <span className="text-sm font-medium text-foreground">Không phạt</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Lý do</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy..."
                  className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCancelDialog(false)}>Đóng</Button>
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700">Xác nhận hủy</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
