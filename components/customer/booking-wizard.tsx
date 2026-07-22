"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Info,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  TimerReset,
  User,
} from "lucide-react"

import {
  checkAvailability,
  createBooking,
  getMyProfile,
  getMyVehicles,
  getServices,
  holdSlot,
  releaseSlotHold,
  validateVoucher,
} from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  VEHICLE_SIZE_LABELS,
  type Booking,
  type CheckAvailabilityResponse,
  type CustomerProfile,
  type HoldSlotResponse,
  type Service,
  type ServiceCategory,
  type Slot,
  type Vehicle,
  type VehicleSize,
} from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type Step = 0 | 1 | 2 | 3 | 4

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
  { label: "Size xe", short: "Size xe" },
  { label: "Dịch vụ", short: "Dịch vụ" },
  { label: "Lịch hẹn", short: "Lịch hẹn" },
  { label: "Thông tin", short: "Thông tin" },
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
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border bg-secondary/30 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{category.name}</p>
        </div>
      </div>

      <div className="divide-y divide-border">
        {category.services.map((service) => {
          const checked = selectedIds.has(service.service_id)

          return (
            <div
              key={service.service_id}
              className={cn(
                "flex flex-col transition-colors duration-300",
                checked ? "bg-primary/5" : "bg-background hover:bg-secondary/40",
              )}
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={`desc-${service.service_id}`} className="border-b-0">
                  <div className="flex items-center gap-1 sm:gap-3 group px-3 py-3 sm:px-4">
                    <div
                      onClick={() => onToggle(service.service_id)}
                      className="flex flex-1 cursor-pointer items-center gap-2 sm:gap-3"
                    >
                      <div
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                          checked ? "text-primary scale-110" : "text-muted-foreground/30 group-hover:text-primary/50",
                        )}
                      >
                        <Check className="size-5" />
                      </div>
                      <span className={cn("min-w-0 flex-1 text-sm font-medium transition-colors", checked ? "text-primary font-semibold" : "text-foreground")}>{service.name}</span>
                      <span className="hidden sm:flex shrink-0 items-center gap-1.5 rounded-full bg-secondary/80 px-2 py-0.5 text-xs text-muted-foreground font-medium">
                        <Clock className="size-3" />
                        {service.estimated_duration_minutes} ph
                      </span>
                      <span className="w-20 sm:w-28 shrink-0 text-right font-mono text-sm font-bold text-foreground">
                        {formatVND(service.price)}
                      </span>
                    </div>
                    
                    {/* Inline Accordion Trigger (Chevron) */}
                    <AccordionTrigger className="p-2 ml-1 hover:bg-primary/10 rounded-full hover:no-underline [&[data-state=open]>svg]:text-primary py-0">
                      <span className="sr-only">Xem chi tiết</span>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent className="px-4 pb-4 pt-0">
                    <div className="rounded-xl bg-secondary/50 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap ml-1 sm:ml-8">
                      <div className="flex sm:hidden items-center gap-4 text-xs text-muted-foreground font-medium mb-3">
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3 text-primary" /> {service.estimated_duration_minutes} phút
                        </span>
                      </div>
                      {service.description || "Chưa có mô tả chi tiết cho dịch vụ này."}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const STORAGE_KEY_STATE = "aw_booking_wizard_state"

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
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount_amount: number; final_amount: number } | null>(null)
  const [validatingVoucher, setValidatingVoucher] = useState(false)
  const [voucherError, setVoucherError] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Mới: Form Data cho Bước 4
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY_STATE)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.slotHold && new Date(data.slotHold.expires_at).getTime() > Date.now()) {
          setStep(data.step ?? 0)
          setSlotHold(data.slotHold)
          setSelectedSlot(data.selectedSlot)
        } else {
          setStep((data.step && data.step >= 3) ? 2 : (data.step ?? 0))
        }
        
        if (data.vehicleSize) setVehicleSize(data.vehicleSize)
        if (data.selectedServiceIds) setSelectedServiceIds(new Set(data.selectedServiceIds))
        if (data.selectedDate) setSelectedDate(new Date(data.selectedDate))
        if (data.vehicleId) setVehicleId(data.vehicleId)
        if (data.voucherCode) setVoucherCode(data.voucherCode)
        if (data.notes) setNotes(data.notes)
        if (data.contactName) setContactName(data.contactName)
        if (data.contactPhone) setContactPhone(data.contactPhone)
        if (data.contactEmail) setContactEmail(data.contactEmail)
        if (data.licensePlate) setLicensePlate(data.licensePlate)
        if (data.brand) setBrand(data.brand)
        if (data.model) setModel(data.model)
      } catch {}
    }
  }, [])

  useEffect(() => {
    const state = {
      step, vehicleSize, selectedServiceIds: Array.from(selectedServiceIds),
      selectedDate: selectedDate.toISOString(), selectedSlot, slotHold,
      vehicleId, voucherCode, notes, contactName, contactPhone, contactEmail, licensePlate, brand, model
    }
    sessionStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state))
  }, [step, vehicleSize, selectedServiceIds, selectedDate, selectedSlot, slotHold, vehicleId, voucherCode, notes, contactName, contactPhone, contactEmail, licensePlate, brand, model])

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
      const p = profileResult.value
      setProfile(p)
      setContactName(prev => prev || p.full_name || "")
      setContactPhone(prev => prev || p.phone || "")
      setContactEmail(prev => prev || p.email || "")
    } else {
      toast({
        title: "Không tải được thông tin thành viên",
        description: "Tạm dùng hạn đặt lịch mặc định 7 ngày.",
        variant: "destructive",
      })
    }

    if (vehicleResult.status === "fulfilled") {
      setVehicles(vehicleResult.value)
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
    if (slotHold) {
      void releaseSlotHold(slotHold.slot_hold_token, "User changed vehicle size").catch(() => {})
      setSlotHold(null)
    }
    setVehicleSize(size)
    const matchingVehicle =
      vehicles.find((vehicle) => vehicle.vehicle_size === size && vehicle.is_default) ??
      vehicles.find((vehicle) => vehicle.vehicle_size === size)
    setVehicleId(matchingVehicle?.vehicle_id ?? "")
    setAvailability(null)
    setSelectedSlot(null)
    setStep(0)
  }

  const toggleService = (serviceId: string) => {
    if (slotHold) {
      void releaseSlotHold(slotHold.slot_hold_token, "User changed services").catch(() => {})
      setSlotHold(null)
    }
    setSelectedServiceIds((current) => {
      const next = new Set(current)
      if (next.has(serviceId)) next.delete(serviceId)
      else next.add(serviceId)
      return next
    })
    setAvailability(null)
    setSelectedSlot(null)
  }

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return
    if (slotHold) {
      void releaseSlotHold(slotHold.slot_hold_token, "User changed date").catch(() => {})
      setSlotHold(null)
    }
    setSelectedDate(date)
    setAvailability(null)
    setSelectedSlot(null)
  }

  const handleSelectSlot = (slot: Slot) => {
    if (selectedSlot?.slot_id === slot.slot_id) {
      setSelectedSlot(null)
    } else {
      if (slotHold) {
        void releaseSlotHold(slotHold.slot_hold_token, "User changed slot selection").catch(() => {})
        setSlotHold(null)
      }
      setSelectedSlot(slot)
    }
  }

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Vui lòng nhập mã voucher.")
      return
    }
    setValidatingVoucher(true)
    setVoucherError("")
    try {
      const currentPrice = slotHold?.estimated_total_price ?? totalPrice
      const res = await validateVoucher(voucherCode.trim(), currentPrice, undefined, Array.from(selectedServiceIds))
      setAppliedVoucher({
        code: res.voucher_code,
        discount_amount: res.discount_amount,
        final_amount: res.final_amount,
      })
      toast({
        title: "Áp dụng mã giảm giá thành công",
        description: `Giảm ${formatVND(res.discount_amount)} cho đơn hàng này.`,
      })
    } catch (err: any) {
      setAppliedVoucher(null)
      const msg = err?.response?.data?.message || "Mã giảm giá không hợp lệ, hết hạn hoặc không đủ điều kiện."
      setVoucherError(msg)
      toast({
        title: "Không thể áp dụng mã giảm giá",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setValidatingVoucher(false)
    }
  }

  const handleCreateBooking = async () => {
    if (!slotHold) return

    setSubmitting(true)
    try {
      let finalNotes = notes.trim()
      if (contactName || contactPhone || contactEmail) {
        finalNotes = `[Liên hệ: ${contactName} - ${contactPhone}${contactEmail ? ` - ${contactEmail}` : ''}]\n${finalNotes}`.trim()
      }

      const booking = await createBooking({
        slot_hold_token: slotHold.slot_hold_token,
        voucher_code: appliedVoucher ? appliedVoucher.code : (voucherCode.trim() || undefined),
        notes: finalNotes || undefined,
        contact_name: contactName,
        contact_phone: contactPhone,
        license_plate: selectedVehicle?.license_plate || licensePlate,
        vehicle_brand: selectedVehicle?.brand || brand,
        vehicle_model: selectedVehicle?.model || model,
        vehicle_size: vehicleSize ?? undefined,
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

  const handleNext = async () => {
    if (step === 2) {
      if (!selectedSlot || !vehicleSize || selectedServiceIds.size === 0) return

      if (slotHold && new Date(slotHold.expires_at).getTime() > Date.now()) {
        setStep(3)
        return
      }

      setHoldLoadingSlotId(selectedSlot.slot_id)
      try {
        const hold = await holdSlot({
          slot_id: selectedSlot.slot_id,
          service_ids: Array.from(selectedServiceIds),
          vehicle_size: vehicleSize,
        })
        setSlotHold(hold)
        setStep(3)
        toast({
          title: "Đã giữ slot",
          description: "Bạn có 5 phút để xác nhận booking.",
        })
      } catch (error) {
        const { message } = getApiError(error)
        setSelectedSlot(null)
        setSlotHold(null)
        toast({
          title: "Không giữ được slot",
          description: message,
          variant: "destructive",
        })
      } finally {
        setHoldLoadingSlotId(null)
      }
    } else {
      setStep((current) => Math.min(4, current + 1) as Step)
    }
  }

  // Khi back từ step xác nhận — giải phóng slot hold ngay để trả capacity cho slot
  const handleBack = async () => {
    if (step === 3 && slotHold) {
      try {
        await releaseSlotHold(slotHold.slot_hold_token, 'User went back before confirmation')
      } catch {
        // Silent fail — slot tự expire sau 5 phút, không block UX
      }
      setSlotHold(null)
      setSelectedSlot(null)
    }
    setStep((current) => Math.max(0, current - 1) as Step)
  }

  const canGoNext = [
    Boolean(vehicleSize), // Bước 1 -> 2
    selectedServiceIds.size > 0, // Bước 2 -> 3
    Boolean(selectedSlot), // Bước 3 -> 4 (Chỉ cần có chọn slot là nút sáng lên)
    Boolean(slotHold && holdRemainingSeconds > 0 && contactName && contactPhone && contactEmail && (vehicleId || licensePlate)), // Bước 4 -> 5
    Boolean(slotHold && holdRemainingSeconds > 0) // Xác nhận đặt lịch
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
        <section className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground text-balance">Xe của bạn thuộc cỡ nào?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Kích cỡ xe quyết định giá dịch vụ và thời lượng dự kiến.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-900/50">
                  <Info className="size-4 animate-pulse" />
                  Hướng dẫn chọn size xe
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Hướng dẫn phân loại cỡ xe (Size)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 text-sm text-muted-foreground">
                  <p>AutoWash phân loại xe thành 3 cỡ cơ bản để tính toán thời gian và lượng dung dịch rửa xe cho phù hợp:</p>
                  <ul className="space-y-2 list-disc pl-4">
                    <li><strong>Cỡ nhỏ (S):</strong> Hatchback, Sedan hạng A/B/C, xe điện cỡ nhỏ (VD: Kia Morning, Vios, VF5, Mazda 3).</li>
                    <li><strong>Cỡ vừa (M):</strong> Sedan hạng D, CUV, SUV cỡ nhỏ, xe 5+2 (VD: Camry, CR-V, CX-5, VF8).</li>
                    <li><strong>Cỡ lớn (L):</strong> SUV full-size, MPV, Bán tải (VD: Everest, Sedona, Ranger, VF9).</li>
                  </ul>
                  <p className="pt-2 text-primary"><em>Nếu xe của bạn đã được thêm trong mục Phương tiện, hệ thống sẽ tự động hiển thị xe vào đúng nhóm kích cỡ.</em></p>
                </div>
              </DialogContent>
            </Dialog>
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
                    "relative flex min-h-52 flex-col gap-4 rounded-3xl border p-5 text-left transition-all duration-300",
                    active 
                      ? "border-primary bg-gradient-to-br from-primary/10 to-transparent shadow-lg shadow-primary/20 ring-2 ring-primary" 
                      : "border-border bg-card hover:-translate-y-1 hover:border-primary/40 hover:shadow-md",
                  )}
                >
                  {active && (
                    <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary shadow-sm animate-in zoom-in">
                      <Check className="size-3.5 text-white" />
                    </span>
                  )}
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/80 text-primary transition-transform group-hover:scale-105">
                    <Car className={cn("size-8 transition-transform", active && "scale-110", option.key === "LARGE" && "size-10")} />
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <p className="text-lg font-bold text-foreground tracking-tight">{option.label}</p>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">{option.sub}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{option.desc}</p>
                  </div>
                  {matchingVehicles.length > 0 && (
                    <div className="mt-auto space-y-2">
                      <div className="rounded-lg bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary">
                        Xe đã lưu:
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {matchingVehicles.map(v => (
                          <div 
                            key={v.vehicle_id}
                            className={cn(
                              "text-xs px-2 py-1.5 rounded-md border",
                              vehicleId === v.vehicle_id ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setVehicleId(v.vehicle_id);
                              setVehicleSize(option.key);
                              setLicensePlate(v.license_plate);
                              setBrand(v.brand);
                              setModel(v.model);
                            }}
                          >
                            <span className="font-mono font-medium">{v.license_plate}</span> • {v.brand} {v.model}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {step === 1 && vehicleSize && (
        <section className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <div>
            <h2 className="text-xl font-bold text-foreground text-balance">Chọn dịch vụ bạn cần</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Giá hiển thị theo cỡ xe: <span className="font-semibold text-primary">{selectedSizeOption?.label}</span>
            </p>
          </div>

          {servicesLoading && (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
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

          {selectedServiceIds.size > 0 && <div className="h-28" />}

          {selectedServiceIds.size > 0 && (
            <div className="fixed bottom-6 left-0 right-0 z-50 mx-4 sm:mx-auto max-w-3xl animate-in slide-in-from-bottom-6 fade-in duration-500">
              <div className="flex items-center gap-4 rounded-full border border-border/50 bg-background/80 backdrop-blur-xl px-6 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-5" />
                  <span className="font-semibold text-foreground">{totalMinutes} phút</span>
                </div>
                <div className="h-6 w-px bg-border/50" />
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-muted-foreground">Tổng cộng</span>
                  <p className="font-mono text-lg font-extrabold text-primary leading-none mt-0.5">{formatVND(totalPrice)}</p>
                </div>
                <Button size="lg" className="rounded-full shadow-md shadow-primary/20 px-8" onClick={handleNext}>
                  Tiếp theo <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
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

          {slotHold && (
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-4 animate-in fade-in duration-300",
                holdRemainingSeconds <= 60
                  ? "border-destructive/30 bg-destructive/5 text-destructive animate-pulse"
                  : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400",
              )}
            >
              <TimerReset className="size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Slot đang được giữ</p>
                <p className="text-xs opacity-80">Hoàn tất booking trước khi hết thời gian.</p>
              </div>
              <span className="font-mono text-lg font-bold">{formatCountdown(holdRemainingSeconds)}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {Array.from({ length: bookingWindowDays + 1 }, (_, i) => {
                const d = addDays(todayStart(), i);
                const isSelected = formatDateParam(d) === formatDateParam(selectedDate);
                const dayName = new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(d);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDateChange(d)}
                    className={cn(
                      "flex min-w-[72px] shrink-0 snap-start flex-col items-center justify-center rounded-3xl border p-4 transition-all duration-300",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                        : "bg-card border-border hover:border-primary/40 hover:-translate-y-1 hover:shadow-md text-muted-foreground"
                    )}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{dayName}</span>
                    <span className={cn("mt-1.5 text-2xl font-extrabold leading-none", isSelected ? "text-primary-foreground" : "text-foreground")}>
                      {d.getDate()}
                    </span>
                    <span className="mt-1 text-[10px] font-medium opacity-60">{d.getMonth() + 1}/{d.getFullYear().toString().slice(2)}</span>
                  </button>
                );
              })}
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
                    <SummaryRow label="Thời lượng dự kiến" value={`${availability.estimated_duration_minutes} phút`} strong />
                    <SummaryRow
                      label="Số khoang/slot cần giữ"
                      value={`${availability.num_slots_required} khoang`}
                      mono
                    />
                  </div>

                  {availability.available_slots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {availability.available_slots.map((slot) => {
                        const selected = selectedSlot?.slot_id === slot.slot_id
                        const loading = holdLoadingSlotId === slot.slot_id
                        const slotEnd = addMinutesToTime(slot.start_time, availability.estimated_duration_minutes)
                        const isFull = slot.remaining_capacity < availability.num_slots_required
                        const isAlmostFull = !isFull && slot.remaining_capacity <= 2

                        return (
                          <button
                            key={slot.slot_id}
                            type="button"
                            disabled={Boolean(holdLoadingSlotId) || isFull}
                            onClick={() => handleSelectSlot(slot)}
                            className={cn(
                              "relative overflow-hidden rounded-full border p-3 text-center transition-all duration-300 group",
                              isFull
                                ? "border-border/50 bg-muted/40 text-muted-foreground opacity-40 cursor-not-allowed"
                                : selected
                                  ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/20 ring-offset-1 ring-offset-background"
                                  : "border-border bg-card hover:border-primary/50 hover:bg-primary/5 hover:shadow-md",
                              loading && "cursor-wait opacity-80",
                            )}
                          >
                            <span className="relative z-10 flex flex-col items-center gap-0.5">
                              <span className="flex items-center gap-1.5">
                                {selected && !isFull && <Check className="size-3.5 animate-in zoom-in" />}
                                <span className={cn("font-mono text-[15px] font-extrabold tracking-tight", isFull ? "line-through text-muted-foreground" : selected ? "text-primary-foreground" : "text-foreground")}>
                                  {slot.start_time}
                                </span>
                                {loading && <Loader2 className="size-3.5 animate-spin" />}
                              </span>
                              <span className={cn("text-[10px] font-medium opacity-80", isFull ? "text-muted-foreground" : selected ? "text-primary-foreground" : "text-muted-foreground")}>
                                {isFull ? "đã kín" : `đến ${availability.booking_type === "WASH" ? slotEnd : slot.end_time || "kết thúc"}`}
                              </span>
                            </span>
                            
                            {!selected && isAlmostFull && availability.booking_type === "WASH" && (
                              <span className="absolute right-2 top-2 size-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" />
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

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <LegendItem className="border-primary bg-primary" label="Đang chọn" />
                    <LegendItem className="border-border bg-background" label="Còn trống" />
                    <LegendItem className="border-orange-500 bg-orange-500" label="Sắp hết chỗ" />
                    <LegendItem className="border-border/50 bg-muted/40 opacity-50" label="Đã kín" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div>
            <h2 className="text-xl font-bold text-foreground text-balance">Thông tin khách hàng & Xe</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Thông tin này sẽ được dùng để liên hệ và quản lý xe của bạn.
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
                <p className="text-xs opacity-80">Hoàn tất booking trước khi hết thời gian.</p>
              </div>
              <span className="font-mono text-lg font-bold">{formatCountdown(holdRemainingSeconds)}</span>
            </div>
          )}

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
              <User className="size-4 text-primary" /> Thông tin liên hệ
            </h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-muted-foreground">Họ và tên</label>
                <Input 
                  placeholder="Nhập họ tên" 
                  value={contactName} 
                  onChange={(e) => setContactName(e.target.value)} 
                  className="rounded-xl bg-secondary/30 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-all"
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-muted-foreground">Số điện thoại</label>
                <Input 
                  placeholder="Nhập số điện thoại" 
                  value={contactPhone} 
                  onChange={(e) => setContactPhone(e.target.value)} 
                  className="rounded-xl bg-secondary/30 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-all"
                />
              </div>
              <div className="space-y-2.5 sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Email liên hệ (nhận thông báo và xác nhận T-2h)</label>
                <Input 
                  type="email"
                  placeholder="VD: name@example.com" 
                  value={contactEmail} 
                  onChange={(e) => setContactEmail(e.target.value)} 
                  className="rounded-xl bg-secondary/30 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-all"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
              <Car className="size-4 text-primary" /> Thông tin xe
            </h3>
            {vehicleId ? (
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
                <div className="relative flex h-16 sm:h-20 items-center gap-3 overflow-hidden rounded-xl border-2 border-slate-800 bg-white shadow-sm w-max px-4 pr-6 select-none">
                  <div className="absolute bottom-0 left-0 top-0 flex w-8 flex-col items-center justify-center bg-blue-600 text-white">
                    <span className="text-[10px] font-bold">VN</span>
                  </div>
                  <span className="ml-8 font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-slate-900">{selectedVehicle?.license_plate || licensePlate}</span>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {selectedVehicle?.brand || brand} {selectedVehicle?.model || model}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setVehicleId("")} className="rounded-full h-8 text-xs">Đổi xe khác</Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Biển số xe</label>
                  <Input 
                    placeholder="VD: 51H-12345" 
                    value={licensePlate} 
                    onChange={(e) => setLicensePlate(e.target.value)} 
                    className="font-mono uppercase text-lg h-12 rounded-xl bg-secondary/30 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-muted-foreground">Hãng xe</label>
                  <Input 
                    placeholder="VD: Toyota" 
                    value={brand} 
                    onChange={(e) => setBrand(e.target.value)} 
                    className="rounded-xl bg-secondary/30 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-muted-foreground">Dòng xe</label>
                  <Input 
                    placeholder="VD: Camry" 
                    value={model} 
                    onChange={(e) => setModel(e.target.value)} 
                    className="rounded-xl bg-secondary/30 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-all"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10 p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-4">
              <Tag className="size-4" /> Voucher và Ghi chú
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={voucherCode}
                    onChange={(event) => {
                      setVoucherCode(event.target.value)
                      setVoucherError("")
                      if (appliedVoucher && event.target.value.trim().toUpperCase() !== appliedVoucher.code) {
                        setAppliedVoucher(null)
                      }
                    }}
                    placeholder="Nhập mã voucher nếu có"
                    className="pl-4 font-mono uppercase h-12 rounded-xl border-dashed border-2 border-emerald-500/30 bg-white/50 dark:bg-background/50 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={validatingVoucher || !voucherCode.trim()}
                    className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0"
                  >
                    {validatingVoucher ? <Loader2 className="size-4 animate-spin" /> : "Áp dụng"}
                  </Button>
                </div>
                {voucherError && (
                  <p className="text-xs font-medium text-destructive">{voucherError}</p>
                )}
                {appliedVoucher && (
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ✓ Đã áp dụng mã {appliedVoucher.code}: Giảm {formatVND(appliedVoucher.discount_amount)}
                  </p>
                )}
              </div>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ghi chú cho cửa hàng, ví dụ: xe có vết xước nhỏ bên hông phải"
                className="min-h-24 rounded-xl bg-white/50 dark:bg-background/50 border-emerald-500/20 focus-visible:ring-emerald-500/20"
              />
            </div>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="animate-in fade-in zoom-in-95 duration-500 pt-4 pb-12">
          <div className="mx-auto max-w-2xl relative">
            {/* Ticket Header Decorator */}
            <div className="absolute -top-3 left-6 right-6 h-6 rounded-t-3xl bg-primary/20 blur-xl" />
            
            <div className="relative rounded-3xl bg-card shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border/50 overflow-hidden">
              {/* Receipt sawtooth top border effect using CSS or simple gradient */}
              <div className="h-2 w-full bg-[radial-gradient(circle,hsl(var(--background))_4px,transparent_4px)] bg-[length:12px_12px] -mt-1 flex" />

              <div className="p-6 sm:p-8 space-y-6">
                {/* Timer Badge Centered */}
                {slotHold && (
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "inline-flex items-center gap-2 rounded-full px-5 py-2 font-mono text-xl font-bold shadow-sm transition-all",
                      holdRemainingSeconds <= 60
                        ? "bg-destructive text-destructive-foreground animate-pulse shadow-destructive/30"
                        : "bg-primary text-primary-foreground shadow-primary/30"
                    )}>
                      <TimerReset className="size-5" />
                      {formatCountdown(holdRemainingSeconds)}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">Thời gian giữ chỗ còn lại trước khi slot tự động hết hạn</p>
                  </div>
                )}

                <div className="text-center pb-2 border-b border-border/60">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground uppercase">XÁC NHẬN ĐẶT LỊCH HẸN</h2>
                  <p className="mt-1 text-sm text-muted-foreground font-mono">Phiếu xác nhận thông tin & hóa đơn dịch vụ</p>
                </div>

                {/* 2-Column Bento Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Card */}
                  <div className="rounded-2xl border border-border/80 bg-secondary/20 p-5 space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <User className="size-4 text-primary" /> Khách hàng & Liên hệ
                    </h3>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-muted-foreground">Họ và tên:</span>
                        <span className="font-semibold text-foreground text-right">{contactName || profile?.full_name || "Chưa nhập"}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-muted-foreground">Số điện thoại:</span>
                        <span className="font-mono font-bold text-foreground text-right">{contactPhone || profile?.phone || "Chưa nhập"}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2 pt-1 border-t border-border/40">
                        <span className="text-muted-foreground flex items-center gap-1"><Mail className="size-3.5" /> Email T-2h:</span>
                        <span className="font-mono text-xs font-semibold text-primary break-all text-right">{contactEmail || profile?.email || "Chưa cập nhật"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Card */}
                  <div className="rounded-2xl border border-border/80 bg-secondary/20 p-5 space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Car className="size-4 text-primary" /> Thông tin Phương tiện
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Biển số xe:</span>
                        <div className="inline-flex items-center overflow-hidden rounded-md border border-border shadow-sm font-mono font-bold text-sm bg-background">
                          <span className="bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">VN</span>
                          <span className="px-2 py-0.5 tracking-wider">{selectedVehicle?.license_plate || licensePlate || "CHƯA NHẬP"}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-muted-foreground">Hãng & Dòng xe:</span>
                        <span className="font-medium text-foreground text-right">
                          {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : (brand && model ? `${brand} ${model}` : "Chưa nhập")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-border/40">
                        <span className="text-muted-foreground">Phân hạng xe:</span>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                          {VEHICLE_SIZE_LABELS[vehicleSize || "MEDIUM"] || vehicleSize}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services & Time Details */}
                <div className="rounded-2xl border border-border/80 bg-secondary/20 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <CalendarIcon className="size-4 text-primary" /> Thời gian & Dịch vụ đã chọn
                    </h3>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span className="font-mono text-primary font-bold">{selectedSlot?.start_time} - {selectedSlot?.end_time || addMinutesToTime(selectedSlot?.start_time || "00:00", totalMinutes)}</span>
                      <span>•</span>
                      <span>{formatDateVi(selectedDate)}</span>
                    </div>
                  </div>

                  <div className="divide-y divide-border/40">
                    {selectedServices.map((service) => (
                      <div key={service.service_id} className="py-2.5 flex justify-between items-start gap-4 first:pt-0 last:pb-0">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{service.name}</span>
                            <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                              {service.categoryName}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3 text-primary" /> {service.estimated_duration_minutes} phút
                          </p>
                        </div>
                        <span className="font-mono text-sm font-bold text-foreground whitespace-nowrap">{formatVND(service.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <span>Tổng thời gian thực hiện dự kiến</span>
                    <span className="font-mono font-bold text-foreground text-sm">{totalMinutes} phút</span>
                  </div>
                </div>

                {/* Customer Notes Box */}
                <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10 p-5 space-y-3">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    <MessageSquare className="size-4 text-amber-600 dark:text-amber-400" /> Ghi chú cho cửa hàng (Mong muốn hoặc lưu ý đặc biệt)
                  </h3>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nhập mong muốn hoặc lưu ý cho thợ (VD: xe có vết xước nhẹ cửa bên phải, cần hút bụi kỹ cốp xe, hay gọi lại xác nhận trước 15 phút...)"
                    className="min-h-20 rounded-xl bg-white/80 dark:bg-background/80 border-amber-500/30 focus-visible:ring-amber-500/20 text-sm font-medium"
                  />
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Info className="size-3 text-amber-500" /> Ghi chú này sẽ hiển thị trực tiếp cho quản lý và thợ chăm sóc xe khi tiếp nhận phương tiện.
                  </p>
                </div>

                {/* Final Price Breakdown */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tạm tính dịch vụ</span>
                    <span className="font-mono font-semibold text-foreground">{formatVND(slotHold?.estimated_total_price ?? totalPrice)}</span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Voucher áp dụng ({appliedVoucher.code})</span>
                      <span className="font-mono font-bold">-{formatVND(appliedVoucher.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-3 border-t border-primary/10">
                    <div>
                      <span className="text-sm font-bold uppercase text-foreground block">Tổng thanh toán dự kiến</span>
                      <span className="text-[11px] text-muted-foreground">Thanh toán sau khi hoàn tất nghiệm thu dịch vụ</span>
                    </div>
                    <span className="font-mono text-2xl sm:text-3xl font-extrabold text-primary">
                      {formatVND(appliedVoucher ? appliedVoucher.final_amount : (slotHold?.estimated_total_price ?? totalPrice))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Massive CTA */}
              <div className="p-6 bg-secondary/30 border-t border-border">
                <Button
                  size="lg"
                  className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25 relative overflow-hidden group"
                  onClick={handleCreateBooking}
                  disabled={!canGoNext[4] || submitting}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  {submitting ? (
                    <><Loader2 className="mr-2 size-5 animate-spin" /> Đang chốt lịch...</>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="size-5" /> XÁC NHẬN ĐẶT LỊCH HẸN
                    </span>
                  )}
                </Button>
                <div className="mt-4 flex justify-center">
                   <Button variant="ghost" size="sm" onClick={handleBack} disabled={submitting} className="text-muted-foreground">
                     <ChevronLeft className="size-4 mr-1" /> Quay lại sửa thông tin
                   </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {step !== 1 && step !== 4 && (
        <div className="flex items-center justify-between gap-3 pt-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Button
            variant="outline"
            className="rounded-xl h-11 px-6 shadow-sm bg-card hover:bg-secondary/50"
            onClick={handleBack}
            disabled={step === 0 || submitting}
          >
            <ChevronLeft className="size-4 mr-1" />
            Quay lại
          </Button>

          <Button
            className="rounded-xl h-11 px-8 shadow-md shadow-primary/20"
            onClick={handleNext}
            disabled={!canGoNext[step] || holdLoadingSlotId !== null}
          >
            {holdLoadingSlotId !== null ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            Tiếp theo <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      )}

      {step === 1 && selectedServiceIds.size === 0 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="outline" onClick={handleBack} className="rounded-xl bg-card">
            <ChevronLeft className="size-4 mr-1" />
            Quay lại cỡ xe
          </Button>
        </div>
      )}
    </div>
  )
}

export { SUCCESS_STORAGE_KEY }
