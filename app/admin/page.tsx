import { DollarSign, CalendarCheck, Users, Repeat } from "lucide-react"
import { RevenueChart } from "@/components/manager/revenue-chart"
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
      {/* Premium Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Báo cáo hệ thống</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-3">Tổng quan hiệu suất kinh doanh toàn chuỗi.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={DollarSign} label="Tổng doanh thu" value={formatVND(totalRevenue)} mono trend="+12%" trendUp />
        <Kpi icon={CalendarCheck} label="Lượt rửa hoàn thành" value={String(completed)} trend="+5%" trendUp />
        <Kpi icon={Users} label="Khách hàng" value={String(customers)} trend="+8%" trendUp />
        <Kpi icon={Repeat} label="Tỷ lệ quay lại" value="68%" trend="+1.2%" trendUp />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <section className="space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
            <h2 className="text-base font-bold tracking-tight text-foreground">Doanh thu 7 ngày gần nhất</h2>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <RevenueChart />
          </div>
        </section>

        {/* Top Services */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
            <h2 className="text-base font-bold tracking-tight text-foreground">Dịch vụ phổ biến</h2>
          </div>
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            {topServices.map((s, i) => {
              const max = Math.max(...topServices.map((t) => t.count), 1)
              const pct = Math.max(8, (s.count / max) * 100)
              return (
                <div key={s.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="font-medium text-foreground">{s.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-muted-foreground">{s.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-sky-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
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
  trend,
  trendUp,
}: {
  icon: typeof Users
  label: string
  value: string
  mono?: boolean
  trend?: string
  trendUp?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
          <Icon className="size-5" />
        </span>
        {trend && (
          <span className={`text-xs font-semibold ${trendUp ? "text-emerald-500" : "text-rose-500"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <p className={mono ? "font-mono text-xl font-extrabold text-foreground" : "text-2xl font-extrabold text-foreground"}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
