"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BOOKINGS, WASH_STEPS, CATALOG } from "@/lib/data"

const mockBooking = BOOKINGS.find(b => b.id === "b-1")!
const service = CATALOG.find(s => s.id === mockBooking.serviceId)!

export default function ExecutingPage() {
  const [seconds, setSeconds] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev =>
      prev.includes(stepId) ? prev.filter(id => id !== stepId) : [...prev, stepId]
    )
  }

  const allStepsCompleted = completedSteps.length === WASH_STEPS.length

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm p-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2 animate-pulse">
            <span className="text-2xl">🔄</span>
            <span className="text-sm font-semibold text-gold">Đang thực hiện</span>
          </div>
        </div>
        
        <div className="text-center">
          <p className="font-mono text-4xl font-bold text-primary">{timeStr}</p>
          <p className="text-xs text-muted-foreground mt-1">Thời gian đã thực hiện</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-foreground">{mockBooking.vehicle.plate}</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {mockBooking.vehicle.size}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">{mockBooking.serviceName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              Cầu {mockBooking.bayId === "bay-1" ? "#1" : "#2"}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Các bước thực hiện</h2>
          <div className="space-y-2">
            {WASH_STEPS.map((step) => (
              <label key={step.id} className="flex items-start gap-3 rounded-xl border border-border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                <input
                  type="checkbox"
                  checked={completedSteps.includes(step.id)}
                  onChange={() => toggleStep(step.id)}
                  className="mt-1 size-5 rounded accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{step.name}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  ~{step.estimatedMinutes}p
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-primary/10 p-4">
          <p className="text-sm font-medium text-primary">
            {completedSteps.length}/{WASH_STEPS.length} bước hoàn thành
          </p>
          <div className="mt-2 h-2 bg-primary/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${(completedSteps.length / WASH_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm p-4">
        <Link href="/washer/completed">
          <Button
            disabled={!allStepsCompleted}
            className="w-full h-12 font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            Hoàn thành dịch vụ →
          </Button>
        </Link>
      </div>
    </div>
  )
}
