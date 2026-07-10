"use client"

import { useEffect, useState } from "react"
import { MapPin, Loader2, Clock, CheckCircle2, Wrench, Timer } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { BOOKINGS, CATALOG } from "@/lib/data"
import { getWasherTasks } from "@/lib/api/bookings"
import type { BookingSummary } from "@/lib/types"
import { getMe } from "@/lib/api"
import { getLocalDateString } from "@/lib/utils"

export default function WasherJobsPage() {
  const [tasks, setTasks] = useState<BookingSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [washerName, setWasherName] = useState<string>("Trần Văn Hùng")

  const fetchTasks = async (currentWasherName: string = washerName) => {
    try {
      setLoading(true)
      const today = getLocalDateString() // "yyyy-MM-dd"
      const data = await getWasherTasks(today)
      setTasks(data)
    } catch (error: any) {
      console.error("Failed to fetch washer tasks", error)
      // Hiển thị thông báo lỗi — không dùng mock data để tránh washer thực hiện sai task
      import("sonner").then(({ toast }) => {
        toast.error(
          error?.response?.data?.message || "Không tải được danh sách công việc",
          { description: "Kiểm tra kết nối mạng và tải lại trang." }
        )
      })
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let currentName = washerName
    async function init() {
      try {
        const user = await getMe()
        if (user && (user.fullName || user.FullName)) {
          const name = user.fullName || user.FullName
          setWasherName(name)
          currentName = name
        }
      } catch (err) {
        console.warn("Failed to load washer profile info:", err)
      }
      await fetchTasks(currentName)
    }
    init()
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => fetchTasks(currentName), 30000)
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

  const allJobs = [...assigned, ...inProgress, ...completed].sort((a, b) => b.slot_start_time.localeCompare(a.slot_start_time))

  if (loading && tasks.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* Premium Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Công việc hôm nay</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-3">
          Các đầu việc được phân công cho bạn trong ca làm.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hoàn thành</span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-100/60 dark:from-emerald-500/15 dark:to-emerald-900/30 text-emerald-600">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="font-mono text-3xl font-extrabold text-emerald-600">{completed.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Đang xử lý</span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-100/60 dark:from-amber-500/15 dark:to-amber-900/30 text-amber-600">
              <Wrench className="size-4" />
            </span>
          </div>
          <p className="font-mono text-3xl font-extrabold text-amber-600">{inProgress.length + assigned.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Giờ làm</span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
              <Timer className="size-4" />
            </span>
          </div>
          <p className="font-mono text-3xl font-extrabold text-foreground">{hours}h {minutes}m</p>
        </div>
      </div>

      {/* Tasks List */}
      {allJobs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border/60 p-12 text-center">
          <p className="text-2xl mb-2">☕</p>
          <p className="text-sm font-medium text-foreground">Không có task nào hôm nay</p>
          <p className="text-xs text-muted-foreground mt-1">Nghỉ ngơi đi nhé!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allJobs.map((b) => {
            return (
              <Link key={b.booking_id} href={`/washer/${b.booking_id}`}>
                <div className="rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      {/* Time badge */}
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 font-mono text-xs font-semibold text-primary">
                        <Clock className="size-3" />
                        {b.slot_start_time}
                      </div>
                      {/* Customer name */}
                      <p className="text-base font-semibold text-foreground">{b.customer_name || "Khách hàng"}</p>
                      {/* Plate + size */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-extrabold text-foreground tracking-wider">{b.license_plate}</span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">{b.vehicle_size}</span>
                      </div>
                      {/* Service + type */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{b.services_summary}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${b.booking_type === "WASH" ? "bg-primary" : "bg-violet-600"}`}>
                          {b.booking_type}
                        </span>
                      </div>
                      {/* Bay + Status */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        {(b as any).bay_id && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3.5" />
                            {(b as any).bay_id.replace("bay-", "Cầu #")}
                          </span>
                        )}
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary shrink-0">Xem chi tiết →</span>
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
