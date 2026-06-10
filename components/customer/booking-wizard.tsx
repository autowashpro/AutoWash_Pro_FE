"use client"

import { useState, useMemo, useRef, useCallback } from "react"
import {
  Check,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Tag,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CATALOG,
  VEHICLES,
  TIME_SLOTS,
  BOOKED_SLOTS,
  formatVND,
  type VehicleSize,
  type ServiceGroup,
  type CatalogService,
} from "@/lib/data"

// ─── Types ──────────────────────────────────────────────────────────────────

interface WizardState {
  size: VehicleSize | null
  selectedIds: Set<string>
  date: Date
  slot: string | null
  vehicleId: string
  voucher: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Loại xe", short: "Loại xe" },
  { label: "Dịch vụ", short: "Dịch vụ" },
  { label: "Lịch hẹn", short: "Lịch hẹn" },
  { label: "Xác nhận", short: "Xác nhận" },
]

const SIZE_CARDS: { key: VehicleSize; label: string; sub: string; desc: string }[] = [
  { key: "S", label: "Cỡ nhỏ (S)", sub: "4 chỗ, City car", desc: "Xe hatchback, sedan cỡ nhỏ, ô tô điện nhỏ." },
  { key: "M", label: "Cỡ vừa (M)", sub: "5–7 chỗ, SUV cỡ nhỏ", desc: "Sedan hạng D, SUV cỡ nhỏ–vừa, crossover." },
  { key: "L", label: "Cỡ lớn (L)", sub: "SUV lớn, MPV, 7 chỗ", desc: "SUV cỡ lớn, minivan, bán tải, xe 7 chỗ." },
]

const GROUP_ORDER: ServiceGroup[] = [
  "WASH",
  "Vệ sinh trong",
  "Vệ sinh ngoài",
  "Xử lý bề mặt",
  "Bảo vệ",
]

