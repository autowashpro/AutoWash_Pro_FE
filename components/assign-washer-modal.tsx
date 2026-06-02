"use client"

import { useState } from "react"
import { X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WASHERS, BOOKINGS, formatDate } from "@/lib/data"

interface AssignWasherModalProps {
  bookingId: string
  onAssign?: (washerId: string) => void
  onClose?: () => void
}

const mockBooking = BOOKINGS.find(b => b.id === "b-1")!

const getStatusColor = (status: string, jobsToday: number) => {
  if (status === "offline") return { dot: "bg-muted", text: "text-muted-foreground", label: "Ngoài tuyến" }
  if (jobsToday >= 5) return { dot: "bg-rose-500", text: "text-rose-600", label: "Đã đủ task" }
  if (status === "busy") return { dot: "bg-gold", text: "text-gold", label: `Đang có ${jobsToday} xe` }
  return { dot: "bg-success", text: "text-success", label: "Đang rảnh" }
}

export function AssignWasherModal({ bookingId, onAssign, onClose }: AssignWasherModalProps) {
  const [selectedWasherId, setSelectedWasherId] = useState<string | null>(null)

  const handleAssign = () => {
    if (selectedWasherId && onAssign) {
      onAssign(selectedWasherId)
    }
  }

  const canAssignWasher = (washer: typeof WASHERS[0]) => {
    return washer.status !== "offline" && washer.jobsToday < 5
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-lg font-bold text-foreground">Gán nhân viên cho booking {mockBooking.code}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Booking Mini Card */}
          <div className="p-6 border-b border-border">
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">Khách hàng</p>
                  <p className="font-semibold text-foreground">{mockBooking.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Giờ hẹn</p>
                  <p className="font-mono font-semibold text-foreground">{mockBooking.timeSlot}</p>
                </div>
              </div>
              <div className="flex justify-between items-start pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Xe</p>
                  <p className="font-mono font-semibold text-foreground">{mockBooking.vehicle.plate}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Dịch vụ</p>
                  <p className="text-sm font-medium text-foreground">{mockBooking.serviceName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Washers List */}
          <div className="p-6 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-4">DANH SÁCH NHÂN VIÊN</p>
            {WASHERS.map(washer => {
              const { dot, text, label } = getStatusColor(washer.status, washer.jobsToday)
              const canAssign = canAssignWasher(washer)
              const isSelected = selectedWasherId === washer.id

              return (
                <div
                  key={washer.id}
                  className={`rounded-xl border-2 p-4 transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => canAssign && setSelectedWasherId(washer.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Avatar Placeholder */}
                      <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                        {washer.name.split(" ").map(n => n[0]).join("")}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{washer.name}</p>
                          {isSelected && (
                            <Check className="size-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`size-2 rounded-full ${dot}`} />
                          <p className={`text-xs font-medium ${text}`}>{label}</p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground">{washer.jobsToday} task hôm nay</p>
                        </div>
                      </div>
                    </div>

                    {canAssign && (
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className="ml-2 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedWasherId(washer.id)
                        }}
                      >
                        {isSelected ? "Chọn ✓" : "Gán"}
                      </Button>
                    )}

                    {!canAssign && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="ml-2 flex-shrink-0 opacity-50"
                      >
                        Không thể
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={!selectedWasherId}
            onClick={handleAssign}
          >
            Xác nhận phân công
          </Button>
        </div>
      </div>
    </div>
  )
}
