"use client"

import { useState } from "react"
import { Check, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SERVICES, BAYS, formatVND } from "@/lib/data"

const activeServices = SERVICES.filter((s) => s.active)
const freeBays = BAYS.filter((b) => b.status === "available")

export function WalkInForm() {
  const [name, setName] = useState("")
  const [plate, setPlate] = useState("")
  const [serviceId, setServiceId] = useState("")
  const [bayId, setBayId] = useState("")
  const [created, setCreated] = useState(false)

  const service = activeServices.find((s) => s.id === serviceId)
  const valid = name && plate && serviceId && bayId

  if (created && service) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="size-7" />
        </span>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground">Đã tạo phiếu dịch vụ</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground text-pretty">
          Phiếu cho khách {name} ({plate}) đã được tạo với mã{" "}
          <span className="font-mono font-semibold text-foreground">AW-2046</span> và phân vào{" "}
          {BAYS.find((b) => b.id === bayId)?.name}.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setCreated(false)}>
          Tạo phiếu khác
        </Button>
      </div>
    )
  }

  return (
    <form
      className="space-y-5 rounded-2xl border border-border bg-card p-6"
      onSubmit={(e) => {
        e.preventDefault()
        setCreated(true)
      }}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <UserPlus className="size-5" />
        </span>
        <p className="font-semibold text-foreground">Thông tin khách hàng</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tên khách hàng" htmlFor="name">
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên khách hàng"
            className="input"
          />
        </Field>
        <Field label="Biển số xe" htmlFor="plate">
          <input
            id="plate"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="Ví dụ: 51K-123.45"
            className="input"
          />
        </Field>
      </div>

      <Field label="Dịch vụ" htmlFor="service">
        <select
          id="service"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="input"
        >
          <option value="">Chọn dịch vụ</option>
          {activeServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatVND(s.price)}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Khoang rửa" htmlFor="bay">
        <select id="bay" value={bayId} onChange={(e) => setBayId(e.target.value)} className="input">
          <option value="">Chọn khoang trống</option>
          {freeBays.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </Field>

      {service && (
        <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
          <span className="text-sm text-muted-foreground">Thành tiền</span>
          <span className="font-mono text-lg font-bold text-primary">{formatVND(service.price)}</span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={!valid}>
        <Check className="size-4" />
        Tạo phiếu dịch vụ
      </Button>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}
