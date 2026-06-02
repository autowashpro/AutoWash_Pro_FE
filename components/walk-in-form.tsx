"use client"

import { useState } from "react"
import { Check, UserPlus, Search, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SERVICES, BAYS, BOOKINGS, WASHERS, CUSTOMERS_LOW_TRUST, formatVND } from "@/lib/data"
import type { VehicleSize } from "@/lib/data"

const activeServices = SERVICES.filter((s) => s.active)
const washServices = activeServices.filter((s) => s.type === "WASH")

export function WalkInForm() {
  // Section 1: Customer
  const [phone, setPhone] = useState("")
  const [foundCustomer, setFoundCustomer] = useState<any>(null)
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
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // Section 4: Schedule
  const [selectedSlot, setSelectedSlot] = useState("")
  const [washerId, setWasherId] = useState("")
  const [bayId, setBayId] = useState("")
  const [created, setCreated] = useState(false)

  const selectedService = activeServices.find((s) => s.id === serviceId)
  const totalPrice = selectedService ? selectedService.price : 0
  const isWash = selectedService?.type === "WASH"

  // Handle search
  const handleSearch = () => {
    setIsSearching(true)
    setTimeout(() => {
      // Simulate search - in real app, call API
      if (phone === "0987654321") {
        setFoundCustomer({ id: "cust-1", name: "Nguyễn Minh Anh", tier: "VÀNG", trustScore: 65 })
      } else {
        setFoundCustomer(null)
      }
      setIsSearching(false)
    }, 300)
  }

  const handleUseCustomer = () => {
    setCustomerName(foundCustomer.name)
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
    selectedSlot &&
    washerId &&
    (!isWash || bayId)

  if (created) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="size-7" />
        </span>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground">Đã tạo phiếu dịch vụ Walk-in</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground text-pretty">
          Phiếu cho khách {customerName} ({plate}) đã được tạo với mã{" "}
          <span className="font-mono font-semibold text-foreground">AW-{Math.floor(Math.random() * 10000)}</span>.
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
          setSelectedServices([])
          setSelectedSlot("")
          setWasherId("")
          setBayId("")
          setCreated(false)
        }}>
          Tạo phiếu khác
        </Button>
      </div>
    )
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        setCreated(true)
      }}
    >
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 border border-primary/30">
        <span className="text-sm font-semibold text-primary">Walk-in — Booking sẽ tự động chuyển sang Đã phân công</span>
      </div>

      {/* Section 1: Customer Info */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <UserPlus className="size-5" />
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
                <Search className="size-4" />
                Tìm kiếm
              </Button>
            </div>

            {foundCustomer && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{foundCustomer.name}</p>
                    <p className="text-xs text-muted-foreground">Tier: {foundCustomer.tier} • Trust: {foundCustomer.trustScore}</p>
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
              <p className="text-xs text-muted-foreground">{foundCustomer?.tier || "Khách mới"} • {phone}</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={handleCreateNew}>
              Thay đổi
            </Button>
          </div>
        )}
      </div>

      {/* Section 2: Vehicle Info */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Thông tin xe</h2>
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
            <option value="S">Nhỏ (S)</option>
            <option value="M">Vừa (M)</option>
            <option value="L">Lớn (L)</option>
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
        <h2 className="font-semibold text-foreground">Dịch vụ</h2>
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
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Lịch hẹn</h2>

        {/* Slot Grid */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Chọn giờ</label>
          <div className="grid grid-cols-4 gap-2">
            {["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"].map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-lg border-2 px-2 py-1.5 text-xs font-semibold transition-all ${
                  selectedSlot === slot
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-muted/30 text-foreground hover:border-primary/50"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Washer Selection */}
        <div>
          <label htmlFor="washer" className="text-xs font-semibold text-muted-foreground mb-2 block">
            Chọn nhân viên
          </label>
          <select
            id="washer"
            value={washerId}
            onChange={(e) => setWasherId(e.target.value)}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Chọn nhân viên</option>
            {WASHERS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} — {w.trustScore} ⭐
              </option>
            ))}
          </select>
        </div>

        {/* Bay Selection - Only for WASH */}
        {isWash && (
          <div>
            <label htmlFor="bay" className="text-xs font-semibold text-muted-foreground mb-2 block">
              Chọn cầu nâng
            </label>
            <select
              id="bay"
              value={bayId}
              onChange={(e) => setBayId(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Chọn cầu trống</option>
              {BAYS.filter((b) => b.status === "available").map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isValid}
        className="w-full h-12 bg-primary hover:bg-primary/90 font-semibold gap-2"
      >
        <Check className="size-4" />
        Tạo đặt lịch
      </Button>
    </form>
  )
}

