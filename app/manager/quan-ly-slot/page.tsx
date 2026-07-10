"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ChevronLeft, ChevronRight, Plus, Minus, Loader2,
  Save, AlertTriangle, RefreshCw, Sparkles, Settings2, X, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getManagerSlots, updateSlot, generateSlots } from "@/lib/api/bookings"
import type { SlotDetail } from "@/lib/types"
import { toast } from "sonner"

// ─── Theo BRD §9.1: Slot 30 phút, 7:00–17:30 (= 21 slots) ───────────────────
const TIMES: string[] = []
for (let h = 7; h <= 17; h++) {
  TIMES.push(`${String(h).padStart(2, "0")}:00`)
  if (h < 17 || true) TIMES.push(`${String(h).padStart(2, "0")}:30`)
}
// 7:00..17:30 = 21 slots * 2 = 21 entries (7:00, 7:30 ... 17:00, 17:30)
const VALID_TIMES = TIMES.filter(t => {
  const [h, m] = t.split(":").map(Number)
  return (h === 7 || h > 7) && (h < 17 || (h === 17 && m === 30) || (h === 17 && m === 0))
})

/** Normalize time string: "7:00" → "07:00" */
function normalizeTime(t: string): string {
  if (!t) return ""
  const parts = t.split(":")
  return `${parts[0].padStart(2, "0")}:${(parts[1] || "00").padStart(2, "0")}`
}

/** Format ngày local tránh timezone lệch */
function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

/** BRD §9.1: capacity = min(active_bays, floor(washers_online / min_washers_per_car)) */
function calcCapacity(activeBays: number, washersOnline: number, minWashersPerCar = 1): number {
  return Math.min(activeBays, Math.floor(washersOnline / Math.max(1, minWashersPerCar)))
}

interface SlotEditState {
  slotId: string
  time: string
  washersOnline: number
  activeBays: number
  currentCapacity: number
  isBlocked: boolean
}

