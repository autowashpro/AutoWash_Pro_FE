"use client"

import { useState } from "react"
import { Camera, Check, ImagePlus, Car } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BOOKINGS } from "@/lib/data"

const job = BOOKINGS.find((b) => b.code === "AW-2041")!

type PhotoSlot = { id: string; label: string; filled: boolean }

const initialBefore: PhotoSlot[] = [
  { id: "b-front", label: "Mặt trước", filled: false },
  { id: "b-side", label: "Bên hông", filled: false },
  { id: "b-interior", label: "Nội thất", filled: false },
]
const initialAfter: PhotoSlot[] = [
  { id: "a-front", label: "Mặt trước", filled: false },
  { id: "a-side", label: "Bên hông", filled: false },
  { id: "a-interior", label: "Nội thất", filled: false },
]

export function InspectionReport() {
  const [before, setBefore] = useState(initialBefore)
  const [after, setAfter] = useState(initialAfter)
  const [notes, setNotes] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const beforeDone = before.every((p) => p.filled)
  const afterDone = after.every((p) => p.filled)
  const canSubmit = beforeDone && afterDone

  const toggle = (
    list: PhotoSlot[],
    setter: (v: PhotoSlot[]) => void,
    id: string,
  ) => {
    setter(list.map((p) => (p.id === id ? { ...p, filled: !p.filled } : p)))
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="size-7" />
        </span>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground">
          Đã gửi báo cáo kiểm tra
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground text-pretty">
          Báo cáo cho đơn {job.code} đã được gửi tới quản lý và khách hàng để xác nhận.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Job context */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Car className="size-5" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">{job.serviceName}</p>
            <span className="font-mono text-xs text-muted-foreground">{job.code}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {job.vehicle.model} · {job.vehicle.plate}
          </p>
        </div>
      </div>

      <PhotoSection
        title="Ảnh trước khi rửa"
        slots={before}
        done={beforeDone}
        onToggle={(id) => toggle(before, setBefore, id)}
      />
      <PhotoSection
        title="Ảnh sau khi rửa"
        slots={after}
        done={afterDone}
        onToggle={(id) => toggle(after, setAfter, id)}
      />

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-foreground">
          Ghi chú tình trạng xe
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Ví dụ: phát hiện vết xước nhỏ ở cản sau trước khi rửa."
          className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
        />
      </div>

      <Button className="w-full" disabled={!canSubmit} onClick={() => setSubmitted(true)}>
        <Check className="size-4" />
        Gửi báo cáo kiểm tra
      </Button>
      {!canSubmit && (
        <p className="text-center text-xs text-muted-foreground">
          Vui lòng chụp đủ ảnh trước và sau khi rửa để gửi báo cáo.
        </p>
      )}
    </div>
  )
}

function PhotoSection({
  title,
  slots,
  done,
  onToggle,
}: {
  title: string
  slots: PhotoSlot[]
  done: boolean
  onToggle: (id: string) => void
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {done && (
          <span className="flex items-center gap-1 text-xs font-medium text-success">
            <Check className="size-3.5" />
            Đầy đủ
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {slots.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onToggle(p.id)}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border text-xs font-medium transition-colors",
              p.filled
                ? "border-primary bg-accent text-primary"
                : "border-dashed border-border bg-card text-muted-foreground hover:border-primary/40",
            )}
            aria-label={`${p.filled ? "Đã chụp" : "Chụp ảnh"} ${p.label}`}
          >
            {p.filled ? (
              <Camera className="size-5" />
            ) : (
              <ImagePlus className="size-5" />
            )}
            {p.label}
          </button>
        ))}
      </div>
    </section>
  )
}
