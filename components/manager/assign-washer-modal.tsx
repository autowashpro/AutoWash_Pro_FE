"use client"

import { useState, useEffect } from "react"
import { X, Check, Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCarWashers } from "@/lib/api"
import { getManagerBookingDetail, assignWasher, reassignWasher } from "@/lib/api/bookings"
import type { BookingDetail, CarWasher } from "@/lib/types"
import { toast } from "sonner"

interface AssignWasherModalProps {
  bookingId: string
  onAssign?: (washerId: string) => void
  onClose?: () => void
  isReassign?: boolean
}

const getStatusInfo = (washer: CarWasher) => {
  if (washer.status !== "AVAILABLE" && washer.tasksToday >= 5) {
    return { dot: "bg-rose-500", text: "text-rose-600", label: "Đã đủ task", canAssign: false }
  }
  if (washer.status !== "AVAILABLE") {
    return { dot: "bg-amber-500", text: "text-amber-600", label: `Đang có ${washer.completedTasksToday || 0} xe`, canAssign: true }
  }
  return { dot: "bg-emerald-500", text: "text-emerald-600", label: "Đang rảnh", canAssign: true }
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

export function AssignWasherModal({ bookingId, onAssign, onClose, isReassign = false }: AssignWasherModalProps) {
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [washers, setWashers] = useState<CarWasher[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedWasherId, setSelectedWasherId] = useState<string | null>(null)
  const [reassignReason, setReassignReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const [bookingData, washerList] = await Promise.all([
          getManagerBookingDetail(bookingId),
          getCarWashers(),
        ])
        setBooking(bookingData)
        setWashers(washerList)
      } catch (error) {
        console.error("Failed to fetch data for AssignWasherModal", error)
        // Fallback: vẫn fetch booking detail riêng
        try {
          const bookingData = await getManagerBookingDetail(bookingId)
          setBooking(bookingData)
        } catch { /* ignore */ }
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [bookingId])

  const handleAssign = async () => {
    if (!selectedWasherId) return

    try {
      setActionLoading(true)
      if (isReassign) {
        await reassignWasher(bookingId, selectedWasherId, reassignReason || "Đổi nhân viên")
        toast.success("Phân công lại nhân viên thành công")
      } else {
        await assignWasher(bookingId, selectedWasherId)
        toast.success("Phân công nhân viên thành công")
      }
      if (onAssign) onAssign(selectedWasherId)
      if (onClose) onClose()
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi phân công nhân viên")
      // Mock success for testing
      if (onAssign) onAssign(selectedWasherId)
      if (onClose) onClose()
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-lg font-bold text-foreground">
            {isReassign ? "Phân công lại" : "Phân công"} nhân viên
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-10 flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Đang tải danh sách nhân viên...</p>
            </div>
          ) : (
            <>
              {/* Booking Mini Card */}
              {booking && (
                <div className="p-6 border-b border-border">
                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-muted-foreground">Khách hàng</p>
                        <p className="font-semibold text-foreground">{booking.customer?.full_name || "Khách"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Giờ hẹn</p>
                        <p className="font-mono font-semibold text-foreground">{booking.slot_start_time}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-start pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Xe</p>
                        <p className="font-mono font-semibold text-foreground">{booking.vehicle?.license_plate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Dịch vụ</p>
                        <p className="text-sm font-medium text-foreground">{booking.services?.[0]?.service_name || booking.services?.[0]?.name || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reassign Reason */}
              {isReassign && (
                <div className="p-6 pb-0 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">LÝ DO PHÂN CÔNG LẠI</label>
                  <input
                    type="text"
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    placeholder="Nhập lý do..."
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Washers List */}
              <div className="p-6 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground mb-4">
                  DANH SÁCH NHÂN VIÊN ({washers.length})
                </p>

                {washers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Không có nhân viên nào</p>
                  </div>
                ) : (
                  washers.map((washer) => {
                    const { dot, text, label, canAssign } = getStatusInfo(washer)
                    const isSelected = selectedWasherId === washer.washerId
                    const initials = getInitials(washer.fullName)

                    return (
                      <div
                        key={washer.washerId}
                        className={`rounded-xl border-2 p-4 transition-all ${
                          canAssign ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
                        } ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => canAssign && setSelectedWasherId(washer.washerId)}
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                            {initials}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground truncate">{washer.fullName}</p>
                              {isSelected && <Check className="size-4 text-primary shrink-0" />}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <div className={`size-2 rounded-full ${dot}`} />
                                <p className={`text-xs font-semibold ${text}`}>{label}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {washer.completedTasksToday}/{washer.tasksToday} task hôm nay
                              </span>
                              {washer.averageRating !== undefined && (
                                <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                                  <Star className="size-3 fill-amber-400" />
                                  {washer.averageRating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action button */}
                          {canAssign ? (
                            <Button
                              size="sm"
                              variant={isSelected ? "default" : "outline"}
                              className="ml-2 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedWasherId(washer.washerId)
                              }}
                            >
                              {isSelected ? "Chọn ✓" : "Gán"}
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled className="ml-2 shrink-0 opacity-50">
                              Đủ task
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={actionLoading}>
            Hủy
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={!selectedWasherId || actionLoading}
            onClick={handleAssign}
          >
            {actionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            Xác nhận phân công
          </Button>
        </div>
      </div>
    </div>
  )
}
