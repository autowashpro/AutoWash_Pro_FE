import { Car, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { BOOKINGS, formatVND, CATALOG } from "@/lib/data"
import { JobActionButton } from "@/components/washer/job-action-button"

const myJobs = BOOKINGS.filter((b) => b.washerName === "Trần Văn Hùng")
const completed = myJobs.filter((b) => b.status === "COMPLETED")
const inProgress = myJobs.filter((b) => b.status === "IN_PROGRESS")
const assigned = myJobs.filter((b) => b.status === "ASSIGNED")

// Calculate today's work hours (mock: sum of service durations for completed + in progress)
const completedHours = completed.length * 0.5
const inProgressHours = inProgress.length * 0.67
const totalHours = completedHours + inProgressHours
const hours = Math.floor(totalHours)
const minutes = Math.round((totalHours - hours) * 60)

export default function WasherJobsPage() {
  const allJobs = [...assigned, ...inProgress, ...completed].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))

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
            const service = CATALOG.find((s) => s.id === b.serviceId)
            return (
              <Link key={b.id} href={`/washer/${b.id}`}>
                <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        {/* Time badge */}
                        <div className="inline-flex rounded-lg bg-accent px-3 py-1.5 font-mono text-xs font-semibold text-primary">
                          {b.timeSlot}–{String(parseInt(b.timeSlot) + Math.ceil((service?.durationMinutes ?? 20) / 60)).padStart(2, '0')}:
                          {String((parseInt(b.timeSlot.split(':')[1]) + (service?.durationMinutes ?? 20)) % 60).padStart(2, '0')}
                        </div>
                        {/* Customer name */}
                        <p className="text-base font-semibold text-foreground">{b.customerName}</p>
                        {/* Vehicle plate + size */}
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {b.vehicle.plate}
                          </span>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                            {b.vehicle.size}
                          </span>
                        </div>
                        {/* Service name + badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{b.serviceName}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${
                            service?.type === "WASH" ? "bg-primary" : "bg-purple-600"
                          }`}>
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
