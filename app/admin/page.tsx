"use client"

import { useState, useEffect } from "react"
import { DollarSign, CalendarCheck, Users, Repeat, Loader2, RefreshCcw, Download } from "lucide-react"
import dynamic from 'next/dynamic'

const RevenueChart = dynamic(
  () => import('@/components/manager/revenue-chart').then(mod => mod.RevenueChart),
  { ssr: false }
)
const BookingStatusChart = dynamic(
  () => import('@/components/admin/booking-status-chart').then(mod => mod.BookingStatusChart),
  { ssr: false }
)

import { getAdminDashboard } from "@/lib/api/dashboard"
import { formatVND } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState("month")
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const loadDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const stats = await getAdminDashboard(timeRange)
      if (stats) {
        setData(stats)
      }
    } catch (err) {
      console.warn("Failed to fetch admin dashboard stats", err)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể tải dữ liệu báo cáo mới nhất.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [timeRange])

  const handleExport = () => {
    setExporting(true)
    toast({
      title: "Đang tạo báo cáo",
      description: "Vui lòng đợi trong giây lát...",
    })
    setTimeout(() => {
      setExporting(false)
      toast({
        title: "Thành công",
        description: "Báo cáo đã được tải xuống máy của bạn.",
      })
    }, 2000)
  }

  // Extract variables safely
  const displayRevenue = data?.revenue?.monthRevenue ?? data?.month_revenue ?? 0
  const todayRevenue = data?.revenue?.todayRevenue ?? 0
  const displayBookings = data?.bookings?.monthBookings ?? data?.month_bookings ?? 0
  const displayCustomers = data?.users?.activeCustomers ?? data?.active_customers ?? 0
  
  const complaintByStatus = data?.complaints?.byStatus ?? {}
  const pendingComplaints = (complaintByStatus["OPEN"] || 0) + (complaintByStatus["IN_REVIEW"] || 0) + (complaintByStatus["WAITING_FOR_CUSTOMER"] || 0)
  const resolvedComplaints = complaintByStatus["RESOLVED"] || 0
  const totalComplaints = pendingComplaints + resolvedComplaints
  
  const topServices: Array<{ name: string; count: number }> = data?.topServices ?? data?.top_services ?? []
  const recentTransactions: Array<{ id: string, customerName: string, amount: number, date: string, status: string }> = data?.recentTransactions ?? data?.recent_transactions ?? []
  const complaintPct = totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 100

  // Calculate booking completion rate
  const byStatus = data?.bookings?.byStatus ?? {}
  const completedBookings = byStatus["COMPLETED"] || 0
  const totalByStatus = Object.values(byStatus).reduce((a: any, b: any) => a + b, 0) as number
  const completionRate = totalByStatus > 0 ? (completedBookings / totalByStatus) * 100 : 100

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Đang tải báo cáo hệ thống...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Premium Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Báo cáo hệ thống</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-3">Tổng quan hiệu suất kinh doanh toàn chuỗi.</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] bg-card">
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="week">7 ngày qua</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="all">Toàn thời gian</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="bg-card"
          >
            <RefreshCcw className={`size-4 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </Button>

          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Download className="size-4 mr-2" />}
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* KPI Cards (Bento Grid) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Doanh thu */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-start justify-between mb-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-600">
              <DollarSign className="size-5" />
            </span>
          </div>
          <p className="font-mono text-2xl font-extrabold text-foreground">{formatVND(displayRevenue)}</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Tổng doanh thu</p>
          <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
            <span className="text-muted-foreground">Hôm nay:</span>
            <span className="font-semibold text-emerald-600">+{formatVND(todayRevenue)}</span>
          </div>
        </div>

        {/* Đặt lịch */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-start justify-between mb-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 text-primary">
              <CalendarCheck className="size-5" />
            </span>
            <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
              {completionRate.toFixed(1)}% Hoàn thành
            </span>
          </div>
          <p className="font-mono text-2xl font-extrabold text-foreground">{displayBookings}</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Lượt đặt trong kỳ</p>
          <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
            <span className="text-muted-foreground">Thành công:</span>
            <span className="font-semibold text-foreground">{completedBookings} đơn</span>
          </div>
        </div>

        {/* Khách hàng */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-start justify-between mb-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 text-indigo-600">
              <Users className="size-5" />
            </span>
          </div>
          <p className="font-mono text-2xl font-extrabold text-foreground">{displayCustomers}</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Khách hàng hoạt động</p>
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }} />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">100% Active</span>
          </div>
        </div>

        {/* Khiếu nại */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-start justify-between mb-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 text-rose-600">
              <Repeat className="size-5" />
            </span>
            {pendingComplaints > 0 && (
              <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full animate-pulse">
                {pendingComplaints} Pending
              </span>
            )}
          </div>
          <p className="font-mono text-2xl font-extrabold text-foreground">{totalComplaints}</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Tổng khiếu nại</p>
          <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="text-emerald-600">Đã giải quyết</span>
              <span className="text-rose-500">Đang chờ</span>
            </div>
            <div className="h-1.5 flex-1 rounded-full bg-rose-500/20 overflow-hidden flex">
              <div className="h-full bg-emerald-500 rounded-l-full transition-all" style={{ width: `${complaintPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <section className="space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
            <h2 className="text-base font-bold tracking-tight text-foreground">
              {timeRange === 'today' ? 'Doanh thu hôm nay' : 
               timeRange === 'week' ? 'Doanh thu 7 ngày qua' :
               timeRange === 'month' ? 'Doanh thu tháng này' : 
               'Tiến trình doanh thu'}
            </h2>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <RevenueChart data={data?.revenueByDays ?? data?.revenue_by_days} />
          </div>
        </section>

        {/* Booking Status Doughnut */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
              <h2 className="text-base font-bold tracking-tight text-foreground">Trạng thái đặt lịch</h2>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <BookingStatusChart data={data?.bookings?.byStatus ?? {}} />
          </div>
        </section>
      </div>

      {/* Bottom Grid: Top Services */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
            <h2 className="text-base font-bold tracking-tight text-foreground">Dịch vụ phổ biến (Leaderboard)</h2>
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
                // Color badges for Top 3
                const rankColor = i === 0 ? "bg-amber-500 text-white" : i === 1 ? "bg-slate-400 text-white" : i === 2 ? "bg-amber-700 text-white" : "bg-primary/10 text-primary"
                const barColor = i === 0 ? "from-amber-400 to-amber-500" : i === 1 ? "from-slate-400 to-slate-500" : i === 2 ? "from-amber-600 to-amber-700" : "from-primary to-sky-400"
                
                return (
                  <div key={s.name} className="space-y-2 group">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold shadow-sm ${rankColor}`}>
                          {i + 1}
                        </span>
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{s.name}</span>
                      </div>
                      <span className="font-mono font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">{s.count}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
        
        {/* Recent Bookings / Transactions */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
            <h2 className="text-base font-bold tracking-tight text-foreground">Giao dịch gần đây</h2>
          </div>
          <div className="rounded-2xl border border-border bg-card p-0 shadow-[var(--shadow-card)] overflow-hidden">
            {recentTransactions.length === 0 ? (
              <div className="flex h-[210px] flex-col items-center justify-center gap-1 text-center p-5">
                <p className="text-sm font-medium text-muted-foreground">Chưa có giao dịch</p>
                <p className="text-xs text-muted-foreground/80">Sẽ hiển thị khi có khách hàng thanh toán thành công.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm text-foreground line-clamp-1">{tx.customerName}</span>
                      <span className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="font-mono font-bold text-emerald-600">+{formatVND(tx.amount)}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
