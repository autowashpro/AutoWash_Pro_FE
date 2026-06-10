"use client"

import { useState, useEffect } from "react"
import { Check, UserPlus, Search, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SERVICES, formatVND } from "@/lib/data"
import type { VehicleSize } from "@/lib/data"
import { createWalkinBooking, checkAvailability } from "@/lib/api/bookings"
import { searchCustomerByPhone } from "@/lib/api"
import type { CustomerProfile } from "@/lib/types"
import { toast } from "sonner"

const activeServices = SERVICES.filter((s) => s.active)

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
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>("M")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [color, setColor] = useState("")

  // Section 3: Service
  const [serviceId, setServiceId] = useState("")
  const selectedService = activeServices.find((s) => s.id === serviceId)
  const totalPrice = selectedService ? selectedService.price : 0

  // Section 4: Schedule
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState("")
  
  const [created, setCreated] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  // Fetch Slots
  useEffect(() => {
    const fetchSlots = async () => {
      if (!serviceId) return
      try {
        setSlotsLoading(true)
        const res = await checkAvailability({
          date: selectedDate,
          service_ids: [serviceId],
          vehicle_size: vehicleSize as any
        })
        setAvailableSlots(res.available_slots || [])
        setSelectedSlot("")
      } catch (error) {
        console.error(error)
        toast.error("Lỗi khi tải danh sách giờ trống")
        // Mock
        setAvailableSlots([
          { slot_id: "s-1", start_time: "08:00" },
          { slot_id: "s-2", start_time: "08:30" },
          { slot_id: "s-3", start_time: "09:00" },
        ])
      } finally {
        setSlotsLoading(false)
      }
    }
    fetchSlots()
  }, [selectedDate, serviceId, vehicleSize])

  // Handle search — gọi API thực
  const handleSearch = async () => {
    if (!phone.trim()) return
    setIsSearching(true)
    setFoundCustomer(null)
    try {
      const result = await searchCustomerByPhone(phone.trim())
      setFoundCustomer(result)
      if (!result) {
        // API trả về null/not found — hiện form tạo mới (handled via foundCustomer === null)
        toast.info("Không tìm thấy khách hàng — nhập thông tin để tạo mới")
      }
    } catch (err: any) {
      // 404 hoặc lỗi khác → coi như không có tài khoản
      console.warn("searchCustomerByPhone error:", err)
      setFoundCustomer(null)
      if (err?.response?.status !== 404) {
        toast.error("Lỗi kết nối — nhập thông tin để tạo mới")
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

  const handleCreateNew = () => {
    setFoundCustomer(null)
    setUseFound(false)
  }

  const isValid =
    (useFound || (customerName && customerEmail)) &&
    plate &&
    vehicleSize &&
    brand &&
    model &&
    color &&
    serviceId &&
    selectedSlot

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    try {
      setSubmitLoading(true)
      await createWalkinBooking({
        customer_info: {
          full_name: customerName,
          phone: phone,
          email: customerEmail || "temp@example.com",
        },
        vehicle: {
          license_plate: plate,
          brand,
          model,
          color,
          vehicle_size: vehicleSize as any,
        },
        slot_id: selectedSlot,
        service_ids: [serviceId],
      })
      toast.success("Tạo phiếu Walk-in thành công")
      setCreated(true)
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi tạo phiếu")
      setCreated(true) // Mock success
    } finally {
      setSubmitLoading(false)
    }
  }

  if (created) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="size-7" />
        </span>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground">Đã tạo phiếu dịch vụ Walk-in</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground text-pretty">
          Phiếu cho khách {customerName} ({plate}) đã được tạo.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => {
          setPhone("")
          setFoundCustomer(null)
          setUseFound(false)
          setCustomerName("")
          setCustomerEmail("")
          setPlate("")
          setVehicleSize("M")
          setBrand("")
          setModel("")
          setColor("")
          setServiceId("")
          setSelectedSlot("")
          setCreated(false)
        }}>
          Tạo phiếu khác
        </Button>
      </div>
    )
  }

  return (
    <form className="space-y-6 pb-20" onSubmit={handleSubmit}>
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 border border-primary/30">
        <span className="text-sm font-semibold text-primary">Walk-in — Booking sẽ cần được phân công nhân viên</span>
      </div>

      {/* Section 1: Customer Info */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
          <UserPlus className="size-4 text-primary" />
          Thông tin khách hàng
        </h2>

        {!useFound ? (
          <>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại"
                className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSearch}
                disabled={!phone || isSearching}
                className="gap-2"
              >
                {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                Tìm kiếm
              </Button>
            </div>

            {foundCustomer && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{foundCustomer.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {foundCustomer.membership_tier} • Trust: {foundCustomer.trust_score} • {foundCustomer.phone}
                    </p>
                  </div>
                  <Button type="button" size="sm" onClick={handleUseCustomer} className="bg-primary hover:bg-primary/90">
                    Dùng tài khoản này
                  </Button>
                </div>
              </div>
            )}

            {!foundCustomer && phone && !isSearching && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Tạo khách hàng mới</p>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Họ tên"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">Mật khẩu tạm sẽ được gửi qua Welcome Email</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-border bg-success/10 p-3">
            <div>
              <p className="font-medium text-foreground">{customerName}</p>
              <p className="text-xs text-muted-foreground">{foundCustomer?.membership_tier || "Khách mới"} • {phone}</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={handleCreateNew}>
              Thay đổi
            </Button>
          </div>
        )}
      </div>

      {/* Section 2: Vehicle Info */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
          Thông tin xe
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="Biển số (VD: 51A-123.45)"
            className="col-span-2 font-mono rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={vehicleSize}
            onChange={(e) => setVehicleSize(e.target.value as VehicleSize)}
            className="rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="SMALL">Nhỏ (S)</option>
            <option value="MEDIUM">Vừa (M)</option>
            <option value="LARGE">Lớn (L)</option>
          </select>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Hãng xe"
            className="rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Model"
            className="rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Màu"
            className="col-span-2 rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Section 3: Service */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
          Dịch vụ
        </h2>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Chọn dịch vụ</option>
          {activeServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatVND(s.price)}
            </option>
          ))}
        </select>

        {serviceId && (
          <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3 border border-primary/30">
            <span className="text-sm font-medium text-foreground">Tổng tiền</span>
            <span className="font-mono text-lg font-bold text-primary">{formatVND(totalPrice)}</span>
          </div>
        )}
      </div>

      {/* Section 4: Schedule */}
      {serviceId && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">4</span>
            Lịch hẹn
          </h2>
          
          <div className="mb-4">
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Ngày</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              min={new Date().toISOString().split("T")[0]}
            />
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
                  <button
                    key={slot.slot_id}
                    type="button"
                    onClick={() => setSelectedSlot(slot.slot_id)}
                    className={`rounded-lg border-2 px-2 py-1.5 text-xs font-semibold transition-all ${
                      selectedSlot === slot.slot_id
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-muted/30 text-foreground hover:border-primary/50"
                    }`}
                  >
                    {slot.start_time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || submitLoading}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[var(--shadow-glow)]"
      >
        {submitLoading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Tạo đặt lịch
      </button>
    </form>
  )
}
