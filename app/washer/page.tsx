import { Clock, MapPin, CheckCircle2, Wrench, Timer } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { BOOKINGS, CATALOG } from "@/lib/data"

const myJobs = BOOKINGS.filter((b) => b.washerName === "Trần Văn Hùng")
const completed = myJobs.filter((b) => b.status === "COMPLETED")
const inProgress = myJobs.filter((b) => b.status === "IN_PROGRESS")
const assigned = myJobs.filter((b) => b.status === "ASSIGNED")

const completedHours = completed.length * 0.5
const inProgressHours = inProgress.length * 0.67
const totalHours = completedHours + inProgressHours
const hours = Math.floor(totalHours)
const minutes = Math.round((totalHours - hours) * 60)

export default function WasherJobsPage() {
  const allJobs = [...assigned, ...inProgress, ...completed].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))

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
            const service = CATALOG.find((s) => s.id === b.serviceId)
            return (
              <Link key={b.id} href={`/washer/${b.id}`}>
                <div className="rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      {/* Time badge */}
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 font-mono text-xs font-semibold text-primary">
                        <Clock className="size-3" />
                        {b.timeSlot}–{String(parseInt(b.timeSlot) + Math.ceil((service?.durationMinutes ?? 20) / 60)).padStart(2, '0')}:
                        {String((parseInt(b.timeSlot.split(':')[1]) + (service?.durationMinutes ?? 20)) % 60).padStart(2, '0')}
                      </div>
                      {/* Customer name */}
                      <p className="text-base font-semibold text-foreground">{b.customerName}</p>
                      {/* Plate + size */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-extrabold text-foreground tracking-wider">{b.vehicle.plate}</span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">{b.vehicle.size}</span>
                      </div>
                      {/* Service + type */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{b.serviceName}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${service?.type === "WASH" ? "bg-primary" : "bg-violet-600"}`}>
                          {service?.type === "WASH" ? "WASH" : "FLEX"}
                        </span>
                      </div>
                      {/* Bay + Status */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          Cầu {b.bayId === "bay-1" ? "#1" : "#2"}
                        </span>
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
