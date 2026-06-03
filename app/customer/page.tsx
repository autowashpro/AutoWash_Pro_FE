import Link from "next/link"
import { CalendarPlus, Clock, MapPin, Sparkles, Gift, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge, TierBadge } from "@/components/status-badge"
import { BOOKINGS, formatVND, formatDate } from "@/lib/data"

const myBookings = BOOKINGS.filter((b) => b.customerName === "Nguyễn Minh Anh")
const upcoming = myBookings.filter((b) =>
  ["PENDING", "CONFIRMED", "ASSIGNED", "IN_PROGRESS"].includes(b.status),
)
const history = myBookings.filter((b) => b.status === "COMPLETED")

export default function CustomerDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          Xin chào, Minh Anh
        </h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi lịch rửa xe và ưu đãi thành viên của bạn.
        </p>
      </div>

      {/* Loyalty highlight */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground sm:col-span-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm/relaxed opacity-80">Điểm thưởng hiện có</p>
              <p className="font-mono text-4xl font-bold tracking-tight">412</p>
            </div>
            <TierBadge tier="GOLD" className="bg-primary-foreground/15 text-primary-foreground" />
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-xs opacity-80 text-pretty">
              Còn 88 điểm nữa để đạt hạng Bạch kim và nhận ưu đãi 15%.
            </p>
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="shrink-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link href="/customer/diem-thuong">
                <Gift className="size-4" />
                Đổi quà
              </Link>
            </Button>
          </div>
        </div>

        <Link
          href="/customer/dat-lich"
          className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <CalendarPlus className="size-5" />
          </span>
          <div className="mt-4">
            <p className="font-semibold text-foreground">Đặt lịch mới</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-primary">
              Bắt đầu ngay
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </p>
          </div>
        </Link>
      </div>

      {/* Upcoming */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Lịch sắp tới</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Bạn chưa có lịch hẹn nào sắp tới.
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Sparkles className="size-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{b.serviceName}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.vehicle.model} · {b.vehicle.plate}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {formatDate(b.date)} · {b.timeSlot}
                      </span>
                      {b.bayId && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {b.bayId === "bay-1" ? "Khoang 1" : "Khoang 2"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <StatusBadge status={b.status} />
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {formatVND(b.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Lịch sử gần đây</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {history.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-medium text-foreground">{b.serviceName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(b.date)} · {b.vehicle.plate}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={b.status} />
                <span className="font-mono text-sm font-semibold text-foreground">
                  {formatVND(b.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