export default function SlotManagementPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d
  })

  const [slots, setSlots] = useState<SlotDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [slotError, setSlotError] = useState<string | null>(null)
  const [savingConfig, setSavingConfig] = useState(false)
  const [generatingSlots, setGeneratingSlots] = useState(false)
  const [savingSlot, setSavingSlot] = useState(false)

  // Config panel — global cho ngày đang xem
  const [onlineWashers, setOnlineWashers] = useState(3)
  const [activeBays, setActiveBays] = useState(3)

  // Slot edit popup — click 1 cell
  const [editSlot, setEditSlot] = useState<SlotEditState | null>(null)
  const [editWashers, setEditWashers] = useState(3)
  const [editBays, setEditBays] = useState(3)

  // ─── Fetch data ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setSlotError(null)
      const dateStr = toLocalDateStr(selectedDate)
      const loadedSlots = await getManagerSlots(dateStr)
      setSlots(loadedSlots)

      if (loadedSlots.length > 0) {
        const first = loadedSlots[0]
        setOnlineWashers(first.washers_online || 3)
        setActiveBays(first.active_bays || 3)
      }
    } catch (err: any) {
      console.warn("getManagerSlots failed", err)
      setSlotError("Không thể tải dữ liệu slot. Vui lòng kiểm tra kết nối.")
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Week picker ───────────────────────────────────────────────────────────
  const getWeekDates = () => {
    const dates = []
    const start = new Date(selectedDate)
    start.setDate(start.getDate() - start.getDay() + 1)
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(d.getDate() + i); dates.push(d)
    }
    return dates
  }
  const weekDates = getWeekDates()

  // ─── Global config save (tất cả slots trong ngày) ──────────────────────────
  const handleSaveConfig = async () => {
    if (slotError) { toast.error("Dữ liệu slot chưa tải được. Reload trang."); return }
    if (slots.length === 0) {
      // Generate slots mới
      try {
        setGeneratingSlots(true)
        const dateStr = toLocalDateStr(selectedDate)
        const result = await generateSlots({
          date: dateStr, activeBays, washersOnline: onlineWashers,
          startTime: "07:00", endTime: "18:00", intervalMinutes: 30,
        })
        toast.success(`Đã tạo ${result.totalCreated} slots — capacity = ${calcCapacity(activeBays, onlineWashers)}`)
        await fetchData()
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Tạo slot thất bại")
      } finally {
        setGeneratingSlots(false)
      }
      return
    }

    try {
      setSavingConfig(true)
      const results = await Promise.allSettled(
        slots.map(s => updateSlot(s.slot_id, {
          washers_online: onlineWashers,
          active_bays: activeBays,
        }))
      )
      const failed = results.filter(r => r.status === "rejected").length
      if (failed > 0) {
        toast.warning(`${slots.length - failed}/${slots.length} slot cập nhật thành công. ${failed} lỗi.`)
      } else {
        toast.success(`Đã lưu cấu hình cho ${slots.length} slots — capacity mới = ${calcCapacity(activeBays, onlineWashers)}`)
      }
      await fetchData()
    } catch (err) {
      toast.error("Lưu cấu hình thất bại")
    } finally {
      setSavingConfig(false)
    }
  }

  // ─── Slot cell click → popup edit 1 slot ──────────────────────────────────
  const handleSlotClick = (slot: SlotDetail, isOccupied: boolean) => {
    if (isOccupied) return
    const wo = slot.washers_online ?? 3
    const ab = slot.active_bays ?? 3
    const cap = slot.capacity ?? calcCapacity(ab, wo)
    setEditSlot({
      slotId: slot.slot_id,
      time: normalizeTime(slot.start_time),
      washersOnline: wo,
      activeBays: ab,
      currentCapacity: cap,
      isBlocked: slot.status === "BLOCKED",
    })
    setEditWashers(wo)
    setEditBays(ab)
  }

  const handleSaveSlotEdit = async () => {
    if (!editSlot) return
    try {
      setSavingSlot(true)
      await updateSlot(editSlot.slotId, {
        washers_online: editWashers,
        active_bays: editBays,
      })
      const newCap = calcCapacity(editBays, editWashers)
      toast.success(`Slot ${editSlot.time}: có thể nhận ${newCap} xe/giờ`)
      setEditSlot(null)
      await fetchData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lưu thất bại")
    } finally {
      setSavingSlot(false)
    }
  }

  const handleToggleBlock = async (slotId: string, currentlyBlocked: boolean) => {
    try {
      setSavingSlot(true)
      await updateSlot(slotId, { status: currentlyBlocked ? "AVAILABLE" : "BLOCKED" })
      toast.success(currentlyBlocked ? "Slot đã được mở khóa" : "Slot đã bị khóa")
      setEditSlot(null)
      await fetchData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Thao tác thất bại")
    } finally {
      setSavingSlot(false)
    }
  }

  // ─── Slot cell color theo BRD §9.1 ─────────────────────────────────────────
  const getSlotCellStyle = (slot: SlotDetail): string => {
    if (slot.status === "BLOCKED")
      return "bg-rose-100 border-rose-300 text-rose-700 cursor-not-allowed dark:bg-rose-950/30 dark:border-rose-800"
    if (slot.status === "FULLY_BOOKED" || (slot.booked_count + slot.held_count) >= slot.capacity)
      return "bg-blue-900/80 border-blue-700 text-white cursor-not-allowed dark:bg-blue-900/60"
    if ((slot.booked_count + slot.held_count) > 0)
      return "bg-sky-100 border-sky-300 text-sky-800 cursor-pointer hover:bg-sky-200 dark:bg-sky-950/40 dark:border-sky-700 dark:text-sky-300"
    return "bg-emerald-50 border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400"
  }

  // ─── Build slot map: startTime → SlotDetail ───────────────────────────────
  const slotByTime: Record<string, SlotDetail> = {}
  slots.forEach(s => {
    const t = normalizeTime(s.start_time)
    slotByTime[t] = s
  })

  // Số cột hiển thị = capacity từ slot đầu tiên (hoặc config nếu chưa có slot)
  const firstSlot = slots[0]
  const displayCapacity = firstSlot
    ? (firstSlot.capacity ?? calcCapacity(firstSlot.active_bays ?? 3, firstSlot.washers_online ?? 3))
    : calcCapacity(activeBays, onlineWashers)
  const colCount = Math.max(1, displayCapacity)
  const colHeaders = Array.from({ length: colCount }, (_, i) => `Cầu ${i + 1}`)

  // Thống kê
  const totalSlots = slots.length
  const blockedSlots = slots.filter(s => s.status === "BLOCKED").length
  const fullSlots = slots.filter(s => s.status !== "BLOCKED" && (s.booked_count + s.held_count) > 0).length
  const availableSlots = slots.filter(s => s.status !== "BLOCKED" && (s.booked_count + s.held_count) === 0).length

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Quản lý slot</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-3">Khung giờ 7:00–17:30 · Slot 30 phút · Capacity = min(cầu, NV)</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </Button>
        </div>

        {/* Thống kê */}
        {slots.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Tổng slots", value: totalSlots, color: "text-foreground" },
              { label: "Còn trống", value: availableSlots, color: "text-emerald-500" },
              { label: "Đang đặt/đầy", value: fullSlots, color: "text-blue-500" },
              { label: "Bị khóa", value: blockedSlots, color: "text-rose-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-4 gap-6">
          {/* Main: Week picker + Grid */}
          <div className="col-span-3 space-y-6">

            {/* Week Date Picker */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-foreground">
                  TUẦN CÓ NGÀY {selectedDate.getDate()}/{selectedDate.getMonth() + 1}
                </p>
                <div className="flex gap-2">
                  <button className="flex size-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 7 * 86400000))}>
                    <ChevronLeft className="size-4" />
                  </button>
                  <button className="flex size-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 7 * 86400000))}>
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, i) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString()
                  const isToday = date.toDateString() === new Date().toDateString()
                  const dayNames = ["T2","T3","T4","T5","T6","T7","CN"]
                  return (
                    <button key={i} onClick={() => setSelectedDate(date)}
                      className={`rounded-lg p-2 text-center text-xs font-semibold transition-all ${
                        isSelected
                          ? "rounded-xl border border-primary bg-primary text-primary-foreground text-sm font-bold shadow-[var(--shadow-glow)]"
                          : isToday
                          ? "bg-primary/10 text-primary border-2 border-primary/30"
                          : "bg-muted text-foreground border-2 border-transparent hover:border-primary/50"
                      }`}>
                      <p className="text-xs">{dayNames[i]}</p>
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
              ) : slotError ? (
                <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
                  <AlertTriangle className="size-10 text-amber-500" />
                  <p className="font-semibold text-foreground">{slotError}</p>
                  <Button variant="outline" className="gap-2" onClick={fetchData}>
                    <RefreshCw className="size-4" /> Thử lại
                  </Button>
                </div>
              ) : slots.length === 0 ? (
                <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
                  <Sparkles className="size-10 text-primary/40" />
                  <div>
                    <p className="font-semibold text-foreground">Chưa có slot cho ngày {toLocalDateStr(selectedDate)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cấu hình số NV & cầu bên phải → nhấn "Lưu cấu hình / Tạo slots"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="min-w-max">
                  {/* Legend */}
                  <div className="flex items-center gap-4 mb-4 text-xs">
                    {[
                      { color: "bg-emerald-100 border-emerald-300", label: "Còn trống" },
                      { color: "bg-sky-100 border-sky-300", label: "Đang có booking" },
                      { color: "bg-blue-900 border-blue-700", label: "Đã đầy" },
                      { color: "bg-rose-100 border-rose-300", label: "Đã khóa" },
                    ].map(({ color, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <span className={`inline-block size-3 rounded border ${color}`} />
                        <span className="text-muted-foreground">{label}</span>
                      </div>
                    ))}
                    <span className="text-muted-foreground ml-2">· Click ô trống để chỉnh cấu hình slot đó</span>
                  </div>

                  <div className="grid gap-px"
                    style={{ gridTemplateColumns: `72px repeat(${colCount}, minmax(90px, 1fr))`, gridAutoRows: "44px" }}>

                    {/* Header Row */}
                    <div className="text-xs font-semibold text-muted-foreground bg-muted/60 rounded-tl-lg flex items-center justify-center">
                      Giờ
                    </div>
                    {colHeaders.map((name, i) => (
                      <div key={i} className="text-xs font-bold text-center text-foreground bg-muted/60 flex items-center justify-center border-l border-border/50">
                        {name}
                      </div>
                    ))}

                    {/* Slot Rows */}
                    {VALID_TIMES.map(time => {
                      const slot = slotByTime[time]
                      return (
                        <div key={time} className="contents">
                          <div className="font-mono text-xs text-muted-foreground bg-muted/20 font-semibold flex items-center justify-center border-t border-border/30">
                            {time}
                          </div>
                          {colHeaders.map((_, colIdx) => {
                            if (!slot) {
                              return (
                                <div key={colIdx} className="border border-dashed border-border/30 bg-muted/10 flex items-center justify-center text-[10px] text-muted-foreground/40">
                                  —
                                </div>
                              )
                            }
                            const booked = slot.booked_count + slot.held_count
                            const filled = colIdx < booked
                            const isBlocked = slot.status === "BLOCKED"
                            const isFull = slot.status === "FULLY_BOOKED" || booked >= slot.capacity

                            let cellClass = ""
                            if (isBlocked) {
                              cellClass = "bg-rose-100 border-rose-300 cursor-pointer hover:border-rose-500 dark:bg-rose-950/30 dark:border-rose-800"
                            } else if (filled) {
                              cellClass = isFull
                                ? "bg-blue-800 border-blue-600 cursor-not-allowed dark:bg-blue-900/70"
                                : "bg-sky-200 border-sky-400 cursor-not-allowed dark:bg-sky-950/50 dark:border-sky-700"
                            } else {
                              cellClass = "bg-emerald-50 border-emerald-200 hover:border-primary/60 hover:bg-primary/5 cursor-pointer dark:bg-emerald-950/20 dark:border-emerald-800"
                            }

                            const bookingInfo = slot.bookings?.[colIdx]

                            return (
                              <div key={colIdx}
                                className={`border rounded-sm text-xs flex flex-col items-center justify-center transition-all ${cellClass}`}
                                onClick={() => {
                                  if (filled) return
                                  handleSlotClick(slot, false)
                                }}
                                title={isBlocked
                                  ? "Slot đang bị khóa — click để mở khóa"
                                  : filled
                                  ? `${bookingInfo?.customer_name || "Đã đặt"} - ${bookingInfo?.status || ""}`
                                  : "Còn trống — click để chỉnh cấu hình / khóa"}
                              >
                                {isBlocked && (
                                  <span className="text-[10px]">🔒</span>
                                )}
                                {filled && bookingInfo && (
                                  <p className="text-[9px] font-semibold text-white truncate max-w-full px-1 text-center">
                                    {bookingInfo.customer_name?.split(" ").pop()}
                                  </p>
                                )}
                                {!filled && !isBlocked && (
                                  <Settings2 className="size-3 text-emerald-400/60 opacity-0 hover:opacity-100" />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Config Panel */}
          <div className="col-span-1 space-y-4">
            {/* Capacity Formula */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Info className="size-4 text-blue-500" />
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Số xe tối đa nhận được mỗi giờ là:</p>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 font-semibold">
                Số cầu hoạt động: <strong>{activeBays}</strong> cầu
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400 font-semibold">
                Số nhân viên trực: <strong>{onlineWashers}</strong> người
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-500 mt-2 leading-relaxed">
                Mỗi xe rửa cần 1 cầu nâng và (ít nhất) 1 nhân viên — nên số xe được nhận = giá trị <em>nhỏ hơn</em> giữa số cầu và số nhân viên.
              </p>
              <div className="mt-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 px-3 py-2">
                <p className="text-xs text-blue-600 dark:text-blue-400">Nhận được tối đa</p>
                <p className="text-xl font-extrabold text-blue-800 dark:text-blue-300">
                  {calcCapacity(activeBays, onlineWashers)} xe / khung giờ
                </p>
              </div>
            </div>

            {/* Config: Số NV */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
              <h3 className="font-semibold text-foreground text-sm">Cấu hình ngày {toLocalDateStr(selectedDate)}</h3>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Số nhân viên online</label>
                <div className="flex items-center gap-3">
                  <button className="flex size-8 items-center justify-center rounded-lg border border-border hover:bg-secondary"
                    onClick={() => setOnlineWashers(w => Math.max(1, w - 1))}>
                    <Minus className="size-3" />
                  </button>
                  <span className="text-2xl font-bold text-foreground w-8 text-center">{onlineWashers}</span>
                  <button className="flex size-8 items-center justify-center rounded-lg border border-border hover:bg-secondary"
                    onClick={() => setOnlineWashers(w => Math.min(20, w + 1))}>
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Số cầu hoạt động</label>
                <div className="flex items-center gap-3">
                  <button className="flex size-8 items-center justify-center rounded-lg border border-border hover:bg-secondary"
                    onClick={() => setActiveBays(b => Math.max(1, b - 1))}>
                    <Minus className="size-3" />
                  </button>
                  <span className="text-2xl font-bold text-foreground w-8 text-center">{activeBays}</span>
                  <button className="flex size-8 items-center justify-center rounded-lg border border-border hover:bg-secondary"
                    onClick={() => setActiveBays(b => Math.min(10, b + 1))}>
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-3">
                  Capacity mới: <span className="font-bold text-primary">{calcCapacity(activeBays, onlineWashers)} booking/slot</span>
                </p>
                <Button className="w-full gap-2" size="sm"
                  onClick={handleSaveConfig}
                  disabled={savingConfig || generatingSlots || loading}>
                  {savingConfig || generatingSlots
                    ? <Loader2 className="size-4 animate-spin" />
                    : <Save className="size-4" />}
                  {slots.length === 0 ? "Tạo slots mới" : "Lưu cấu hình"}
                </Button>
              </div>
            </div>

            {/* Color Legend Chi tiết */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-foreground text-sm mb-3">Trạng thái slot</h3>
              {[
                { color: "bg-emerald-100 border-emerald-300", text: "Còn trống", desc: "booked = 0" },
                { color: "bg-sky-200 border-sky-400", text: "Đang đặt", desc: "0 < booked < cap" },
                { color: "bg-blue-800 border-blue-600", text: "Đã đầy", desc: "booked ≥ capacity" },
                { color: "bg-rose-100 border-rose-300", text: "Bị khóa", desc: "status=BLOCKED" },
              ].map(({ color, text, desc }) => (
                <div key={text} className="flex items-center gap-2">
                  <span className={`inline-block size-4 rounded border shrink-0 ${color}`} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{text}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popup chỉnh sửa 1 slot (theo docs: click → edit washers_online + active_bays) */}
      {editSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditSlot(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">
                {editSlot.isBlocked ? "🔒 Slot đang bị khóa" : "Chỉnh cấu hình slot"}
              </h2>
              <button onClick={() => setEditSlot(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Khung giờ <span className="font-mono font-bold text-foreground">{editSlot.time}</span>
              {editSlot.isBlocked && <span className="ml-2 text-xs text-rose-600 font-semibold">(Đang bị khóa)</span>}
            </p>

            {/* Block / Unblock action */}
            <div className="mb-4 p-3 rounded-xl border border-border bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                {editSlot.isBlocked ? "→ Slot này đang khóa, không nhận đặt lịch" : "→ Khóa slot này để tạm ngừng nhận lịch"}
              </p>
              <Button
                className={`w-full gap-2 ${editSlot.isBlocked ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"} text-white`}
                onClick={() => handleToggleBlock(editSlot.slotId, editSlot.isBlocked)}
                disabled={savingSlot}
              >
                {savingSlot ? <Loader2 className="size-4 animate-spin" /> : editSlot.isBlocked ? "🔓" : "🔒"}
                {editSlot.isBlocked ? "Mở khóa slot này" : "Khóa slot này"}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Số nhân viên</label>
                <div className="flex items-center gap-3">
                  <button className="flex size-9 items-center justify-center rounded-lg border border-border hover:bg-secondary"
                    onClick={() => setEditWashers(w => Math.max(1, w - 1))}>
                    <Minus className="size-4" />
                  </button>
                  <span className="text-2xl font-bold text-foreground w-10 text-center">{editWashers}</span>
                  <button className="flex size-9 items-center justify-center rounded-lg border border-border hover:bg-secondary"
                    onClick={() => setEditWashers(w => w + 1)}>
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Số cầu hoạt động</label>
                <div className="flex items-center gap-3">
                  <button className="flex size-9 items-center justify-center rounded-lg border border-border hover:bg-secondary"
                    onClick={() => setEditBays(b => Math.max(1, b - 1))}>
                    <Minus className="size-4" />
                  </button>
                  <span className="text-2xl font-bold text-foreground w-10 text-center">{editBays}</span>
                  <button className="flex size-9 items-center justify-center rounded-lg border border-border hover:bg-secondary"
                    onClick={() => setEditBays(b => b + 1)}>
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <p className="text-xs text-muted-foreground">Số xe có thể nhận sau khi lưu</p>
                <p className="text-xl font-bold text-primary">
                  {calcCapacity(editBays, editWashers)} xe / khung giờ
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ({editBays} cầu, {editWashers} NV → nhận tối đa {Math.min(editBays, editWashers)} xe)
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditSlot(null)}>Hủy</Button>
                <Button className="flex-1 gap-2" onClick={handleSaveSlotEdit} disabled={savingSlot}>
                  {savingSlot ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Lưu slot này
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
