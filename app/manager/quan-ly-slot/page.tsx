"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Lock, Trash2, Plus, Minus, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BAYS, WASHERS } from "@/lib/data"
import { getManagerBookings, getManagerSlots, updateSlot } from "@/lib/api/bookings"
import type { BookingSummary, SlotDetail } from "@/lib/types"
import { toast } from "sonner"

const TIMES = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
]

export default function SlotManagementPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    d.setHours(0,0,0,0)
    return d
  })
  
  const [bookings, setBookings] = useState<BookingSummary[]>([])
  const [slots, setSlots] = useState<SlotDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [savingConfig, setSavingConfig] = useState(false)

  // Lock slots — persist vào BE qua updateSlot (status: BLOCKED)
  const [lockedSlots, setLockedSlots] = useState<Record<string, { reason: string; slot_id?: string }>>({})

  const [onlineWashers, setOnlineWashers] = useState(5)
  const [activeBays, setActiveBays] = useState(BAYS.length)
  const [showLockModal, setShowLockModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ bay: string; time: string } | null>(null)
  const [lockReason, setLockReason] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const dateStr = selectedDate.toISOString().split("T")[0]
      const [bookingRes, slotRes] = await Promise.allSettled([
        getManagerBookings({ date: dateStr, limit: 100 }),
        getManagerSlots(dateStr),
      ])

      // Bookings
      if (bookingRes.status === "fulfilled") {
        const bookingsData = bookingRes.value.data
        const bookingsArray: BookingSummary[] = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.items || []
        setBookings(bookingsArray)
      } else {
        console.warn("getManagerBookings failed", bookingRes.reason)
        setBookings([])
      }

      // Slots — init lock state từ BE (status === BLOCKED)
      if (slotRes.status === "fulfilled" && slotRes.value.length > 0) {
        setSlots(slotRes.value)
        const beLockedSlots: Record<string, { reason: string; slot_id: string }> = {}
        slotRes.value.forEach(s => {
          if (s.status === "BLOCKED") {
            // Map slot_id -> key dạng bay_time (approximate, dùng start_time)
            const key = `bay-1_${s.start_time}` // BE chưa trả bay info chi tiết
            beLockedSlots[key] = { reason: "Khóa bửi manager", slot_id: s.slot_id }
          }
        })
        if (Object.keys(beLockedSlots).length > 0) {
          setLockedSlots(beLockedSlots)
        }
        // Init config từ slot đầu tiên nếu có
        const firstSlot = slotRes.value[0]
        if (firstSlot) {
          setOnlineWashers(firstSlot.washers_online || onlineWashers)
          setActiveBays(firstSlot.active_bays || BAYS.length)
        }
      } else {
        setSlots([])
      }
    } catch (error) {
      console.error("Failed to fetch slot data", error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

  const handleSlotClick = (bay: string, time: string, isOccupied: boolean) => {
    if (!isOccupied) {
      setSelectedSlot({ bay, time })
      setShowLockModal(true)
    }
  }

  const handleLockSlot = async () => {
    if (selectedSlot) {
      const slotKey = `${selectedSlot.bay}_${selectedSlot.time}`
      // Tìm slot_id khớp với time từ slots list
      const matchedSlot = slots.find(s => s.start_time === selectedSlot.time)
      const newLocked = {
        ...lockedSlots,
        [slotKey]: { reason: lockReason || "Khóa bửi manager", slot_id: matchedSlot?.slot_id }
      }
      setLockedSlots(newLocked)
      setShowLockModal(false)
      setLockReason("")
      setSelectedSlot(null)
      // Gọi BE nếu có slot_id
      if (matchedSlot?.slot_id) {
        try {
          await updateSlot(matchedSlot.slot_id, { status: "BLOCKED" })
          toast.success(`Đã khóa slot ${selectedSlot.time}`)
        } catch (err) {
          console.warn("updateSlot BLOCKED failed (lưu local):", err)
          toast.warning("Khóa slot lưu local — chưa đồng bộ với server")
        }
      } else {
        toast.success(`Đã khóa slot ${selectedSlot.time} (local)`)
      }
    }
  }

  const handleUnlockSlot = async (slotKey: string) => {
    const locked = lockedSlots[slotKey]
    setLockedSlots(prev => {
      const updated = { ...prev }
      delete updated[slotKey]
      return updated
    })
    // Gọi BE nếu có slot_id
    if (locked?.slot_id) {
      try {
        await updateSlot(locked.slot_id, { status: "AVAILABLE" })
        toast.success("Mở khóa slot thành công")
      } catch (err) {
        console.warn("updateSlot AVAILABLE failed:", err)
        toast.warning("Mở khóa local — chưa đồng bộ với server")
      }
    } else {
      toast.success("Mở khóa slot (local)")
    }
  }

  // Pre-calculate which slots are occupied by bookings
  const occupiedGrid: Record<string, BookingSummary> = {}
  bookings.forEach(b => {
    if (["CANCELLED_BY_CUSTOMER", "CANCELLED_BY_MANAGER", "AUTO_CANCELLED", "NO_SHOW"].includes(b.status)) return
    // Dùng bay_id từ booking nếu có, fallback bay-1
    const bayId = (b as any).bay_id || "bay-1"

    const startIndex = TIMES.indexOf(b.slot_start_time)
    if (startIndex !== -1) {
      for (let i = 0; i < b.num_slots; i++) {
        if (startIndex + i < TIMES.length) {
          occupiedGrid[`${bayId}_${TIMES[startIndex + i]}`] = b
        }
      }
    }
  })

  // Lưu cấu hình ngày (washers online + active bays) vào tất cả slot trong ngày
  const handleSaveConfig = async () => {
    if (slots.length === 0) {
      toast.warning("Chưa có slot nào tải được từ server. Cấu hình được lưu local.")
      return
    }
    try {
      setSavingConfig(true)
      // Cập nhật slot đầu tiên đại diện (BE sẽ áp dụng cho cả ngày)
      await updateSlot(slots[0].slot_id, {
        washers_online: onlineWashers,
        active_bays: activeBays,
      })
      toast.success("Đã lưu cấu hình thành công")
    } catch (err) {
      console.error("Save config failed:", err)
      toast.error("Lưu cấu hình thất bại")
    } finally {
      setSavingConfig(false)
    }
  }

  const getSlotColor = (isLocked: boolean, isOccupied: boolean, booking?: BookingSummary) => {
    if (isOccupied) {
      if (booking?.status === "IN_PROGRESS" || booking?.status === "VEHICLE_INSPECTED") return "bg-primary/20 border-primary/40 cursor-pointer"
      if (booking?.status === "COMPLETED" || booking?.status === "PAID" || booking?.status === "CLOSED") return "bg-success/20 border-success/40 cursor-pointer"
      return "rounded-xl border border-sky-200 bg-sky-50 text-sky-700 cursor-pointer dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-400"
    }
    if (isLocked) return "rounded-xl border border-rose-200 bg-rose-50 text-rose-600 cursor-not-allowed dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400"
    return "rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Premium Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Quản lý slot</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-3">Quản lý khung giờ và sắp xếp lịch làm việc.</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Main Content - 3 cols */}
          <div className="col-span-3 space-y-6">
            {/* Week Date Picker */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-foreground">
                  TUẦN CÓ NGÀY {selectedDate.getDate()}/{selectedDate.getMonth() + 1}
                </p>
                <div className="flex gap-2">
                  <button
                    className="flex size-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    className="flex size-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                  >
                    <ChevronRight className="size-4" />
                  </button>
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
                          ? "rounded-xl border border-primary bg-primary text-primary-foreground text-sm font-bold shadow-[var(--shadow-glow)]"
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
            <div className="rounded-2xl border border-border bg-card p-6 overflow-x-auto min-h-[500px]">
              {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="min-w-max">
                  <div className="grid gap-px" style={{ 
                    gridTemplateColumns: `80px repeat(${BAYS.length}, 1fr)`,
                    gridAutoRows: "40px"
                  }}>
                    {/* Header Row - Times */}
                    <div className="font-semibold text-xs text-muted-foreground bg-muted/50 p-2 sticky left-0 z-10">Giờ</div>
                    {BAYS.map(bay => (
                      <div key={bay.id} className="font-semibold text-xs text-center text-foreground bg-muted/50 p-2">
                        {bay.name}
                      </div>
                    ))}

                    {/* Slot Grid */}
                    {TIMES.map(time => (
                      <div key={`time-${time}`} className="contents">
                        <div className="font-mono text-xs text-muted-foreground p-2 bg-muted/20 font-semibold sticky left-0 z-10">
                          {time}
                        </div>
                        {BAYS.map(bay => {
                          const slotKey = `${bay.id}_${time}`
                          const isLocked = !!lockedSlots[slotKey]
                          const booking = occupiedGrid[slotKey]
                          const isOccupied = !!booking
                          
                          return (
                            <div
                              key={slotKey}
                              onClick={() => handleSlotClick(bay.id, time, isOccupied)}
                              className={`border-2 p-1 text-xs flex items-center justify-center cursor-pointer transition-all group relative overflow-hidden ${getSlotColor(isLocked, isOccupied, booking)}`}
                              title={isOccupied ? `${booking.customer_name || 'Khách'} - ${booking.status}` : isLocked ? lockedSlots[slotKey].reason : "Trống"}
                            >
                              {isOccupied && (
                                <div className="text-center text-xs truncate group-hover:hidden w-full flex justify-center">
                                  <p className="font-semibold text-sky-700 text-[10px] truncate max-w-full">{booking.customer_name?.split(' ').pop() || booking.license_plate}</p>
                                </div>
                              )}
                              {isLocked && !isOccupied && (
                                <Lock className="size-3 text-rose-500" />
                              )}
                              
                              {/* Hover Tooltip */}
                              {isOccupied && (
                                <div className="absolute inset-0 bg-sky-600/90 text-white p-1 hidden group-hover:flex flex-col justify-center items-center text-center rounded">
                                  <p className="text-[10px] font-semibold truncate w-full">{booking.customer_name}</p>
                                  <p className="text-[10px] opacity-90 truncate w-full">{booking.services_summary}</p>
                                </div>
                              )}

                              {/* Unlock Button on Hover for Locked */}
                              {isLocked && !isOccupied && (
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
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm border border-border bg-background" />Còn trống</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-sky-100 border border-sky-200" />Đã đặt</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-rose-100 border border-rose-200" />Hết chỗ / Khóa</span>
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

              <Button
                className="w-full gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 text-white shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5 transition-all duration-200"
                onClick={handleSaveConfig}
                disabled={savingConfig}
              >
                {savingConfig ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Lưu cấu hình
              </Button>

              {/* Stats */}
              <div className="rounded-lg bg-muted/50 p-3 space-y-2 mt-6">
                <p className="text-xs font-semibold text-muted-foreground">THỐNG KÊ NGÀY</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng booking:</span>
                    <span className="font-semibold text-foreground">
                      {bookings.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slots khóa:</span>
                    <span className="font-semibold text-foreground">
                      {Object.keys(lockedSlots).length}
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
              <Button className="flex-1 gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 text-white shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5 transition-all duration-200" onClick={handleLockSlot}>
                Khóa slot
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
