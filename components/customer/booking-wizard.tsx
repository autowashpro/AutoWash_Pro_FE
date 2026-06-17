"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Plus,
  RefreshCw,
  ShieldAlert,
  Tag,
  TimerReset,
} from "lucide-react"

import {
  checkAvailability,
  createBooking,
  getMyProfile,
  getMyVehicles,
  getServices,
  holdSlot,
  releaseSlotHold,
} from "@/lib/api"
import { cn } from "@/lib/utils"
import type {
  Booking,
  CheckAvailabilityResponse,
  CustomerProfile,
  HoldSlotResponse,
  Service,
  ServiceCategory,
  Slot,
  Vehicle,
  VehicleSize,
} from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

type Step = 0 | 1 | 2 | 3

type ServiceWithCategory = Service & {
  categoryName: string
  isWashGroup: boolean
}

export type BookingSuccessSnapshot = {
  booking_id: string
  booking_type: Booking["booking_type"]
  status: Booking["status"]
  services: Booking["services"]
  slot: Booking["slot"]
  vehicle_label: string
  license_plate?: string
  vehicle_size?: VehicleSize
  estimated_total_price: number
  discount_amount: number
  final_estimate: number
}

const SUCCESS_STORAGE_KEY = "aw_booking_success"

const STEPS = [
  { label: "Loại xe", short: "Loại xe" },
  { label: "Dịch vụ", short: "Dịch vụ" },
  { label: "Lịch hẹn", short: "Lịch hẹn" },
  { label: "Xác nhận", short: "Xác nhận" },
] as const

const SIZE_OPTIONS: Array<{
  key: VehicleSize
  label: string
  short: string
  sub: string
  desc: string
}> = [
  {
    key: "SMALL",
    label: "Cỡ nhỏ (S)",
    short: "S",
    sub: "4 chỗ, city car",
    desc: "Hatchback, sedan nhỏ, xe điện cỡ nhỏ.",
  },
  {
    key: "MEDIUM",
    label: "Cỡ vừa (M)",
    short: "M",
    sub: "5-7 chỗ, SUV/crossover",
    desc: "Sedan hạng D, SUV nhỏ-vừa, crossover.",
  },
  {
    key: "LARGE",
    label: "Cỡ lớn (L)",
    short: "L",
    sub: "SUV lớn, MPV, bán tải",
    desc: "SUV lớn, minivan, bán tải, xe 7 chỗ.",
  },
]

const BUSINESS_ERROR_MESSAGES: Record<string, string> = {
  SLOT_FULLY_BOOKED: "Slot này vừa hết chỗ. Vui lòng chọn giờ khác.",
  CONSECUTIVE_SLOTS_UNAVAILABLE: "Không còn đủ slot liên tiếp cho gói WASH đã chọn.",
  SLOT_WINDOW_EXCEEDED: "Ngày này nằm ngoài hạn đặt lịch của hạng thành viên.",
  SLOT_TOO_SOON: "Slot quá gần thời điểm hiện tại. Vui lòng chọn giờ muộn hơn.",
  SLOT_HOLD_EXPIRED: "Thời gian giữ slot đã hết. Vui lòng chọn lại giờ hẹn.",
  VOUCHER_INVALID: "Voucher không hợp lệ, đã dùng hoặc hết hạn.",
  VOUCHER_TIER_INELIGIBLE: "Hạng thành viên hiện tại chưa đủ điều kiện dùng voucher này.",
  MAX_ACTIVE_BOOKINGS_EXCEEDED: "Bạn đã đạt giới hạn booking đang hoạt động.",
  DUPLICATE_VEHICLE_BOOKING: "Xe này đang có booking hoạt động.",
  TRUST_SCORE_BLOCKED: "Trust Score quá thấp nên tài khoản đang bị chặn đặt lịch.",
  VEHICLE_SIZE_MISMATCH: "Cỡ xe đã chọn không khớp với xe đang giữ slot.",
  SLOT_TIME_PASSED: "Slot này đã qua giờ. Vui lòng chọn giờ khác.",
  BOOKING_NOT_HELD: "Booking này không còn ở trạng thái giữ slot.",
  TIER_CONFIG_MISSING: "Hạng thành viên chưa được cấu hình hạn đặt lịch.",
}

function todayStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatDateParam(date: Date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function formatDateVi(date: Date | string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(typeof date === "string" ? new Date(`${date}T00:00:00`) : date)
}

function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function addMinutesToTime(time: string, minutes: number) {
  const [hour = 0, minute = 0] = time.split(":").map(Number)
  const date = new Date(2000, 0, 1, hour, minute + minutes)
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

function getVehicleLabel(vehicle: Vehicle | undefined) {
  if (!vehicle) return "Chưa chọn xe"
  return `${vehicle.license_plate} - ${vehicle.brand} ${vehicle.model}`
}

function getApiError(error: unknown) {
  const fallback = "Đã có lỗi xảy ra. Vui lòng thử lại."

  if (typeof error !== "object" || error === null) {
    return { code: undefined, message: fallback }
  }

  const response = (error as {
    response?: {
      data?: {
        error?: { code?: string; message?: string }
        data?: { code?: string; message?: string }
        businessCode?: string | number
        message?: string
      }
    }
  }).response

  const code = response?.data?.data?.code ?? response?.data?.error?.code
  const message =
    (code ? BUSINESS_ERROR_MESSAGES[code] : undefined) ??
    response?.data?.data?.message ??
    response?.data?.error?.message ??
    response?.data?.message ??
    fallback

  return { code, message }
}

function secondsLeft(expiresAt: string) {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000))
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function flattenServices(categories: ServiceCategory[]): ServiceWithCategory[] {
  return categories.flatMap((category) =>
    category.services.map((service) => ({
      ...service,
      categoryName: category.name,
      isWashGroup: category.is_wash_group,
    })),
  )
}

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-0">
      {STEPS.map((item, index) => {
        const done = index < step
        const active = index === step

        return (
          <li key={item.label} className="flex flex-1 items-center">
            <div className="flex min-w-14 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !done && !active && "bg-secondary text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-center text-[11px] font-medium leading-tight",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.short}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-0.5 flex-1 rounded-full transition-colors",
                  index < step ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function SummaryRow({
  label,
  value,
  mono,
  strong,
}: {
  label: string
  value: string
  mono?: boolean
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right text-foreground", mono && "font-mono", strong && "font-bold")}>
        {value}
      </span>
    </div>
  )
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn("inline-block size-3 rounded-sm border", className)} />
      {label}
    </span>
  )
}

function ServiceGroupSection({
  category,
  selectedIds,
  onToggle,
}: {
  category: ServiceCategory
  selectedIds: Set<string>
  onToggle: (serviceId: string) => void
}) {
  const isWash = category.is_wash_group

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border bg-secondary/30 px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
            isWash ? "bg-primary text-primary-foreground" : "bg-flex text-flex-foreground",
          )}
        >
          {isWash ? "WASH" : "FLEX"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{category.name}</p>
          <p className="text-xs text-muted-foreground">
            {isWash ? "Chiếm cầu nâng, cần slot liên tiếp" : "Dịch vụ linh hoạt theo giờ tư vấn"}
          </p>
        </div>
      </div>

      <div className="divide-y divide-border">
        {category.services.map((service) => {
          const checked = selectedIds.has(service.service_id)

          return (
            <label
              key={service.service_id}
              className={cn(
                "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors",
                checked ? "bg-primary/8" : "bg-background hover:bg-secondary/40",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(service.service_id)}
                className="sr-only"
              />
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                  checked ? "border-primary bg-primary" : "border-border bg-background",
                )}
              >
                {checked && <Check className="size-3 text-white" />}
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{service.name}</span>
              <span className="flex shrink-0 items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {service.estimated_duration_minutes} ph
              </span>
              <span className="w-28 shrink-0 text-right font-mono text-sm font-semibold text-foreground">
                {formatVND(service.price)}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export function BookingWizard() {
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<Step>(0)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [bootstrapLoading, setBootstrapLoading] = useState(true)

  const [vehicleSize, setVehicleSize] = useState<VehicleSize | null>(null)
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(() => new Set())

  const [selectedDate, setSelectedDate] = useState(() => todayStart())
  const [availability, setAvailability] = useState<CheckAvailabilityResponse | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [slotHold, setSlotHold] = useState<HoldSlotResponse | null>(null)
  const [holdLoadingSlotId, setHoldLoadingSlotId] = useState<string | null>(null)
  const [holdRemainingSeconds, setHoldRemainingSeconds] = useState(0)

  const [vehicleId, setVehicleId] = useState("")
  const [voucherCode, setVoucherCode] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const services = useMemo(() => flattenServices(serviceCategories), [serviceCategories])
  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.has(service.service_id)),
    [selectedServiceIds, services],
  )
  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.vehicle_id === vehicleId),
    [vehicleId, vehicles],
  )
  const vehiclesForSelectedSize = useMemo(
    () => vehicles.filter((vehicle) => vehicle.vehicle_size === vehicleSize),
    [vehicleSize, vehicles],
  )
  const selectedVehicleMatchesSize = Boolean(
    selectedVehicle && vehicleSize && selectedVehicle.vehicle_size === vehicleSize,
  )

  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.price, 0),
    [selectedServices],
  )
  const totalMinutes = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.estimated_duration_minutes, 0),
    [selectedServices],
  )
  const bookingWindowDays = profile?.booking_window_days ?? 7
  const maxBookableDate = useMemo(() => addDays(todayStart(), bookingWindowDays), [bookingWindowDays])

  const fetchBootstrapData = useCallback(async () => {
    setBootstrapLoading(true)
    const [profileResult, vehicleResult] = await Promise.allSettled([getMyProfile(), getMyVehicles()])

    if (profileResult.status === "fulfilled") {
      setProfile(profileResult.value)
    } else {
      toast({
        title: "Không tải được thông tin thành viên",
        description: "Tạm dùng hạn đặt lịch mặc định 7 ngày.",
        variant: "destructive",
      })
    }

    if (vehicleResult.status === "fulfilled") {
      setVehicles(vehicleResult.value)
      const defaultVehicle = vehicleResult.value.find((vehicle) => vehicle.is_default) ?? vehicleResult.value[0]
      if (defaultVehicle) {
        setVehicleId(defaultVehicle.vehicle_id)
        setVehicleSize((current) => current ?? defaultVehicle.vehicle_size)
      }
    } else {
      toast({
        title: "Không tải được danh sách xe",
        description: "Bạn vẫn có thể chọn dịch vụ, nhưng cần tải lại xe trước khi xác nhận.",
        variant: "destructive",
      })
    }

    setBootstrapLoading(false)
  }, [toast])

  const fetchServices = useCallback(
    async (size: VehicleSize) => {
      setServicesLoading(true)
      setServicesError(null)
      try {
        const categories = await getServices({ vehicle_size: size })
        setServiceCategories(categories)
      } catch (error) {
        const { message } = getApiError(error)
        setServiceCategories([])
        setServicesError(message)
        toast({
          title: "Không tải được dịch vụ",
          description: message,
          variant: "destructive",
        })
      } finally {
        setServicesLoading(false)
      }
    },
    [toast],
  )

  const fetchAvailability = useCallback(async () => {
    if (!vehicleSize || selectedServiceIds.size === 0) return

    setAvailabilityLoading(true)
    setAvailabilityError(null)
    setAvailability(null)
    setSelectedSlot(null)
    setSlotHold(null)

    try {
      const result = await checkAvailability({
        date: formatDateParam(selectedDate),
        service_ids: Array.from(selectedServiceIds),
        vehicle_size: vehicleSize,
      })
      setAvailability(result)
    } catch (error) {
      const { message } = getApiError(error)
      setAvailabilityError(message)
      toast({
        title: "Không kiểm tra được lịch trống",
        description: message,
        variant: "destructive",
      })
    } finally {
      setAvailabilityLoading(false)
    }
  }, [selectedDate, selectedServiceIds, toast, vehicleSize])

  useEffect(() => {
    void fetchBootstrapData()
  }, [fetchBootstrapData])

  useEffect(() => {
    if (!vehicleSize) return

    setSelectedServiceIds(new Set())
    setServiceCategories([])
    setAvailability(null)
    setSelectedSlot(null)
    setSlotHold(null)
    void fetchServices(vehicleSize)
  }, [fetchServices, vehicleSize])

  useEffect(() => {
    if (step !== 2) return
    void fetchAvailability()
  }, [fetchAvailability, step])

  useEffect(() => {
    if (!slotHold) {
      setHoldRemainingSeconds(0)
      return
    }

    setHoldRemainingSeconds(secondsLeft(slotHold.expires_at))
    const interval = window.setInterval(() => {
      const remaining = secondsLeft(slotHold.expires_at)
      setHoldRemainingSeconds(remaining)

      if (remaining <= 0) {
        window.clearInterval(interval)
        setSlotHold(null)
        setSelectedSlot(null)
        setStep(2)
        toast({
          title: "Slot đã hết thời gian giữ",
          description: "Vui lòng chọn lại giờ hẹn để tiếp tục đặt lịch.",
          variant: "destructive",
        })
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [slotHold, toast])

  const chooseVehicleSize = (size: VehicleSize) => {
    setVehicleSize(size)
    const matchingVehicle =
      vehicles.find((vehicle) => vehicle.vehicle_size === size && vehicle.is_default) ??
      vehicles.find((vehicle) => vehicle.vehicle_size === size)
    setVehicleId(matchingVehicle?.vehicle_id ?? "")
    setAvailability(null)
    setSelectedSlot(null)
    setSlotHold(null)
    setStep(0)
  }

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((current) => {
      const next = new Set(current)
      if (next.has(serviceId)) next.delete(serviceId)
      else next.add(serviceId)
      return next
    })
    setAvailability(null)
    setSelectedSlot(null)
    setSlotHold(null)
  }

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
    setAvailability(null)
    setSelectedSlot(null)
    setSlotHold(null)
  }

  const handleHoldSlot = async (slot: Slot) => {
    if (!vehicleSize || selectedServiceIds.size === 0) return
    if (!selectedVehicle || selectedVehicle.vehicle_size !== vehicleSize) {
      toast({
        title: "Cần chọn xe đã lưu",
        description: "Vui lòng chọn một xe đã lưu khớp với cỡ xe trước khi giữ slot.",
        variant: "destructive",
      })
      return
    }

    setSelectedSlot(slot)
    setSlotHold(null)
    setHoldLoadingSlotId(slot.slot_id)

    try {
      const hold = await holdSlot({
        slot_id: slot.slot_id,
        vehicle_id: selectedVehicle.vehicle_id,
        service_ids: Array.from(selectedServiceIds),
        vehicle_size: vehicleSize,
      })
      setSlotHold(hold)
      setStep(3)
      toast({
        title: "Đã giữ slot",
        description: "Bạn có 10 phút để xác nhận booking.",
      })
    } catch (error) {
      const { code, message } = getApiError(error)
      setSelectedSlot(null)
      setSlotHold(null)
      if (code === "SLOT_HOLD_EXPIRED") setStep(2)
      toast({
        title: "Không giữ được slot",
        description: message,
        variant: "destructive",
      })
    } finally {
      setHoldLoadingSlotId(null)
    }
  }

  const handleCreateBooking = async () => {
    if (!slotHold || !selectedVehicleMatchesSize) return

    setSubmitting(true)
    try {
      const booking = await createBooking({
        slot_hold_token: slotHold.slot_hold_token,
        voucher_code: voucherCode.trim() || undefined,
        notes: notes.trim() || undefined,
      })

      const snapshot: BookingSuccessSnapshot = {
        booking_id: booking.booking_id,
        booking_type: booking.booking_type,
        status: booking.status,
        services: booking.services,
        slot: booking.slot,
        vehicle_label: getVehicleLabel(selectedVehicle),
        license_plate: booking.license_plate ?? selectedVehicle?.license_plate,
        vehicle_size: booking.vehicle_size ?? selectedVehicle?.vehicle_size,
        estimated_total_price: booking.estimated_total_price,
        discount_amount: booking.discount_amount,
        final_estimate: booking.final_estimate,
      }

      window.sessionStorage.setItem(SUCCESS_STORAGE_KEY, JSON.stringify(snapshot))
      router.push(`/customer/dat-lich-thanh-cong?booking_id=${encodeURIComponent(booking.booking_id)}`)
    } catch (error) {
      const { code, message } = getApiError(error)
      if (code === "SLOT_HOLD_EXPIRED") {
        setSlotHold(null)
        setSelectedSlot(null)
        setStep(2)
      }
      toast({
        title: "Không tạo được booking",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Khi back từ step xác nhận — giải phóng slot hold ngay để trả capacity cho slot
  const handleBack = async () => {
    if (step === 3 && slotHold) {
      try {
        await releaseSlotHold(slotHold.slot_hold_token, 'User went back before confirmation')
      } catch {
        // Silent fail — slot tự expire sau 10 phút, không block UX
      }
      setSlotHold(null)
      setSelectedSlot(null)
    }
    setStep((current) => Math.max(0, current - 1) as Step)
  }

  const canGoNext = [
    Boolean(vehicleSize),
    selectedServiceIds.size > 0,
    Boolean(slotHold),
    Boolean(slotHold && selectedVehicleMatchesSize && holdRemainingSeconds > 0),
  ]

  const selectedSizeOption = SIZE_OPTIONS.find((option) => option.key === vehicleSize)
  const selectedSlotEnd =
    selectedSlot && availability
      ? addMinutesToTime(selectedSlot.start_time, availability.estimated_duration_minutes)
      : selectedSlot?.end_time

  return (
    <div className="space-y-6">
      <Stepper step={step} />

      {bootstrapLoading && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          Đang tải thông tin thành viên và xe đã lưu...
        </div>
      )}

      {step === 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground text-balance">Xe của bạn thuộc cỡ nào?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Kích cỡ xe quyết định giá dịch vụ và thời lượng dự kiến.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {SIZE_OPTIONS.map((option) => {
              const active = vehicleSize === option.key
              const matchingVehicles = vehicles.filter((vehicle) => vehicle.vehicle_size === option.key)

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => chooseVehicleSize(option.key)}
                  className={cn(
                    "relative flex min-h-52 flex-col gap-4 rounded-2xl border-2 bg-card p-5 text-left transition-all",
                    active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                  )}
                >
                  {active && (
                    <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary">
                      <Check className="size-3 text-white" />
                    </span>
                  )}
                  <div className="flex h-16 items-center justify-center rounded-xl bg-secondary/60 text-primary">
                    <Car className={cn("size-8", option.key === "LARGE" && "size-10")} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">{option.label}</p>
                    <p className="text-xs font-medium text-primary">{option.sub}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{option.desc}</p>
                  </div>
                  {matchingVehicles.length > 0 && (
                    <div className="mt-auto rounded-lg bg-primary/8 px-3 py-2 text-xs font-medium text-primary">
                      {matchingVehicles.length} xe đã lưu phù hợp
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {step === 1 && vehicleSize && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground text-balance">Chọn dịch vụ bạn cần</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Giá hiển thị theo cỡ xe: <span className="font-semibold text-foreground">{selectedSizeOption?.label}</span>
            </p>
          </div>

          {servicesLoading && (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              Đang tải danh sách dịch vụ...
            </div>
          )}

          {servicesError && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex gap-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div className="space-y-3">
                  <p>{servicesError}</p>
                  <Button size="sm" variant="outline" onClick={() => fetchServices(vehicleSize)}>
                    <RefreshCw className="size-4" />
                    Tải lại dịch vụ
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!servicesLoading && !servicesError && serviceCategories.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Chưa có dịch vụ phù hợp với cỡ xe này.
            </div>
          )}

          <div className="space-y-3">
            {serviceCategories.map((category) => (
              <ServiceGroupSection
                key={category.category_id}
                category={category}
                selectedIds={selectedServiceIds}
                onToggle={toggleService}
              />
            ))}
          </div>

          {selectedServiceIds.size > 0 && (
            <div className="sticky bottom-0 z-10 -mx-4 flex items-center gap-3 border-t border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
              <Clock className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">{totalMinutes} phút</strong>
              </span>
              <span className="text-border">|</span>
              <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                Tổng: <strong className="text-primary">{formatVND(totalPrice)}</strong>
              </span>
              <Button size="sm" onClick={() => setStep(2)}>
                Tiếp theo <ChevronRight className="size-3.5" />
              </Button>
            </div>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground text-balance">Chọn ngày và giờ</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Bạn có thể đặt lịch trước tối đa {bookingWindowDays} ngày theo hạng thành viên.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            <div className="rounded-2xl border border-border bg-card p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                disabled={(date) => date < todayStart() || date > maxBookableDate}
                className="mx-auto"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{formatDateVi(selectedDate)}</p>
                  {availability?.booking_window_note && (
                    <p className="mt-1 text-xs text-muted-foreground">{availability.booking_window_note}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={fetchAvailability} disabled={availabilityLoading}>
                  {availabilityLoading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                  Làm mới
                </Button>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">Xe dùng để giữ slot</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/customer/phuong-tien">
                      <Plus className="size-4" />
                      Thêm xe
                    </Link>
                  </Button>
                </div>

                {vehiclesForSelectedSize.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {vehiclesForSelectedSize.map((vehicle) => (
                      <label
                        key={vehicle.vehicle_id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all",
                          vehicleId === vehicle.vehicle_id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30",
                        )}
                      >
                        <input
                          type="radio"
                          name="slotVehicle"
                          value={vehicle.vehicle_id}
                          checked={vehicleId === vehicle.vehicle_id}
                          onChange={() => {
                            setVehicleId(vehicle.vehicle_id)
                            setSelectedSlot(null)
                            setSlotHold(null)
                          }}
                          className="sr-only"
                        />
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                            vehicleId === vehicle.vehicle_id ? "border-primary bg-primary" : "border-border",
                          )}
                        >
                          {vehicleId === vehicle.vehicle_id && <span className="size-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-mono text-sm font-bold text-foreground">{vehicle.license_plate}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {vehicle.brand} {vehicle.model}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
                    <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                    <span>Cần thêm xe cỡ {vehicleSize} trước khi giữ slot.</span>
                  </div>
                )}
              </div>

              {availabilityLoading && (
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Đang kiểm tra slot trống...
                </div>
              )}

              {availabilityError && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  <div className="flex gap-2">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <span>{availabilityError}</span>
                  </div>
                </div>
              )}

              {availability && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-border bg-secondary/30 p-3 text-sm">
                    <SummaryRow label="Loại booking" value={availability.booking_type} strong />
                    <SummaryRow label="Thời lượng dự kiến" value={`${availability.estimated_duration_minutes} phút`} />
                    <SummaryRow
                      label="Số slot cần giữ"
                      value={`${availability.num_slots_required} slot${availability.booking_type === "WASH" ? " liên tiếp" : ""}`}
                      mono
                    />
                  </div>

                  {availability.available_slots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {availability.available_slots.map((slot) => {
                        const selected = selectedSlot?.slot_id === slot.slot_id
                        const loading = holdLoadingSlotId === slot.slot_id
                        const slotEnd = addMinutesToTime(slot.start_time, availability.estimated_duration_minutes)

                        return (
                          <button
                            key={slot.slot_id}
                            type="button"
                            disabled={Boolean(holdLoadingSlotId) || !selectedVehicleMatchesSize}
                            onClick={() => handleHoldSlot(slot)}
                            className={cn(
                              "rounded-xl border px-3 py-3 text-left transition-all",
                              selected
                                ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                                : "border-border bg-background hover:border-primary hover:bg-primary/5 hover:text-primary",
                              loading && "cursor-wait opacity-80",
                            )}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span className="font-mono text-sm font-bold">{slot.start_time}</span>
                              {loading && <Loader2 className="size-3.5 animate-spin" />}
                            </span>
                            <span className="mt-1 block text-xs opacity-80">
                              {availability.booking_type === "WASH" ? `đến ${slotEnd}` : slot.end_time ? `đến ${slot.end_time}` : "slot linh hoạt"}
                            </span>
                            {availability.booking_type === "WASH" && (
                              <span className="mt-1 block text-[11px] opacity-75">
                                Còn {slot.remaining_capacity} sức chứa
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                      Không còn slot phù hợp trong ngày này. Vui lòng chọn ngày khác.
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-1">
                    <LegendItem className="border-primary bg-primary" label="Đang chọn" />
                    <LegendItem className="border-border bg-background" label="Còn trống" />
                    <LegendItem className="border-secondary bg-secondary" label="Không khả dụng" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground text-balance">Xác nhận thông tin</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Kiểm tra lại booking trước khi xác nhận đặt lịch.
            </p>
          </div>

          {slotHold && (
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-4",
                holdRemainingSeconds <= 60
                  ? "border-destructive/30 bg-destructive/5 text-destructive"
                  : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400",
              )}
            >
              <TimerReset className="size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Slot đang được giữ</p>
                <p className="text-xs opacity-80">Hoàn tất xác nhận trước khi hết thời gian.</p>
              </div>
              <span className="font-mono text-lg font-bold">{formatCountdown(holdRemainingSeconds)}</span>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Check className="size-4 text-primary" />
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tóm tắt booking</p>
            </div>
            <div className="space-y-2">
              {selectedServices.map((service) => (
                <SummaryRow key={service.service_id} label={service.name} value={formatVND(service.price)} />
              ))}
              <div className="my-3 border-t border-dashed border-border" />
              <SummaryRow label="Ngày hẹn" value={formatDateVi(selectedDate)} mono />
              <SummaryRow
                label="Giờ hẹn"
                value={selectedSlot ? `${selectedSlot.start_time}${selectedSlotEnd ? ` - ${selectedSlotEnd}` : ""}` : "Chưa chọn"}
                mono
              />
              <SummaryRow label="Cỡ xe" value={selectedSizeOption?.label ?? "Chưa chọn"} />
              <SummaryRow label="Thời lượng" value={`${slotHold?.estimated_duration_minutes ?? totalMinutes} phút`} />
              <div className="my-3 border-t border-dashed border-border" />
              <SummaryRow label="Tạm tính" value={formatVND(slotHold?.estimated_total_price ?? totalPrice)} strong />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Phương tiện đã giữ slot</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/customer/phuong-tien">
                  <Plus className="size-4" />
                  Thêm xe
                </Link>
              </Button>
            </div>

            {vehicles.length > 0 ? (
              <div className="space-y-2">
                {(selectedVehicle ? [selectedVehicle] : vehiclesForSelectedSize).map((vehicle) => (
                  <label
                    key={vehicle.vehicle_id}
                    className={cn(
                      "flex cursor-default items-center gap-3 rounded-xl border-2 p-3 transition-all",
                      vehicleId === vehicle.vehicle_id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30",
                      vehicle.vehicle_size !== vehicleSize && "opacity-70",
                    )}
                  >
                    <input
                      type="radio"
                      name="vehicle"
                      value={vehicle.vehicle_id}
                      checked={vehicleId === vehicle.vehicle_id}
                      disabled
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                        vehicleId === vehicle.vehicle_id ? "border-primary bg-primary" : "border-border",
                      )}
                    >
                      {vehicleId === vehicle.vehicle_id && <span className="size-1.5 rounded-full bg-white" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-bold text-foreground">{vehicle.license_plate}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {vehicle.brand} {vehicle.model} - {vehicle.color}
                      </p>
                    </div>
                    <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground">
                      {vehicle.vehicle_size}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                <span>Bạn cần thêm xe trước khi xác nhận booking.</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Voucher và ghi chú</p>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={voucherCode}
                onChange={(event) => setVoucherCode(event.target.value)}
                placeholder="Nhập mã voucher nếu có"
                className="pl-9 font-mono uppercase"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Voucher sẽ được backend kiểm tra khi tạo booking.
            </p>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ghi chú cho cửa hàng, ví dụ: xe có vết xước nhỏ bên hông phải"
              className="min-h-24"
            />
          </div>
        </section>
      )}

      {step !== 1 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0 || submitting}
          >
            <ChevronLeft className="size-4" />
            Quay lại
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep((current) => Math.min(3, current + 1) as Step)}
              disabled={!canGoNext[step]}
            >
              Tiếp theo <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              className="flex-1 sm:flex-none"
              onClick={handleCreateBooking}
              disabled={!canGoNext[3] || submitting}
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Xác nhận đặt lịch
            </Button>
          )}
        </div>
      )}

      {step === 1 && selectedServiceIds.size === 0 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="size-4" />
            Quay lại
          </Button>
        </div>
      )}
    </div>
  )
}

export { SUCCESS_STORAGE_KEY }
