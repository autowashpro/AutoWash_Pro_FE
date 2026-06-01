import { DollarSign, CalendarCheck, Users, Repeat } from "lucide-react"
import { RevenueChart } from "@/components/revenue-chart"
import { USERS, BOOKINGS, SERVICES, formatVND } from "@/lib/data"

const totalRevenue = BOOKINGS.filter((b) => b.status === "COMPLETED").reduce((s, b) => s + b.price, 0)
const customers = USERS.filter((u) => u.role === "customer").length
const completed = BOOKINGS.filter((b) => b.status === "COMPLETED").length

const topServices = [...SERVICES]
  .filter((s) => s.active)
  .map((s) => ({
    name: s.name,
    count: BOOKINGS.filter((b) => b.serviceId === s.id).length,
  }))
  .sort((a, b) => b.count - a.count)

export default function AdminReportsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Báo cáo hệ thống</h1>
        <p className="text-sm text-muted-foreground">Tổng quan hiệu suất kinh doanh toàn chuỗi.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={DollarSign} label="Tổng doanh thu" value={formatVND(totalRevenue)} mono />
        <Kpi icon={CalendarCheck} label="Lượt rửa hoàn thành" value={String(completed)} />
        <Kpi icon={Users} label="Khách hàng" value={String(customers)} />
        <Kpi icon={Repeat} label="Tỷ lệ quay lại" value="68%" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Doanh thu 7 ngày gần nhất</h2>
          <div className="rounded-2xl border border-border bg-card p-5">
            <RevenueChart />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Dịch vụ phổ biến</h2>
          <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
            {topServices.map((s, i) => {
              const max = Math.max(...topServices.map((t) => t.count), 1)
              return (
                <div key={s.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{s.name}</span>
                    <span className="font-mono text-muted-foreground">{s.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(8, (s.count / max) * 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Users
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <p className={mono ? "mt-3 font-mono text-xl font-bold text-foreground" : "mt-3 text-2xl font-bold text-foreground"}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
