"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Lock, Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BOOKINGS, BAYS, WASHERS, formatDate } from "@/lib/data"

const TIMES = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
]

// Mock slot data: key = "bay-1_07:00", value = { type, customerName?, service? }
const mockSlots: Record<string, any> = {
  "bay-1_08:00": { type: "booking", customerName: "Nguyễn Minh Anh", service: "Rửa xe cao cấp" },
  "bay-2_08:30": { type: "booking", customerName: "Trần Văn Tuấn", service: "Rửa xe cơ bản" },
  "bay-3_10:00": { type: "locked", reason: "Bảo trì" },
  "bay-5_14:00": { type: "maintenance", reason: "Sửa chữa cầu nâng" },
}

export default function SlotManagementPage() {
  const [selectedDate, setSelectedDate] = useState(new Date("2026-06-01"))
  const [slots, setSlots] = useState(mockSlots)
  const [onlineWashers, setOnlineWashers] = useState(5)
  const [activeBays, setActiveBays] = useState(6)
  const [showLockModal, setShowLockModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ bay: string; time: string } | null>(null)
  const [lockReason, setLockReason] = useState("")

  // Generate week dates
  const getWeekDates = () => {
    const dates = []
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates()

  const handleSlotClick = (bay: string, time: string) => {
    const slotKey = `${bay}_${time}`
    const slot = slots[slotKey]
    
    if (!slot || slot.type === "empty") {
      setSelectedSlot({ bay, time })
      setShowLockModal(true)
    }
  }

  const handleLockSlot = () => {
    if (selectedSlot) {
      const slotKey = `${selectedSlot.bay}_${selectedSlot.time}`
      setSlots(prev => ({
        ...prev,
        [slotKey]: { type: "locked", reason: lockReason || "Khóa bởi manager" }
      }))
      setShowLockModal(false)
      setLockReason("")
      setSelectedSlot(null)
    }
  }

  const handleUnlockSlot = (slotKey: string) => {
    setSlots(prev => {
      const updated = { ...prev }
      delete updated[slotKey]
      return updated
    })
  }

  const getSlotColor = (slot: any) => {
    if (!slot) return "bg-white border-slate-200"
    if (slot.type === "booking") return "bg-primary/15 border-primary/30 hover:bg-primary/20 cursor-pointer"
    if (slot.type === "locked") return "bg-slate-200 border-slate-300"
    if (slot.type === "maintenance") return "bg-rose-200 border-rose-300"
    return "bg-white border-slate-200"
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Quản lý lịch & Cầu nâng</h1>
          <p className="text-sm text-muted-foreground">Quản lý slot theo ngày, khóa slot hoặc bảo trì</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Main Content - 3 cols */}
          <div className="col-span-3 space-y-6">
            {/* Week Date Picker */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-muted-foreground">TUẦN CÓ NGÀY {selectedDate.getDate()}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, i) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString()
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`rounded-lg p-2 text-center text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-primary text-white border-2 border-primary"
                          : "bg-muted text-foreground border-2 border-transparent hover:border-primary/50"
                      }`}
                    >
                      <p className="text-xs">T{i + 2}</p>
                      <p className="text-sm font-bold">{date.getDate()}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Slot Grid */}
            <div className="rounded-2xl border border-border bg-card p-6 overflow-x-auto">
              <div className="min-w-max">
                <div className="grid gap-px" style={{ 
                  gridTemplateColumns: `80px repeat(8, 1fr)`,
                  gridAutoRows: "40px"
                }}>
                  {/* Header Row - Times */}
                  <div className="font-semibold text-xs text-muted-foreground bg-muted/50 p-2 sticky left-0">Giờ</div>
                  {BAYS.map(bay => (
                    <div key={bay.id} className="font-semibold text-xs text-center text-foreground bg-muted/50 p-2">
                      {bay.name}
                    </div>
                  ))}

                  {/* Slot Grid */}
                  {TIMES.map(time => (
                    <div key={`time-${time}`}>
                      <div className="font-mono text-xs text-muted-foreground p-2 bg-muted/20 font-semibold sticky left-0">
                        {time}
                      </div>
                      {BAYS.map(bay => {
                        const slotKey = `${bay.id}_${time}`
                        const slot = slots[slotKey]
                        return (
                          <div
                            key={slotKey}
                            onClick={() => handleSlotClick(bay.id, time)}
                            className={`border-2 p-1 text-xs flex items-center justify-center cursor-pointer transition-all group relative overflow-hidden ${getSlotColor(slot)}`}
                            title={slot ? `${slot.customerName || slot.reason}` : "Trống"}
                          >
                            {slot?.type === "booking" && (
                              <div className="text-center text-xs truncate group-hover:hidden">
                                <p className="font-semibold text-primary text-xs">·</p>
                              </div>
                            )}
                            {slot?.type === "locked" && (
                              <Lock className="size-3 text-slate-600" />
                            )}
                            {slot?.type === "maintenance" && (
                              <span className="text-xs font-bold text-rose-600">!</span>
                            )}
                            
                            {/* Hover Tooltip */}
                            {slot?.type === "booking" && (
                              <div className="absolute inset-0 bg-primary/90 text-white p-1 hidden group-hover:flex flex-col justify-center items-center text-center rounded">
                                <p className="text-xs font-semibold truncate">{slot.customerName}</p>
                                <p className="text-xs opacity-90 truncate">{slot.service}</p>
                              </div>
                            )}

                            {/* Unlock Button on Hover for Locked/Maintenance */}
                            {(slot?.type === "locked" || slot?.type === "maintenance") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUnlockSlot(slotKey)
                                }}
                                className="absolute inset-0 bg-black/80 text-white hidden group-hover:flex items-center justify-center rounded"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="rounded-xl bg-muted/50 p-4 grid grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="size-4 rounded bg-white border-2 border-slate-200" />
                <span className="text-xs text-foreground">Trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-4 rounded bg-primary/15 border-2 border-primary/30" />
                <span className="text-xs text-foreground">Có booking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-4 rounded bg-slate-200 border-2 border-slate-300" />
                <span className="text-xs text-foreground">Khóa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-4 rounded bg-rose-200 border-2 border-rose-300" />
                <span className="text-xs text-foreground">Bảo trì</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Config */}
          <div className="col-span-1">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6 sticky top-6">
              <h2 className="font-semibold text-foreground">Cấu hình hôm nay</h2>

              {/* Online Washers */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Số nhân viên online</label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOnlineWashers(Math.max(0, onlineWashers - 1))}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-bold text-primary">{onlineWashers}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOnlineWashers(Math.min(WASHERS.length, onlineWashers + 1))}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>

              {/* Active Bays */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Số cầu hoạt động</label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveBays(Math.max(0, activeBays - 1))}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-bold text-primary">{activeBays}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveBays(Math.min(BAYS.length, activeBays + 1))}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90">Lưu cấu hình</Button>

              {/* Stats */}
              <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">THỐNG KÊ NGÀY</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slots trống:</span>
                    <span className="font-semibold text-foreground">
                      {TIMES.length * BAYS.length - Object.keys(slots).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slots có booking:</span>
                    <span className="font-semibold text-foreground">
                      {Object.values(slots).filter(s => s.type === "booking").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slots khóa:</span>
                    <span className="font-semibold text-foreground">
                      {Object.values(slots).filter(s => s.type === "locked").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lock Slot Modal */}
      {showLockModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Khóa slot {selectedSlot.bay} lúc {selectedSlot.time}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Lý do khóa (tùy chọn)</label>
                <textarea
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder="VD: Bảo trì, Sửa chữa, Khóa tạm thời..."
                  className="w-full rounded-lg border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none h-20"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowLockModal(false)}>
                Hủy
              </Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleLockSlot}>
                Khóa slot
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
