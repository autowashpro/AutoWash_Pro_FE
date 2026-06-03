"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  { name: "WASH", value: 68, color: "#2563eb" },
  { name: "FLEX", value: 32, color: "#64748b" },
]

const employeeData = [
  { id: "w-1", name: "Trần Văn Hùng", completed: 48, hours: 38, rating: 4.8 },
  { id: "w-2", name: "Phạm Quốc Bảo", completed: 42, hours: 36, rating: 4.6 },
  { id: "w-3", name: "Lý Gia Khang", completed: 38, hours: 34, rating: 4.4 },
  { id: "w-4", name: "Hoàng Đức Thắng", completed: 35, hours: 32, rating: 4.2 },
]

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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Báo cáo & Thống kê</h1>

          {/* Date Range Picker */}
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

            {/* Quick Buttons */}
            <Button
              variant={
                new Date(endDate).toDateString() === new Date().toDateString()
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => handleQuickRange("today")}
              className="bg-primary hover:bg-primary/90"
            >
              Hôm nay
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickRange(7)}
            >
              7 ngày
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickRange(30)}
            >
              30 ngày
            </Button>
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
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Tổng đặt lịch</p>
                  <p className="text-3xl font-bold text-foreground">{totalBookings}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Hoàn thành</p>
                  <p className="text-3xl font-bold text-success">{completedBookings}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Hủy</p>
                  <p className="text-3xl font-bold text-rose-600">{cancelledBookings}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Tỷ lệ hoàn thành</p>
                  <p className="text-3xl font-bold text-primary">{completionRate}%</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-3 gap-6">
                {/* Bar Chart */}
                <div className="col-span-2 rounded-xl border border-border bg-muted/5 p-6">
                  <h3 className="font-semibold text-foreground mb-4">Số lịch theo ngày</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "6px",
                          color: "#f1f5f9",
                        }}
                      />
                      <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="rounded-xl border border-border bg-muted/5 p-6">
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
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {tab === "revenue" && (
            <div className="p-8 space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Tổng doanh thu</p>
                  <p className="text-2xl font-bold text-foreground">{formatVND(totalRevenue)}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Doanh thu WASH</p>
                  <p className="text-2xl font-bold text-primary">{formatVND(washRevenue)}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Doanh thu FLEX</p>
                  <p className="text-2xl font-bold text-slate-600">{formatVND(flexRevenue)}</p>
                </div>
              </div>

              {/* Line Chart */}
              <div className="rounded-xl border border-border bg-muted/5 p-6">
                <h3 className="font-semibold text-foreground mb-4">Doanh thu theo ngày</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                    <Tooltip
                      formatter={(value) => formatVND(value as number)}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "6px",
                        color: "#f1f5f9",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ fill: "#2563eb", r: 4 }}
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
                        <td className="px-6 py-4 text-foreground font-semibold">{emp.completed}</td>
                        <td className="px-6 py-4 text-foreground">{emp.hours}h</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{emp.rating}</span>
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
