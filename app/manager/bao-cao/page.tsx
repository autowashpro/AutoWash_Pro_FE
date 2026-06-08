"use client"

import { useState } from "react"
import { Calendar, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { BOOKINGS, SERVICES, WASHERS, formatVND } from "@/lib/data"

const bookingData = [
  { date: "2026-05-28", count: 12 },
  { date: "2026-05-29", count: 15 },
  { date: "2026-05-30", count: 10 },
  { date: "2026-05-31", count: 18 },
  { date: "2026-06-01", count: 16 },
  { date: "2026-06-02", count: 14 },
]

const revenueData = [
  { date: "2026-05-28", revenue: 3_200_000 },
  { date: "2026-05-29", revenue: 4_100_000 },
  { date: "2026-05-30", revenue: 2_800_000 },
  { date: "2026-05-31", revenue: 4_600_000 },
  { date: "2026-06-01", revenue: 4_200_000 },
  { date: "2026-06-02", revenue: 3_800_000 },
]

const serviceTypeData = [
  { name: "WASH", value: 68, color: "#1470AF" },
  { name: "FLEX", value: 32, color: "#64748b" },
]

const employeeData = [
  { id: "w-1", name: "Trần Văn Hùng", completed: 48, hours: 38, rating: 4.8 },
  { id: "w-2", name: "Phạm Quốc Bảo", completed: 42, hours: 36, rating: 4.6 },
  { id: "w-3", name: "Lý Gia Khang", completed: 38, hours: 34, rating: 4.4 },
  { id: "w-4", name: "Hoàng Đức Thắng", completed: 35, hours: 32, rating: 4.2 },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{name: string; value: number; color: string}>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border/60 bg-background/95 p-3 text-sm shadow-lg backdrop-blur-md">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono font-bold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

const RevenueTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{name: string; value: number; color: string}>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border/60 bg-background/95 p-3 text-sm shadow-lg backdrop-blur-md">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono font-bold text-foreground">{formatVND(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export default function ReportPage() {
  const [tab, setTab] = useState<"bookings" | "revenue" | "employees">("bookings")
  const [startDate, setStartDate] = useState("2026-05-28")
  const [endDate, setEndDate] = useState("2026-06-02")

  const handleQuickRange = (days: number | "today") => {
    const end = new Date()
    const start = new Date()
    if (days === "today") {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else {
      start.setDate(start.getDate() - days)
    }
    setStartDate(start.toISOString().split("T")[0])
    setEndDate(end.toISOString().split("T")[0])
  }

  const totalBookings = BOOKINGS.length
  const completedBookings = BOOKINGS.filter((b) => b.status === "COMPLETED").length
  const cancelledBookings = BOOKINGS.filter((b) => b.status.includes("CANCELLED")).length
  const completionRate = ((completedBookings / totalBookings) * 100).toFixed(1)

  const totalRevenue = 22_700_000
  const washRevenue = 15_400_000
  const flexRevenue = 7_300_000

  const periods = [
    { label: "Hôm nay", value: "today" as const },
    { label: "7 ngày", value: 7 as const },
    { label: "30 ngày", value: 30 as const },
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Premium Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Báo cáo</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-3">Phân tích dữ liệu và hiệu suất hoạt động.</p>
        </div>

        {/* Date Range + Quick Selectors */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-3">
            <Calendar className="size-4 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-sm focus:outline-none"
            />
            <span className="text-muted-foreground">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-sm focus:outline-none"
            />
          </div>

          {/* Glassmorphism pill tabs */}
          <div className="inline-flex items-center rounded-xl border border-border bg-secondary/60 p-1">
            {periods.map((p) => (
              <button
                key={String(p.value)}
                onClick={() => handleQuickRange(p.value)}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-xs font-semibold transition-all",
                  new Date(endDate).toDateString() === new Date().toDateString() && p.value === "today"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-border bg-card rounded-t-lg">
          {(["bookings", "revenue", "employees"] as const).map((tabName) => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                tab === tabName
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tabName === "bookings"
                ? "Đặt lịch"
                : tabName === "revenue"
                  ? "Doanh thu"
                  : "Nhân viên"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="rounded-b-lg border border-border bg-card">
          {/* Bookings Tab */}
          {tab === "bookings" && (
            <div className="p-8 space-y-8">
              {/* KPI Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground">Tổng đặt lịch</p>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
                      <TrendingUp className="size-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold font-mono text-foreground">{totalBookings}</p>
                  <p className="text-xs text-emerald-500 mt-1 flex items-center gap-0.5">↑ <span>+8% tuần trước</span></p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground">Hoàn thành</p>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-100/60 dark:from-emerald-500/15 dark:to-emerald-900/30 text-emerald-600">
                      <TrendingUp className="size-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold font-mono text-success">{completedBookings}</p>
                  <p className="text-xs text-emerald-500 mt-1 flex items-center gap-0.5">↑ <span>+5% tuần trước</span></p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground">Hủy</p>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-100/60 dark:from-rose-500/15 dark:to-rose-900/30 text-rose-600">
                      <TrendingDown className="size-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold font-mono text-rose-600">{cancelledBookings}</p>
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-0.5">↓ <span>-2% tuần trước</span></p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground">Tỷ lệ hoàn thành</p>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
                      <TrendingUp className="size-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold font-mono text-primary">{completionRate}%</p>
                  <p className="text-xs text-emerald-500 mt-1 flex items-center gap-0.5">↑ <span>+1.2% tuần trước</span></p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-3 gap-6">
                {/* Bar Chart */}
                <div className="col-span-2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                  <h3 className="font-semibold text-foreground mb-4">Số lịch theo ngày</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#1470AF" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                  <h3 className="font-semibold text-foreground mb-4">Tỷ lệ WASH vs FLEX</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {serviceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {tab === "revenue" && (
            <div className="p-8 space-y-8">
              {/* KPI Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground">Tổng doanh thu</p>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
                      <TrendingUp className="size-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-mono text-foreground">{formatVND(totalRevenue)}</p>
                  <p className="text-xs text-emerald-500 mt-1 flex items-center gap-0.5">↑ <span>+12% tuần trước</span></p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground">Doanh thu WASH</p>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
                      <TrendingUp className="size-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-mono text-primary">{formatVND(washRevenue)}</p>
                  <p className="text-xs text-emerald-500 mt-1 flex items-center gap-0.5">↑ <span>+9% tuần trước</span></p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground">Doanh thu FLEX</p>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-100/60 dark:from-slate-500/15 dark:to-slate-900/30 text-slate-600">
                      <TrendingUp className="size-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-mono text-slate-600">{formatVND(flexRevenue)}</p>
                  <p className="text-xs text-emerald-500 mt-1 flex items-center gap-0.5">↑ <span>+18% tuần trước</span></p>
                </div>
              </div>

              {/* Line Chart */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="font-semibold text-foreground mb-4">Doanh thu theo ngày</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip content={<RevenueTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1470AF"
                      strokeWidth={2}
                      dot={{ fill: "#1470AF", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Employees Tab */}
          {tab === "employees" && (
            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-4 text-left font-semibold">Nhân viên</th>
                      <th className="px-6 py-4 text-left font-semibold">Số xe hoàn thành</th>
                      <th className="px-6 py-4 text-left font-semibold">Giờ làm</th>
                      <th className="px-6 py-4 text-left font-semibold">Đánh giá TB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {employeeData.map((emp) => (
                      <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{emp.name}</td>
                        <td className="px-6 py-4 text-foreground font-mono font-semibold">{emp.completed}</td>
                        <td className="px-6 py-4 text-foreground font-mono">{emp.hours}h</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-semibold text-foreground">{emp.rating}</span>
                            <span className="text-xs text-muted-foreground">⭐</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
