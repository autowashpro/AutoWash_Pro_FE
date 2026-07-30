"use client"

import { useState, useEffect, useMemo } from "react"
import { Check, UserPlus, Search, Loader2, AlertCircle, Sparkles, Droplets, Layers, ShieldCheck, Car, ChevronDown, ChevronUp, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatVND } from "@/lib/data"
import { createWalkinBooking, checkAvailability, getManagerSlots } from "@/lib/api/bookings"
import { searchCustomerByPhone, getCarWashers } from "@/lib/api"
import { getManagerServices } from "@/lib/api/services"
import type { CustomerProfile, VehicleSize, CarWasher } from "@/lib/types"
import { toast } from "sonner"
import { getLocalDateString } from "@/lib/utils"

function fixMojibake(str: string): string {
  if (!str) return ""
  let current = str
  for (let pass = 0; pass < 2; pass++) {
    if (/[\u00C0-\u00FF]/.test(current)) {
      try {
        const decoded = decodeURIComponent(escape(current))
        if (decoded && decoded !== current) {
          current = decoded
          continue
        }
      } catch {
        // ignore URIError / decoding errors
      }
    }
    break
  }
  return current
}

function WalkInServiceGroupSection({
  group,
  selectedServiceIds,
  toggleService,
  vehicleSize,
}: {
  group: { id: string; name: string; services: any[] }
  selectedServiceIds: Set<string>
  toggleService: (id: string) => void
  vehicleSize: VehicleSize
}) {
  const isDefaultOpen = Boolean(
    group.name.toLowerCase().includes("rửa") || group.name.toLowerCase().includes("combo")
  )
  const [isOpen, setIsOpen] = useState(isDefaultOpen)

  const selectedInGroupCount = useMemo(
    () =>
      group.services.filter((s) => {
        const sId = s.service_id || s.serviceId || s.id || ""
        return selectedServiceIds.has(sId)
      }).length,
    [group.services, selectedServiceIds]
  )

  const getCategoryIcon = (catName: string) => {
    const norm = catName.toLowerCase()
    if (norm.includes("rửa") || norm.includes("combo")) return <Droplets className="size-4 text-sky-500" />
    if (norm.includes("vệ sinh trong") || norm.includes("nội thất") || norm.includes("sinh")) return <Car className="size-4 text-emerald-500" />
    if (norm.includes("vệ sinh ngoài") || norm.includes("ngoại thất")) return <Sparkles className="size-4 text-amber-500" />
    if (norm.includes("xử lý") || norm.includes("bề mặt") || norm.includes("sơn")) return <Layers className="size-4 text-indigo-500" />
    if (norm.includes("bảo vệ") || norm.includes("phủ") || norm.includes("ceramic")) return <ShieldCheck className="size-4 text-rose-500" />
    return <Sparkles className="size-4 text-primary" />
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300">
      {/* Category Header Button (Accordion Trigger) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 border-b border-border/60 bg-muted/40 px-4 py-3 hover:bg-muted/70 transition-colors text-left group"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {getCategoryIcon(group.name)}
          <span className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {group.name}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground shrink-0">
            {group.services.length} dịch vụ
          </span>
          {selectedInGroupCount > 0 && (
            <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-extrabold flex items-center gap-1 shrink-0 animate-in zoom-in-95">
              <Check className="size-3" /> Đã chọn {selectedInGroupCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary shrink-0">
          <span className="text-xs font-medium hidden sm:inline-block">
            {isOpen ? "Thu gọn" : "Xem dịch vụ"}
          </span>
          {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
      </button>

      {/* Services List inside Accordion */}
      {isOpen && (
        <div className="divide-y divide-border animate-in fade-in duration-200">
          {group.services.map((s) => {
            const sId = s.service_id || s.serviceId || s.id || ""
            const price =
              vehicleSize === "SMALL"
                ? (s.small_price ?? s.smallPrice ?? 0)
                : vehicleSize === "LARGE"
                ? (s.large_price ?? s.largePrice ?? 0)
                : (s.medium_price ?? s.mediumPrice ?? 0)
            const isChecked = selectedServiceIds.has(sId)

            return (
              <div
                key={sId}
                onClick={() => toggleService(sId)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 ${
                  isChecked ? "bg-primary/5 hover:bg-primary/10" : "bg-card hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      isChecked ? "border-primary bg-primary text-white scale-110" : "border-border text-transparent"
                    }`}
                  >
                    <Check className="size-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium transition-colors truncate ${isChecked ? "text-primary font-semibold" : "text-foreground"}`}>
                      {fixMojibake(s.name)}
                    </p>
                    {s.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-md">{fixMojibake(s.description)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {s.estimated_duration_minutes && (
                    <span className="hidden sm:flex items-center gap-1 rounded-full bg-secondary/80 px-2 py-0.5 text-xs text-muted-foreground font-medium">
                      <Clock className="size-3" />
                      {s.estimated_duration_minutes} phút
                    </span>
                  )}
                  <span className={`font-mono text-sm font-bold ${isChecked ? "text-primary" : "text-foreground"}`}>
                    {formatVND(price || s.price || 0)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function WalkInForm() {
  // Section 1: Customer
  const [phone, setPhone] = useState("")
  const [foundCustomer, setFoundCustomer] = useState<CustomerProfile | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchedPhone, setSearchedPhone] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [useFound, setUseFound] = useState(false)

  // Section 2: Vehicle
  const [plate, setPlate] = useState("")
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>("MEDIUM")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [color, setColor] = useState("")

  // Section 3: Service — multi-select (Set of IDs)
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set())
  const [activeServices, setActiveServices] = useState<any[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)

  const groupedServices = useMemo(() => {
    const categoryMap: Record<string, { id: string; name: string; services: any[] }> = {}
    
    activeServices.forEach((s) => {
      const rawCatName = s.category_name || s.categoryName || s.CategoryName || "Dịch vụ khác"
      const cleanedName = fixMojibake(rawCatName).trim()
      const normKey = cleanedName.toLowerCase() || "dich-vu-khac"

      if (!categoryMap[normKey]) {
        // Format category display name nicely (capitalize first character)
        const displayName = cleanedName ? (cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1)) : "Dịch vụ khác"
        categoryMap[normKey] = {
          id: s.category_id || s.categoryId || s.CategoryId || normKey,
          name: displayName,
          services: [],
        }
      }

      const cleanedService = {
        ...s,
        name: fixMojibake(s.name || s.Name || ""),
        description: fixMojibake(s.description || s.Description || ""),
      }

      categoryMap[normKey].services.push(cleanedService)
    })

    return Object.values(categoryMap)
  }, [activeServices])

  const totalPrice = activeServices
    .filter(s => selectedServiceIds.has(s.service_id || s.serviceId || s.id))
    .reduce((sum, s) => {
      const price =
        vehicleSize === "SMALL"
          ? (s.small_price ?? s.smallPrice ?? 0)
          : vehicleSize === "LARGE"
          ? (s.large_price ?? s.largePrice ?? 0)
          : (s.medium_price ?? s.mediumPrice ?? 0)
      return sum + (price || s.price || 0)
    }, 0)

  const toggleService = (id: string) => {
    setSelectedServiceIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
    setSelectedSlot("")
  }

  // Section 4: Schedule
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString())
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState("")

  // Section 5: Washer
  const [washers, setWashers] = useState<CarWasher[]>([])
  const [washersLoading, setWashersLoading] = useState(false)
  const [selectedWasherId, setSelectedWasherId] = useState("")

  const [created, setCreated] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true)
        const res = await getManagerServices(vehicleSize)
        const activeOnly = (res || []).filter((s: any) => (s.status === "ACTIVE" || s.Status === "ACTIVE") && !s.isDeleted && !s.is_deleted)
        setActiveServices(activeOnly)
      } catch (error) {
        console.error("Failed to load services:", error)
        const { SERVICES } = await import("@/lib/data")
        setActiveServices(SERVICES.filter((s: any) => s.active))
      } finally {
        setServicesLoading(false)
      }
    }
    fetchServices()
  }, [vehicleSize])

  useEffect(() => {
    const fetchWashers = async () => {
      try {
        setWashersLoading(true)
        const res = await getCarWashers()
        setWashers(res || [])
      } catch (error) {
        console.error("Failed to load car washers:", error)
        toast.error("Lỗi khi tải danh sách nhân viên")
      } finally {
        setWashersLoading(false)
      }
    }
    fetchWashers()
  }, [])

  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedServiceIds.size === 0) { setAvailableSlots([]); return }
      try {
        setSlotsLoading(true)
        try {
          const res = await checkAvailability({ date: selectedDate, service_ids: Array.from(selectedServiceIds), vehicle_size: vehicleSize as any })
          setAvailableSlots(res.available_slots || [])
        } catch (checkErr) {
          console.warn("checkAvailability failed, fallback to getManagerSlots", checkErr)
          const allSlots = await getManagerSlots(selectedDate)
          const availableManagerSlots = allSlots
            .filter(s => s.status !== "BLOCKED" && s.status !== "FULLY_BOOKED" && (s.booked_count ?? 0) < (s.capacity ?? 1))
            .map(s => ({ slot_id: s.slot_id, start_time: s.start_time, end_time: s.end_time, remaining_capacity: (s.capacity ?? 1) - (s.booked_count ?? 0) }))
          setAvailableSlots(availableManagerSlots)
        }
        setSelectedSlot("")
      } catch (error) {
        console.error("getAllSlots failed:", error)
        toast.error("Lỗi khi tải danh sách giờ trống")
        setAvailableSlots([])
      } finally {
        setSlotsLoading(false)
      }
    }
    fetchSlots()
  }, [selectedDate, selectedServiceIds, vehicleSize])

  const handleSearch = async () => {
    if (!phone.trim()) return
    setIsSearching(true)
    setFoundCustomer(null)
    setHasSearched(true)
    setSearchedPhone(phone.trim())
    try {
      const result = await searchCustomerByPhone(phone.trim())
      setFoundCustomer(result)
      if (!result) {
        toast.error(`Không tìm thấy khách hàng với SĐT: ${phone.trim()}`, {
          description: "Vui lòng nhập họ tên và email bên dưới để tạo tài khoản mới.",
        })
      } else {
        toast.success(`Đã tìm thấy khách hàng: ${result.full_name}`)
      }
    } catch (err: any) {
      console.warn("searchCustomerByPhone error:", err)
      setFoundCustomer(null)
      const beMsg = err?.response?.data?.message || err?.response?.data?.Message
      toast.error(beMsg || `Không tìm thấy khách hàng với SĐT: ${phone.trim()}`, {
        description: "Vui lòng nhập họ tên và email bên dưới để tạo tài khoản mới.",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleUseCustomer = () => {
    if (!foundCustomer) return
    setCustomerName(foundCustomer.full_name)
    setCustomerEmail(foundCustomer.email)
    setUseFound(true)
  }

  const handleCreateNew = () => { setFoundCustomer(null); setUseFound(false); setHasSearched(false) }

  const isValid =
    phone &&
    (useFound || (customerName && customerEmail)) &&
    plate && vehicleSize && brand && model && color &&
    selectedServiceIds.size > 0 &&
    selectedSlot &&
    selectedWasherId

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    try {
      setSubmitLoading(true)
      setSubmitError(null)
      await createWalkinBooking({
        customerInfo: { fullName: customerName, phone, email: customerEmail || `${phone}@autowash.vn`, tempPassword: "TempPassword123@" },
        vehicle: { licensePlate: plate, brand, model, color, vehicleSize },
        slotId: selectedSlot,
        serviceIds: Array.from(selectedServiceIds),
        carWasherId: selectedWasherId,
      })
      toast.success("Tạo phiếu Walk-in thành công")
      setCreated(true)
    } catch (error: any) {
      console.error(error)
      const beMessage = error?.response?.data?.message || error?.response?.data?.Message || error?.message || "Lỗi khi tạo phiếu Walk-in"
      const isPlateConflict = beMessage.includes("biển số") || beMessage.toLowerCase().includes("license") || beMessage.toLowerCase().includes("plate") || error?.response?.data?.business_code === "CONFLICT"
      if (isPlateConflict) {
        setSubmitError(`${beMessage} - Neu xe nay thuoc khach hang co tai khoan, hay tim SDT o Buoc 1 va chon "Dùng thông tin này".`)
      } else {
        setSubmitError(beMessage)
      }
      toast.error(beMessage, { duration: 8000 })
    } finally {
      setSubmitLoading(false)
    }
  }

  if (created) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success"><Check className="size-7" /></span>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground">Đã tạo phiếu dịch vụ Walk-in</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Phiếu cho khách {customerName} ({plate}) đã được tạo.</p>
        <Button variant="outline" className="mt-6" onClick={() => {
          setPhone(""); setFoundCustomer(null); setUseFound(false); setHasSearched(false); setSearchedPhone(""); setCustomerName(""); setCustomerEmail("")
          setPlate(""); setVehicleSize("MEDIUM"); setBrand(""); setModel(""); setColor("")
          setSelectedServiceIds(new Set()); setSelectedSlot(""); setSelectedWasherId(""); setCreated(false); setSubmitError(null)
        }}>Tạo phiếu khác</Button>
      </div>
    )
  }

  return (
    <form className="space-y-6 pb-20" onSubmit={handleSubmit}>
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 border border-primary/30">
        <span className="text-sm font-semibold text-primary">Walk-in — Booking sẽ được phân công nhân viên</span>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
          <UserPlus className="size-4 text-primary" /> Thông tin khách hàng
        </h2>
        {!useFound ? (
          <>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (e.target.value !== searchedPhone) {
                    setHasSearched(false)
                    setFoundCustomer(null)
                  }
                }}
                placeholder="Số điện thoại"
                className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="button" variant="outline" onClick={handleSearch} disabled={!phone || isSearching} className="gap-2">
                {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Tìm kiếm
              </Button>
            </div>

            {hasSearched && !foundCustomer && !isSearching && (
              <div className="rounded-xl border border-amber-300/80 bg-amber-50 dark:bg-amber-950/20 p-3.5 text-amber-900 dark:text-amber-300 flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-sm">Không tìm thấy tài khoản cho SĐT: <span className="font-mono underline">{searchedPhone}</span></p>
                  <p className="text-muted-foreground">Không có dữ liệu khách hàng trùng khớp. Vui lòng nhập Họ tên và Email bên dưới để đăng ký mới cho khách hàng.</p>
                </div>
              </div>
            )}

            {foundCustomer && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{foundCustomer.full_name}</p>
                    <p className="text-xs text-muted-foreground">{foundCustomer.membership_tier} — Trust: {foundCustomer.trust_score} - {foundCustomer.phone}</p>
                  </div>
                  <Button type="button" size="sm" onClick={handleUseCustomer} className="bg-primary hover:bg-primary/90">Dùng tài khoản này</Button>
                </div>
              </div>
            )}

            {!foundCustomer && phone && !isSearching && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Tạo khách hàng mới</p>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Họ tên" className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <p className="text-xs text-muted-foreground">Mật khẩu tạm sẽ được gửi qua Welcome Email</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-border bg-success/10 p-3">
            <div>
              <p className="font-medium text-foreground">{customerName}</p>
              <p className="text-xs text-muted-foreground">{foundCustomer?.membership_tier || "Khách mới"} - {phone}</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={handleCreateNew}>Thay đổi</Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span> Thông tin xe
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <input type="text" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="Biển số (VD: 51A-123.45)" className="col-span-2 font-mono rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <select value={vehicleSize} onChange={(e) => setVehicleSize(e.target.value as VehicleSize)} className="rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="SMALL">Nhỏ (S)</option>
            <option value="MEDIUM">Vừa (M)</option>
            <option value="LARGE">Lớn (L)</option>
          </select>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Hãng xe" className="rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model" className="rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Màu" className="col-span-2 rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
          Dịch vụ
          {selectedServiceIds.size > 0 && (
            <span className="ml-auto rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">{selectedServiceIds.size} đã chọn</span>
          )}
        </h2>
        {servicesLoading ? (
          <div className="flex justify-center p-6"><Loader2 className="size-6 animate-spin text-primary" /></div>
        ) : activeServices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Không có dịch vụ nào</p>
        ) : (
          <div className="space-y-4">
            {groupedServices.map((group) => (
              <WalkInServiceGroupSection
                key={group.id || group.name}
                group={group}
                selectedServiceIds={selectedServiceIds}
                toggleService={toggleService}
                vehicleSize={vehicleSize}
              />
            ))}
          </div>
        )}
        {selectedServiceIds.size > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3 border border-primary/30 mt-2">
            <div>
              <span className="text-sm font-medium text-foreground">Tổng tiền dịch vụ</span>
              <span className="ml-2 text-xs text-muted-foreground">({selectedServiceIds.size} dịch vụ)</span>
            </div>
            <span className="font-mono text-lg font-bold text-primary">{formatVND(totalPrice)}</span>
          </div>
        )}
      </div>

      {selectedServiceIds.size > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">4</span> Lịch hẹn
          </h2>
          <div className="mb-4">
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Ngày</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" min={getLocalDateString()} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Giờ trống</label>
            {slotsLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không còn giờ trống cho ngày này</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <button key={slot.slot_id} type="button" onClick={() => setSelectedSlot(slot.slot_id)}
                    className={`rounded-lg border-2 px-2 py-1.5 text-xs font-semibold transition-all ${selectedSlot === slot.slot_id ? "border-primary bg-primary text-white" : "border-border bg-muted/30 text-foreground hover:border-primary/50"}`}>
                    {slot.start_time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">5</span> Nhân viên thực hiện
          </h2>
          {washersLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : (
            <select value={selectedWasherId} onChange={(e) => setSelectedWasherId(e.target.value)} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Chọn nhân viên</option>
              {washers.map((w) => (
                <option key={w.washerId} value={w.washerId}>{w.fullName} (Đang làm: {w.tasksToday} task)</option>
              ))}
            </select>
          )}
        </div>
      )}

      {submitError && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 dark:border-rose-800/40 dark:bg-rose-950/20">
          <p className="text-sm text-rose-700 dark:text-rose-400 whitespace-pre-line leading-relaxed">{submitError}</p>
        </div>
      )}

      <button type="submit" disabled={!isValid || submitLoading}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[var(--shadow-glow)]">
        {submitLoading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Tạo đặt lịch
      </button>
    </form>
  )
}
