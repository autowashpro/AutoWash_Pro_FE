"use client"

import { useState } from "react"
import { Check, Car, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BOOKINGS, WASHERS, BAYS } from "@/lib/data"

const pending = BOOKINGS.filter((b) => ["PENDING", "CONFIRMED"].includes(b.status))
const availableWashers = WASHERS.filter((w) => w.status !== "offline")
const freeBays = BAYS.filter((b) => b.status === "available")

interface Assignment {
  washerId: string
  bayId: string
}

export function AssignmentBoard() {
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({})
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})

  const update = (bookingId: string, patch: Partial<Assignment>) => {
    setAssignments((prev) => {
      const current: Assignment = prev[bookingId] ?? { washerId: "", bayId: "" }
      return {
        ...prev,
        [bookingId]: { ...current, ...patch },
      }
    })
  }

  return (
    <div className="space-y-4">
      {pending.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Không có lịch hẹn nào đang chờ phân công.
        </p>
      )}
      {pending.map((b) => {
        const a = assignments[b.id]
        const isConfirmed = confirmed[b.id]
        const ready = a?.washerId && a?.bayId

        return (
          <div
            key={b.id}
            className={cn(
              "rounded-2xl border bg-card p-5 transition-colors",
              isConfirmed ? "border-success/40" : "border-border",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Car className="size-5" />
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{b.serviceName}</p>
                    <span className="font-mono text-xs text-muted-foreground">{b.code}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {b.customerName} · {b.vehicle.plate}
                  </p>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    {b.timeSlot}
                  </span>
                </div>
              </div>
            </div>

            {isConfirmed ? (
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm font-medium text-success">
                <Check className="size-4" />
                Đã phân công {availableWashers.find((w) => w.id === a.washerId)?.name} ·{" "}
                {BAYS.find((bay) => bay.id === a.bayId)?.name}
              </div>
            ) : (
              <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <Field label="Thợ rửa xe">
                  <select
                    value={a?.washerId ?? ""}
                    onChange={(e) => update(b.id, { washerId: e.target.value })}
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  >
                    <option value="">Chọn thợ</option>
                    {availableWashers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.jobsToday} đơn)
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Khoang rửa">
                  <select
                    value={a?.bayId ?? ""}
                    onChange={(e) => update(b.id, { bayId: e.target.value })}
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  >
                    <option value="">Chọn khoang</option>
                    {freeBays.map((bay) => (
                      <option key={bay.id} value={bay.id}>
                        {bay.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Button
                  disabled={!ready}
                  onClick={() => setConfirmed((prev) => ({ ...prev, [b.id]: true }))}
                >
                  <Check className="size-4" />
                  Phân công
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
