"use client"

import { useState, useEffect } from "react"
import { DollarSign, CalendarCheck, Users, Repeat, Loader2 } from "lucide-react"
import dynamic from 'next/dynamic'

const RevenueChart = dynamic(
  () => import('@/components/manager/revenue-chart').then(mod => mod.RevenueChart),
  { ssr: false }
)
import { getAdminDashboard } from "@/lib/api"
import { formatVND } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadDashboard() {
      try {
        const stats = await getAdminDashboard()
        if (stats) {
          setData(stats)
        }
      } catch (err) {
        console.warn("Failed to fetch admin dashboard stats, using mock", err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  // KPI calculations (Real Data Only - no hardcoded mock fallbacks)
  const displayRevenue = data?.revenue?.totalRevenue ?? data?.total_revenue ?? 0
  const displayBookings = data?.bookings?.monthBookings ?? data?.month_bookings ?? 0
  const displayCustomers = data?.users?.activeCustomers ?? data?.active_customers ?? 0
  const displayComplaints = data?.complaints?.openComplaints ?? data?.open_complaints ?? 0

  const topServices: Array<{ name: string; count: number }> = data?.topServices ?? data?.top_services ?? []

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Đang tải báo cáo hệ thống...</p>
      </div>
    )
  }

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
        <Kpi icon={DollarSign} label="Doanh thu (Toàn thời gian)" value={formatVND(displayRevenue)} mono trend="+12%" trendUp />
        <Kpi icon={CalendarCheck} label="Lượt đặt trong tháng" value={String(displayBookings)} trend="+5%" trendUp />
        <Kpi icon={Users} label="Khách hàng hoạt động" value={String(displayCustomers)} trend="+8%" trendUp />
        <Kpi icon={Repeat} label="Khiếu nại đang xử lý" value={String(displayComplaints)} trend="-15%" trendUp={false} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <section className="space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
            <h2 className="text-base font-bold tracking-tight text-foreground">Doanh thu 7 ngày gần nhất</h2>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <RevenueChart data={data?.revenueByDays ?? data?.revenue_by_days} />
          </div>
        </section>

        {/* Top Services */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
            <h2 className="text-base font-bold tracking-tight text-foreground">Dịch vụ phổ biến</h2>
          </div>
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            {topServices.length === 0 ? (
              <div className="flex h-[210px] flex-col items-center justify-center gap-1 text-center">
                <p className="text-sm font-medium text-muted-foreground">Chưa có dữ liệu dịch vụ</p>
                <p className="text-xs text-muted-foreground/80">Sẽ hiển thị khi có dữ liệu đặt lịch thực tế từ máy chủ.</p>
              </div>
            ) : (
              topServices.map((s, i) => {
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
              })
            )}
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
