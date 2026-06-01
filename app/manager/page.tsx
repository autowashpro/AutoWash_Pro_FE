import { CircleParking, Users, CalendarClock, DollarSign, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/status-badge"
import { BAYS, BOOKINGS, WASHERS, formatVND } from "@/lib/data"

const occupied = BAYS.filter((b) => b.status === "occupied").length
const available = BAYS.filter((b) => b.status === "available").length
const todayRevenue = BOOKINGS.filter((b) => b.date === "2026-06-01" && b.status === "COMPLETED").reduce(
  (sum, b) => sum + b.price,
  0,
)
const todayBookings = BOOKINGS.filter((b) => b.date === "2026-06-01")
const queue = todayBookings.filter((b) => ["PENDING", "CONFIRMED"].includes(b.status))

const BAY_STATUS = {
  available: { label: "Trống", classes: "border-success/30 bg-success/5 text-success" },
  occupied: { label: "Đang dùng", classes: "border-primary/30 bg-accent text-primary" },
  maintenance: { label: "Bảo trì", classes: "border-border bg-secondary text-muted-foreground" },
}

export default function ManagerDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tổng quan vận hành</h1>
        <p className="text-sm text-muted-foreground">Trạng thái chi nhánh theo thời gian thực · Hôm nay</p>
      </div>

      {/* KPI bento */}
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={CircleParking} label="Khoang đang hoạt động" value={`${occupied}/${BAYS.length}`} />
        <Kpi icon={CalendarClock} label="Lịch hẹn hôm nay" value={String(todayBookings.length)} />
        <Kpi icon={Users} label="Thợ sẵn sàng" value={String(WASHERS.filter((w) => w.status === "available").length)} />
        <Kpi icon={DollarSign} label="Doanh thu hôm nay" value={formatVND(todayRevenue)} mono />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bay capacity */}
        <section className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Sức chứa khoang rửa</h2>
            <span className="text-sm text-muted-foreground">{available} khoang trống</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {BAYS.map((bay) => {
              const meta = BAY_STATUS[bay.status]
              return (
                <div key={bay.id} className={cn("rounded-2xl border p-4", meta.classes)}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{bay.name}</p>
                    {bay.status === "maintenance" ? (
                      <Wrench className="size-4" />
                    ) : (
                      <CircleParking className="size-4" />
                    )}
                  </div>
                  <p className="mt-2 text-xs font-medium">{meta.label}</p>
                  {bay.currentBookingCode && (
                    <p className="mt-3 border-t border-current/10 pt-2 text-xs">
                      <span className="font-mono">{bay.currentBookingCode}</span> · {bay.washerName}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Washer status */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Đội ngũ thợ</h2>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {WASHERS.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                    {w.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{w.jobsToday} đơn hôm nay</p>
                  </div>
                </div>
                <WasherDot status={w.status} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Queue */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Hàng chờ phân công</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Mã</th>
                <th className="px-4 py-3 font-medium">Khách hàng</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Dịch vụ</th>
                <th className="px-4 py-3 font-medium">Giờ</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {queue.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b.code}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{b.customerName}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{b.serviceName}</td>
                  <td className="px-4 py-3 font-mono text-foreground">{b.timeSlot}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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
      <p className={cn("mt-3 text-2xl font-bold text-foreground", mono && "font-mono text-xl")}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function WasherDot({ status }: { status: "available" | "busy" | "offline" }) {
  const meta = {
    available: { label: "Sẵn sàng", color: "text-success bg-success/10" },
    busy: { label: "Đang bận", color: "text-primary bg-primary/10" },
    offline: { label: "Ngoại tuyến", color: "text-muted-foreground bg-secondary" },
  }[status]
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", meta.color)}>
      {meta.label}
    </span>
  )
}
