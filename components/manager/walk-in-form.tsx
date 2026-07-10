"use client"

import { useState, useEffect } from "react"
import { Check, UserPlus, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatVND } from "@/lib/data"
import { createWalkinBooking, checkAvailability, getManagerSlots } from "@/lib/api/bookings"
import { searchCustomerByPhone, getCarWashers } from "@/lib/api"
import { getManagerServices } from "@/lib/api/services"
import type { CustomerProfile, VehicleSize, CarWasher } from "@/lib/types"
import { toast } from "sonner"
import { getLocalDateString } from "@/lib/utils"

export function WalkInForm() {
  // Section 1: Customer
  const [phone, setPhone] = useState("")
  const [foundCustomer, setFoundCustomer] = useState<CustomerProfile | null>(null)
  const [isSearching, setIsSearching] = useState(false)
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
    try {
      const result = await searchCustomerByPhone(phone.trim())
      setFoundCustomer(result)
      if (!result) toast.info("Không tìm thấy khách hàng — nhập thông tin để tạo mới")
    } catch (err: any) {
      console.warn("searchCustomerByPhone error:", err)
      setFoundCustomer(null)
      const beMsg = err?.response?.data?.message || err?.response?.data?.Message
      if (err?.response?.status === 404 || err?.response?.data?.business_code === "NOT_FOUND") {
        toast.info(beMsg || "Không tìm thấy khách hàng — nhập thông tin để tạo mới")
      } else {
        toast.error(beMsg || "Lỗi kết nối — nhập thông tin để tạo mới")
      }
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

  const handleCreateNew = () => { setFoundCustomer(null); setUseFound(false) }

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
          setPhone(""); setFoundCustomer(null); setUseFound(false); setCustomerName(""); setCustomerEmail("")
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
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <Button type="button" variant="outline" onClick={handleSearch} disabled={!phone || isSearching} className="gap-2">
                {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Tìm kiếm
              </Button>
            </div>
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

      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
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
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {activeServices.map((s) => {
              const sId = s.service_id || s.serviceId || s.id || ""
              const price = vehicleSize === "SMALL" ? (s.small_price ?? s.smallPrice ?? 0) : vehicleSize === "LARGE" ? (s.large_price ?? s.largePrice ?? 0) : (s.medium_price ?? s.mediumPrice ?? 0)
              const isChecked = selectedServiceIds.has(sId)
              return (
                <button key={sId} type="button" onClick={() => toggleService(sId)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 ${isChecked ? "bg-primary/5 hover:bg-primary/10" : "bg-background hover:bg-secondary/40"}`}>
                  <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${isChecked ? "border-primary bg-primary text-white scale-110" : "border-border text-transparent"}`}>
                    <Check className="size-3" />
                  </span>
                  <span className={`flex-1 text-sm font-medium transition-colors ${isChecked ? "text-primary font-semibold" : "text-foreground"}`}>{s.name}</span>
                  {s.estimated_duration_minutes && <span className="hidden sm:block shrink-0 text-xs text-muted-foreground">{s.estimated_duration_minutes} phút</span>}
                  <span className={`shrink-0 font-mono text-sm font-bold ${isChecked ? "text-primary" : "text-foreground"}`}>{formatVND(price || s.price || 0)}</span>
                </button>
              )
            })}
          </div>
        )}
        {selectedServiceIds.size > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3 border border-primary/30 mt-2">
            <div>
              <span className="text-sm font-medium text-foreground">Tổng tiền</span>
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
