import { Car, Clock, MapPin } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { BOOKINGS, formatVND } from "@/lib/data"
import { JobActionButton } from "@/components/job-action-button"

const myJobs = BOOKINGS.filter((b) => b.washerName === "Trần Văn Hùng")
const active = myJobs.filter((b) => ["ASSIGNED", "IN_PROGRESS"].includes(b.status))
const completed = myJobs.filter((b) => b.status === "COMPLETED")

export default function WasherJobsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Công việc hôm nay</h1>
        <p className="text-sm text-muted-foreground">
          Các đầu việc được phân công cho bạn trong ca làm.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Đang chờ" value={active.length} />
        <Stat label="Hoàn thành" value={completed.length} />
        <Stat label="Điểm tín nhiệm" value={98} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Đang thực hiện</h2>
        <div className="space-y-3">
          {active.map((b) => (
            <div key={b.id} className="rounded-2xl border border-border bg-card p-5">
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
                      {b.vehicle.model} · {b.vehicle.plate} · {b.vehicle.color}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {b.timeSlot}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {b.bayId === "bay-1" ? "Khoang 1" : "Khoang 2"}
                      </span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">
                  Giá trị đơn:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {formatVND(b.price)}
                  </span>
                </span>
                <JobActionButton status={b.status} code={b.code} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Đã hoàn thành</h2>
        {completed.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Chưa có công việc hoàn thành hôm nay.
          </p>
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {completed.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-foreground">{b.serviceName}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.vehicle.plate} · {b.code}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className="font-mono text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
