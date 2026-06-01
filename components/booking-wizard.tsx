"use client"

import { useState } from "react"
import { Check, Clock, Car, Sparkles, CalendarCheck, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  SERVICES,
  VEHICLES,
  TIME_SLOTS,
  formatVND,
  TIER_META,
} from "@/lib/data"

const STEPS = ["Dịch vụ", "Phương tiện", "Khung giờ", "Xác nhận"] as const

const availableServices = SERVICES.filter((s) => s.active)
const DISCOUNT = TIER_META.GOLD.discount

export function BookingWizard() {
  const [step, setStep] = useState(0)
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [vehicleId, setVehicleId] = useState<string | null>(VEHICLES[0].id)
  const [slot, setSlot] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const service = availableServices.find((s) => s.id === serviceId)
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)
  const discountAmount = service ? Math.round((service.price * DISCOUNT) / 100) : 0
  const total = service ? service.price - discountAmount : 0

  const canNext =
    (step === 0 && !!serviceId) ||
    (step === 1 && !!vehicleId) ||
    (step === 2 && !!slot) ||
    step === 3

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="size-7" />
        </span>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground">
          Đặt lịch thành công
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground text-pretty">
          Yêu cầu của bạn đang chờ xác nhận. Mã đặt lịch{" "}
          <span className="font-mono font-semibold text-foreground">AW-2045</span>. Chúng tôi sẽ
          gửi thông báo khi khoang rửa được phân công.
        </p>
        <div className="mx-auto mt-6 max-w-xs space-y-2 rounded-xl bg-secondary p-4 text-left text-sm">
          <Row label="Dịch vụ" value={service?.name ?? ""} />
          <Row label="Phương tiện" value={vehicle?.plate ?? ""} />
          <Row label="Khung giờ" value={slot ?? ""} />
          <Row label="Thành tiền" value={formatVND(total)} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  i < step && "bg-success text-success-foreground",
                  i === step && "bg-primary text-primary-foreground",
                  i > step && "bg-secondary text-muted-foreground",
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "h-0.5 flex-1 rounded-full",
                  i < step ? "bg-success" : "bg-border",
                )}
              />
            )}
          </li>
        ))}
      </ol>
      <p className="text-sm font-medium text-foreground">
        Bước {step + 1}/4 · {STEPS[step]}
      </p>

      {/* Step content */}
      <div className="min-h-[280px]">
        {step === 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {availableServices.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiceId(s.id)}
                className={cn(
                  "flex flex-col gap-2 rounded-2xl border p-4 text-left transition-colors",
                  serviceId === s.id
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </span>
                  {serviceId === s.id && <Check className="size-5 text-primary" />}
                </div>
                <p className="font-semibold text-foreground">{s.name}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{s.description}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {formatVND(s.price)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    {s.durationMinutes} phút
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            {VEHICLES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVehicleId(v.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
                  vehicleId === v.id
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground">
                  <Car className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{v.model}</p>
                  <p className="text-sm text-muted-foreground">
                    {v.plate} · {v.type} · {v.color}
                  </p>
                </div>
                {vehicleId === v.id && <Check className="size-5 text-primary" />}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSlot(t)}
                className={cn(
                  "rounded-xl border py-3 text-center font-mono text-sm font-medium transition-colors",
                  slot === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/40",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {step === 3 && service && vehicle && (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <CalendarCheck className="size-5" />
              </span>
              <p className="font-semibold text-foreground">Xác nhận thông tin đặt lịch</p>
            </div>
            <div className="space-y-3">
              <Row label="Dịch vụ" value={service.name} />
              <Row label="Thời lượng" value={`${service.durationMinutes} phút`} />
              <Row label="Phương tiện" value={`${vehicle.model} · ${vehicle.plate}`} />
              <Row label="Khung giờ" value={`Hôm nay · ${slot}`} />
              <div className="my-2 border-t border-dashed border-border" />
              <Row label="Giá gốc" value={formatVND(service.price)} />
              <Row
                label={`Ưu đãi hạng Vàng (${DISCOUNT}%)`}
                value={`- ${formatVND(discountAmount)}`}
                accent="success"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-foreground">Thành tiền</span>
                <span className="font-mono text-lg font-bold text-primary">
                  {formatVND(total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="size-4" />
          Quay lại
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
            Tiếp tục
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={() => setDone(true)}>
            <Check className="size-4" />
            Xác nhận đặt lịch
          </Button>
        )}
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: "success"
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-medium",
          accent === "success" ? "text-success" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  )
}
