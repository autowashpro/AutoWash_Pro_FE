"use client"

import { useEffect, useState } from "react"
import { MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { BOOKINGS, CATALOG } from "@/lib/data"
import { getWasherTasks } from "@/lib/api/bookings"
import type { BookingSummary } from "@/lib/types"

export default function WasherJobsPage() {
  const [tasks, setTasks] = useState<BookingSummary[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await getWasherTasks()
      setTasks(data)
    } catch (error) {
      console.error("Failed to fetch washer tasks, falling back to mock data", error)
      // Fallback to mock data
      const myJobs = BOOKINGS.filter((b) => b.washerName === "Trần Văn Hùng")
      const mockSummary: BookingSummary[] = myJobs.map(b => ({
        booking_id: b.id,
        customer_name: b.customerName,
        license_plate: b.vehicle.plate,
        vehicle_size: b.vehicle.size === "S" ? "SMALL" : b.vehicle.size === "M" ? "MEDIUM" : "LARGE",
        services_summary: b.serviceName,
        slot_start_time: b.timeSlot,
        booking_type: "WASH",
        num_slots: 1,
        status: b.status as any,
        booking_source: "ONLINE",
        assigned_washer: b.washerName
      }))
      setTasks(mockSummary)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchTasks, 30000)
    return () => clearInterval(interval)
  }, [])

  const completed = tasks.filter((b) => b.status === "COMPLETED" || b.status === "CLOSED" || b.status === "PAID")
  const inProgress = tasks.filter((b) => b.status === "IN_PROGRESS" || b.status === "VEHICLE_INSPECTED" || b.status === "CUSTOMER_CONFIRMED_CONDITION" || b.status === "CHECKED_IN")
  const assigned = tasks.filter((b) => b.status === "ASSIGNED")

  // Calculate today's work hours (mock: sum of service durations for completed + in progress)
  const completedHours = completed.length * 0.5
  const inProgressHours = inProgress.length * 0.67
  const totalHours = completedHours + inProgressHours
  const hours = Math.floor(totalHours)
  const minutes = Math.round((totalHours - hours) * 60)

  const allJobs = [...assigned, ...inProgress, ...completed].sort((a, b) => a.slot_start_time.localeCompare(b.slot_start_time))

  if (loading && tasks.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Công việc hôm nay</h1>
        <p className="text-sm text-muted-foreground">
          Các đầu việc được phân công cho bạn trong ca làm.
        </p>
      </div>

      {/* Header Stats Bento */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Đã hoàn thành" value={completed.length} tone="success" />
        <Stat label="Đang xử lý" value={inProgress.length + assigned.length} tone="warning" />
        <Stat label="Giờ làm hôm nay" value={`${hours}h ${minutes}m`} tone="slate" />
      </div>

      {/* Tasks List */}
      {allJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Không có task nào hôm nay. Nghỉ ngơi đi nhé! ☕
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allJobs.map((b) => {
            return (
              <Link key={b.booking_id} href={`/washer/${b.booking_id}`}>
                <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        {/* Time badge */}
                        <div className="inline-flex rounded-lg bg-accent px-3 py-1.5 font-mono text-xs font-semibold text-primary">
                          {b.slot_start_time}
                        </div>
                        {/* Customer name */}
                        <p className="text-base font-semibold text-foreground">{b.customer_name || "Khách hàng"}</p>
                        {/* Vehicle plate + size */}
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {b.license_plate}
                          </span>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                            {b.vehicle_size}
                          </span>
                        </div>
                        {/* Service name + badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{b.services_summary}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${
                            b.booking_type === "WASH" ? "bg-primary" : "bg-purple-600"
                          }`}>
                            {b.booking_type}
                          </span>
                        </div>
                        {/* Bay + Status */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
                          <StatusBadge status={b.status} />
                          {(b as any).bay_id && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              🔧 {(b as any).bay_id.replace("bay-", "Cầu ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-primary">Xem chi tiết →</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone: "success" | "warning" | "slate" }) {
  const colorMap = {
    success: "bg-success/10 text-success",
    warning: "bg-gold/10 text-gold",
    slate: "bg-muted text-muted-foreground",
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className={`font-mono text-2xl font-bold ${colorMap[tone]}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
