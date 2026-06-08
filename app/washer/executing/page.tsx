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
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
            <h2 className="text-lg font-bold text-foreground">Các bước thực hiện</h2>
          </div>
          <div className="space-y-2">
            {WASH_STEPS.map((step) => (
              <label key={step.id} className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-150 ${
                completedSteps.includes(step.id)
                  ? 'border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-950/20'
                  : 'border-border hover:border-primary/40 hover:bg-accent/30'
              }`}>
                <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                  completedSteps.includes(step.id)
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-border'
                }`}>
                  {completedSteps.includes(step.id) && (
                    <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={completedSteps.includes(step.id)} onChange={() => toggleStep(step.id)} className="sr-only" />
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

        <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-primary">
              {completedSteps.length}/{WASH_STEPS.length} bước hoàn thành
            </p>
            <p className="text-xs font-mono font-bold text-primary">
              {Math.round((completedSteps.length / WASH_STEPS.length) * 100)}%
            </p>
          </div>
          <div className="h-2 bg-primary/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-sky-400 transition-all duration-500 rounded-full"
              style={{ width: `${(completedSteps.length / WASH_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm p-4">
        <Link href="/washer/completed">
          <button
            disabled={!allStepsCompleted}
            className="w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-base font-semibold text-white shadow-[0_4px_24px_rgba(16,185,129,0.25)] transition-all duration-200 hover:shadow-[0_8px_40px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            Hoàn thành dịch vụ →
          </button>
        </Link>
      </div>
    </div>
  )
}