const WEEK_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
const VI_MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
]
const VI_FULL_DAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function startDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function formatDateVi(d: Date) {
  const day = VI_FULL_DAYS[d.getDay()]
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${day}, ${dd}/${mm}/${yyyy}`
}

function slotsNeeded(minutes: number) {
  return Math.ceil(minutes / 30)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-0">
      {STEPS.map((s, i) => {
        const done = i < step
        const active = i === step
        return (
          <li key={s.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5 min-w-[56px]">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !done && !active && "bg-secondary text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className={cn(
                "text-[11px] font-medium text-center leading-tight",
                active ? "text-primary" : "text-muted-foreground",
              )}>
                {s.short}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "h-0.5 flex-1 mx-1 rounded-full transition-colors",
                i < step ? "bg-[#0055ff]" : "bg-border",
              )} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function ServiceGroupSection({
  group,
  services,
  size,
  selectedIds,
  onToggle,
}: {
  group: ServiceGroup
  services: CatalogService[]
  size: VehicleSize
  selectedIds: Set<string>
  onToggle: (id: string) => void
}) {
  const [open, setOpen] = useState(true)
  const isWash = group === "WASH"

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 bg-card px-4 py-3 hover:bg-secondary/60 transition-colors"
      >
        <span className={cn(
          "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase",
          isWash ? "bg-primary text-primary-foreground" : "bg-flex text-flex-foreground",
        )}>
          {isWash ? "WASH" : "FLEX"}
        </span>
        <span className="flex-1 text-left text-sm font-semibold text-foreground">{group}</span>
        <span className={cn(
          "text-[10px] text-muted-foreground mr-2",
          isWash ? "visible" : "invisible",
        )}>
          {isWash ? "Chiếm cầu nâng" : "Tư vấn linh hoạt"}
        </span>
        {!isWash && (
          <span className="text-[10px] text-muted-foreground mr-2">Tư vấn linh hoạt</span>
        )}
        {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="divide-y divide-border">
          {services.map((svc) => {
            const checked = selectedIds.has(svc.id)
            return (
              <label
                key={svc.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors",
                  checked ? "bg-primary/8" : "bg-background hover:bg-secondary/40",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(svc.id)}
                  className="sr-only"
                />
                <span className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                  checked ? "border-primary bg-primary" : "border-border bg-background",
                )}>
                  {checked && <Check className="size-3 text-white" />}
                </span>
                <span className="flex-1 text-sm text-foreground">{svc.name}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary rounded px-1.5 py-0.5 shrink-0">
                  <Clock className="size-3" />
                  {svc.durationMinutes} ph
                </span>
                <span className="w-28 text-right font-mono text-sm font-semibold text-foreground shrink-0">
                  {formatVND(svc.price[size])}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CalendarPicker({
  value,
  onChange,
}: {
  value: Date
  onChange: (d: Date) => void
}) {
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1))
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const days = getDaysInMonth(year, month)
  const startDay = startDayOfMonth(year, month)

  // Closed on Sundays (index 0)
  const isDisabled = useCallback((d: Date) => {
    const past = d < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const sunday = d.getDay() === 0
    return past || sunday
  }, [today])

  const cells: (Date | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: days }, (_, i) => new Date(year, month, i + 1)),
  ]

  return (
    <div className="rounded-2xl border border-border bg-card p-4 select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="flex size-7 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="size-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {VI_MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="flex size-7 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </div>
      {/* Week header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((w) => (
          <div key={w} className={cn(
            "text-center text-[11px] font-medium py-1",
            w === "CN" ? "text-destructive" : "text-muted-foreground",
          )}>{w}</div>
        ))}
      </div>
      {/* Days */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, idx) => {
          if (!d) return <div key={`empty-${idx}`} />
          const disabled = isDisabled(d)
          const selected = isSameDay(d, value)
          const isToday = isSameDay(d, today)
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onChange(d)}
              className={cn(
                "mx-auto flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                selected && "bg-primary text-primary-foreground",
                !selected && !disabled && isToday && "border border-primary text-primary",
                !selected && !disabled && !isToday && "hover:bg-primary/10 text-foreground",
                disabled && "text-muted-foreground/40 cursor-not-allowed",
              )}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SlotGrid({
  slots,
  bookedSlots,
  selected,
  onSelect,
  highlightCount,
}: {
  slots: string[]
  bookedSlots: string[]
  selected: string | null
  onSelect: (s: string) => void
  highlightCount: number
}) {
  const selectedIdx = selected ? slots.indexOf(selected) : -1

  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((slot, idx) => {
        const booked = bookedSlots.includes(slot)
        const isSelected = selected === slot
        const inRange = !booked && highlightCount > 1 &&
          selectedIdx >= 0 && idx >= selectedIdx && idx < selectedIdx + highlightCount

        return (
          <button
            key={slot}
            type="button"
            disabled={booked}
            onClick={() => onSelect(slot)}
            className={cn(
              "rounded-xl border py-2.5 text-center font-mono text-sm font-medium transition-all",
              booked && "bg-secondary border-border text-muted-foreground/40 cursor-not-allowed",
              isSelected && !booked && "bg-primary border-primary text-primary-foreground shadow-[var(--shadow-glow)]",
              inRange && !isSelected && !booked && "bg-primary/10 border-primary/30 text-primary",
              !booked && !isSelected && !inRange && "bg-background border-border text-foreground hover:border-primary hover:text-primary hover:bg-primary/5",
            )}
          >
            {slot}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

export function BookingWizard() {
  const today = useMemo(() => new Date(), [])
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [state, setState] = useState<WizardState>({
    size: null,
    selectedIds: new Set(),
    date: today,
    slot: null,
    vehicleId: VEHICLES[0].id,
    voucher: "",
  })

  // Derived data
  const selected = useMemo(
    () => CATALOG.filter((c) => state.selectedIds.has(c.id)),
    [state.selectedIds],
  )

  const totalMinutes = useMemo(
    () => selected.reduce((acc, s) => acc + s.durationMinutes, 0),
    [selected],
  )

  const totalPrice = useMemo(
    () => state.size
      ? selected.reduce((acc, s) => acc + s.price[state.size!], 0)
      : 0,
    [selected, state.size],
  )

  const hasWash = selected.some((s) => s.type === "WASH")
  const hasFlex = selected.some((s) => s.type === "FLEX")
  const washSlots = hasWash
    ? slotsNeeded(selected.filter((s) => s.type === "WASH").reduce((a, s) => a + s.durationMinutes, 0))
    : 0

  const vehicle = VEHICLES.find((v) => v.id === state.vehicleId)!

  const toggle = (id: string) => {
    setState((prev) => {
      const next = new Set(prev.selectedIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { ...prev, selectedIds: next }
    })
  }

  const canNext = [
    !!state.size,
    state.selectedIds.size > 0,
    !!state.slot,
    true,
  ]

  // ── Success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-5">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-8" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-foreground">Đặt lịch thành công!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mã đặt lịch:{" "}
            <span className="font-mono font-semibold text-foreground">AW-2045</span>
          </p>
        </div>
        <div className="rounded-xl bg-secondary p-4 text-left text-sm space-y-2">
          <SummaryRow label="Phương tiện" value={`${vehicle.plate} — ${vehicle.model}`} mono />
          <SummaryRow label="Ngày hẹn" value={formatDateVi(state.date)} />
          <SummaryRow label="Giờ hẹn" value={state.slot ?? ""} mono />
          <SummaryRow label="Thời lượng" value={`${totalMinutes} phút`} />
          <div className="border-t border-dashed border-border my-1" />
          <SummaryRow label="Tổng cộng" value={formatVND(totalPrice)} bold accent />
        </div>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => {
            setDone(false)
            setStep(0)
            setState({ size: null, selectedIds: new Set(), date: today, slot: null, vehicleId: VEHICLES[0].id, voucher: "" })
          }}
        >
          Đặt lịch mới
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Stepper step={step} />

      {/* ── Step 1: Chọn loại xe ── */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground text-balance">Xe của bạn thuộc cỡ nào?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Kích cỡ xe ảnh hưởng đến thời gian và mức giá dịch vụ.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {SIZE_CARDS.map((card) => {
              const active = state.size === card.key
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, size: card.key }))}
                  className={cn(
                    "relative flex flex-col gap-3 rounded-2xl border-2 p-5 text-left transition-all",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  {active && (
                    <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary">
                      <Check className="size-3 text-white" />
                    </span>
                  )}
                  {/* Car SVG illustration */}
                  <CarIllustration size={card.key} />
                  <div>
                    <p className="font-bold text-foreground">{card.label}</p>
                    <p className="text-xs font-medium text-primary">{card.sub}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Step 2: Chọn dịch vụ ── */}
      {step === 1 && state.size && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground text-balance">Chọn dịch vụ bạn cần</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Giá hiển thị theo cỡ xe đã chọn:{" "}
              <span className="font-semibold text-foreground">
                {SIZE_CARDS.find((c) => c.key === state.size)?.label}
              </span>
            </p>
          </div>
          <div className="space-y-3">
            {GROUP_ORDER.map((group) => {
              const svcs = CATALOG.filter((c) => c.group === group)
              if (!svcs.length) return null
              return (
                <ServiceGroupSection
                  key={group}
                  group={group}
                  services={svcs}
                  size={state.size!}
                  selectedIds={state.selectedIds}
                  onToggle={toggle}
                />
              )
            })}
          </div>
          {/* Sticky bottom summary */}
          {state.selectedIds.size > 0 && (
            <div className="sticky bottom-0 z-10 -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-t sm:border border-border bg-background/95 backdrop-blur px-4 py-3 flex items-center gap-3 shadow-lg">
              <Clock className="size-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">
                Tổng thời gian: <strong className="text-foreground">{totalMinutes} phút</strong>
              </span>
              <span className="mx-1 text-border">|</span>
              <span className="text-sm text-muted-foreground flex-1">
                Tổng tiền: <strong className="text-primary">{formatVND(totalPrice)}</strong>
              </span>
              <Button size="sm" onClick={() => setStep(2)}>
                Tiếp theo <ChevronRight className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Chọn ngày & giờ ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground text-balance">Chọn lịch hẹn</h2>
            <p className="mt-1 text-sm text-muted-foreground">Cửa hàng mở cửa 07:00–17:30 mỗi ngày, trừ Chủ nhật.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <CalendarPicker
              value={state.date}
              onChange={(d) => setState((s) => ({ ...s, date: d, slot: null }))}
            />
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                {formatDateVi(state.date)}
              </p>
              <SlotGrid
                slots={TIME_SLOTS}
                bookedSlots={BOOKED_SLOTS}
                selected={state.slot}
                onSelect={(sl) => setState((s) => ({ ...s, slot: sl }))}
                highlightCount={hasWash ? washSlots : 1}
              />
              {/* Legend */}
              <div className="flex flex-wrap gap-3 pt-1">
                <LegendItem color="bg-primary" label="Đang chọn" />
                <LegendItem color="bg-background border border-border" label="Còn trống" />
                <LegendItem color="bg-secondary" label="Hết chỗ" />
              </div>
              {hasFlex && (
                <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
                  <AlertCircle className="size-4 shrink-0 text-amber-500 mt-0.5" />
                  <span>
                    <strong>Lưu ý FLEX:</strong> Giờ hẹn chỉ để tư vấn. Thời gian thực hiện do Manager xác nhận sau khi tiếp nhận.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Xác nhận ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground text-balance">Xác nhận thông tin</h2>
            <p className="mt-1 text-sm text-muted-foreground">Kiểm tra lại trước khi xác nhận đặt lịch.</p>
          </div>
          {/* Summary card */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            {/* Services list */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Dịch vụ đã chọn</p>
              <ul className="space-y-1.5">
                {selected.map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{s.name}</span>
                    <span className="font-mono font-medium text-foreground">{formatVND(s.price[state.size!])}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-dashed border-border" />
            {/* Date + time */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Ngày hẹn</p>
                <p className="font-mono font-semibold text-foreground">{formatDateVi(state.date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Giờ hẹn</p>
                <p className="font-mono font-semibold text-foreground">{state.slot}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Cỡ xe</p>
                <p className="font-semibold text-foreground">{SIZE_CARDS.find((c) => c.key === state.size)?.label}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Thời lượng dự kiến</p>
                <p className="font-semibold text-foreground">{totalMinutes} phút</p>
              </div>
            </div>
          </div>

          {/* Vehicle picker */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phương tiện</p>
            <div className="space-y-2">
              {VEHICLES.map((v) => (
                <label
                  key={v.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all",
                    state.vehicleId === v.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30",
                  )}
                >
                  <input
                    type="radio"
                    name="vehicle"
                    value={v.id}
                    checked={state.vehicleId === v.id}
                    onChange={() => setState((s) => ({ ...s, vehicleId: v.id }))}
                    className="sr-only"
                  />
                  <span className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    state.vehicleId === v.id ? "border-primary bg-primary" : "border-border",
                  )}>
                    {state.vehicleId === v.id && <span className="size-1.5 rounded-full bg-white" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-bold text-foreground">{v.plate}</p>
                    <p className="text-xs text-muted-foreground">{v.model} — {v.color}</p>
                  </div>
                </label>
              ))}
            </div>
            <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Plus className="size-3.5" />
              Thêm xe mới
            </button>
          </div>

          {/* Voucher */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Voucher / Điểm tích lũy</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={state.voucher}
                  onChange={(e) => setState((s) => ({ ...s, voucher: e.target.value }))}
                  placeholder="Nhập mã voucher hoặc dùng điểm tích lũy"
                  className="input pl-9 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="shrink-0">Áp dụng</Button>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <SummaryRow label="Tạm tính" value={formatVND(totalPrice)} />
            <SummaryRow label="Giảm giá" value="-0₫" />
            <div className="border-t border-dashed border-border my-1" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Tổng cộng</span>
              <span className="font-mono text-2xl font-extrabold text-primary">{formatVND(totalPrice)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation (hidden on step 1 which has inline sticky bar) ── */}
      {step !== 1 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="size-4" />
            Quay lại
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext[step]}>
              Tiếp theo <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-sky-500 text-white shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => setDone(true)}
            >
              <Check className="size-4" />
              Xác nhận đặt lịch
            </Button>
          )}
        </div>
      )}
      {step === 1 && state.selectedIds.size === 0 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="outline" onClick={() => setStep(0)}>
            <ChevronLeft className="size-4" />
            Quay lại
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Utility sub-components ──────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  mono,
  bold,
  accent,
}: {
  label: string
  value: string
  mono?: boolean
  bold?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        mono && "font-mono",
        bold && "font-bold",
        accent ? "text-primary" : "text-foreground",
      )}>
        {value}
      </span>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn("inline-block size-3 rounded-sm", color)} />
      {label}
    </span>
  )
}

function CarIllustration({ size }: { size: VehicleSize }) {
  const scale = size === "S" ? 0.75 : size === "M" ? 0.88 : 1
  return (
    <div className="flex items-center justify-center py-2">
      <svg
        viewBox="0 0 120 48"
        width={Math.round(120 * scale)}
        height={Math.round(48 * scale)}
        fill="none"
        aria-hidden
      >
        {/* Body */}
        <rect x="4" y="22" width="112" height="18" rx="4" className="fill-primary/15 stroke-primary/40" strokeWidth="1.5" />
        {/* Cabin */}
        {size === "S" && <path d="M30 22 L40 10 L80 10 L90 22Z" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />}
        {size === "M" && <path d="M24 22 L36 10 L84 10 L96 22Z" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />}
        {size === "L" && <path d="M18 22 L30 8 L90 8 L102 22Z" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />}
        {/* Windows */}
        {size === "S" && <>
          <rect x="42" y="12" width="16" height="8" rx="1.5" className="fill-primary/30" />
          <rect x="62" y="12" width="16" height="8" rx="1.5" className="fill-primary/30" />
        </>}
        {size === "M" && <>
          <rect x="38" y="12" width="18" height="8" rx="1.5" className="fill-primary/30" />
          <rect x="60" y="12" width="22" height="8" rx="1.5" className="fill-primary/30" />
        </>}
        {size === "L" && <>
          <rect x="32" y="10" width="20" height="10" rx="1.5" className="fill-primary/30" />
          <rect x="56" y="10" width="20" height="10" rx="1.5" className="fill-primary/30" />
          <rect x="80" y="10" width="18" height="10" rx="1.5" className="fill-primary/30" />
        </>}
        {/* Wheels */}
        <circle cx="28" cy="40" r="7" className="fill-primary/20 stroke-primary" strokeWidth="2" />
        <circle cx="28" cy="40" r="3" className="fill-primary/40" />
        <circle cx="92" cy="40" r="7" className="fill-primary/20 stroke-primary" strokeWidth="2" />
        <circle cx="92" cy="40" r="3" className="fill-primary/40" />
      </svg>
    </div>
  )
}
