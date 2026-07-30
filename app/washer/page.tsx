"use client"

import { useEffect, useState, useMemo } from "react"
import { MapPin, Loader2, Clock, CheckCircle2, Wrench, Timer, Search, Calendar, Car, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { getWasherTasks } from "@/lib/api/bookings"
import type { BookingSummary } from "@/lib/types"
import { getMe } from "@/lib/api"
import { getLocalDateString } from "@/lib/utils"

function formatVehicleSize(size: string | undefined): string {
  if (!size) return "-"
  const s = size.toUpperCase()
  switch (s) {
    case "SMALL": return "Nhỏ (S)"
    case "MEDIUM": return "Vừa (M)"
    case "LARGE": return "Lớn (L)"
    default: return size
  }
}

export default function WasherJobsPage() {
  const [tasks, setTasks] = useState<BookingSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [washerName, setWasherName] = useState<string>("Thợ rửa xe")

  // Filter & Search states (Default date is Today)
  const todayStr = useMemo(() => getLocalDateString(), [])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [sizeFilter, setSizeFilter] = useState("ALL")
  const [dateFilter, setDateFilter] = useState(todayStr)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const fetchTasks = async (currentWasherName: string = washerName, date?: string) => {
    try {
      setLoading(true)
      const data = await getWasherTasks(date || undefined)
      setTasks(data)
    } catch (error: any) {
      console.error("Failed to fetch washer tasks", error)
      import("sonner").then(({ toast }) => {
        toast.error(
          error?.response?.data?.message || "Không tải được danh sách công việc",
          { description: "Kiểm tra kết nối mạng và tải lại trang." }
        )
      })
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let currentName = washerName
    async function init() {
      try {
        const user = await getMe()
        if (user && (user.fullName || user.FullName)) {
          const name = user.fullName || user.FullName
          setWasherName(name)
          currentName = name
        }
      } catch (err) {
        console.warn("Failed to load washer profile info:", err)
      }
      await fetchTasks(currentName, dateFilter)
    }
    init()
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => fetchTasks(currentName, dateFilter), 30000)
    return () => clearInterval(interval)
  }, [dateFilter])

  const completed = tasks.filter((b) => b.status === "COMPLETED" || b.status === "CLOSED" || b.status === "PAID")
  const inProgress = tasks.filter((b) => b.status === "IN_PROGRESS" || b.status === "VEHICLE_INSPECTED" || b.status === "CUSTOMER_CONFIRMED_CONDITION" || b.status === "CHECKED_IN")
  const assigned = tasks.filter((b) => b.status === "ASSIGNED")

  // Calculate work hours
  const completedHours = completed.length * 0.5
  const inProgressHours = inProgress.length * 0.67
  const totalHours = completedHours + inProgressHours
  const hours = Math.floor(totalHours)
  const minutes = Math.round((totalHours - hours) * 60)

  const activeJobs = [...assigned, ...inProgress].sort((a, b) => {
    const timeA = a.assigned_at ? new Date(a.assigned_at).getTime() : 0
    const timeB = b.assigned_at ? new Date(b.assigned_at).getTime() : 0
    return timeB - timeA
  })

  const finishedJobs = [...completed].sort((a, b) => {
    const timeA = a.assigned_at ? new Date(a.assigned_at).getTime() : 0
    const timeB = b.assigned_at ? new Date(b.assigned_at).getTime() : 0
    return timeB - timeA
  })

  const allJobs = useMemo(() => [...activeJobs, ...finishedJobs], [activeJobs, finishedJobs])

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = (job.customer_name || "").toLowerCase().includes(q)
        const matchPlate = (job.license_plate || "").toLowerCase().includes(q)
        const matchId = (job.booking_id || "").toLowerCase().includes(q)
        const matchService = (job.services_summary || "").toLowerCase().includes(q)
        if (!matchName && !matchPlate && !matchId && !matchService) return false
      }

      // 2. Status Filter
      if (statusFilter === "ASSIGNED" && job.status !== "ASSIGNED") return false
      if (statusFilter === "IN_PROGRESS" && !["IN_PROGRESS", "VEHICLE_INSPECTED", "CUSTOMER_CONFIRMED_CONDITION", "CHECKED_IN"].includes(job.status)) return false
      if (statusFilter === "COMPLETED" && !["COMPLETED", "CLOSED", "PAID"].includes(job.status)) return false

      // 3. Size Filter
      if (sizeFilter !== "ALL" && (job.vehicle_size || "").toUpperCase() !== sizeFilter) return false

      return true
    })
  }, [allJobs, searchQuery, statusFilter, sizeFilter])

  // Pagination calculation
  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredJobs.slice(start, start + pageSize)
  }, [filteredJobs, currentPage, pageSize])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, sizeFilter, dateFilter, pageSize])

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "ALL" || sizeFilter !== "ALL" || dateFilter !== todayStr

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("ALL")
    setSizeFilter("ALL")
    setDateFilter(todayStr)
    setCurrentPage(1)
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* Premium Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Công việc được phân công</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-3">
          Các đầu việc được phân công cho bạn.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hoàn thành</span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-100/60 dark:from-emerald-500/15 dark:to-emerald-900/30 text-emerald-600">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="font-mono text-3xl font-extrabold text-emerald-600">{completed.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Đang xử lý</span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-100/60 dark:from-amber-500/15 dark:to-amber-900/30 text-amber-600">
              <Wrench className="size-4" />
            </span>
          </div>
          <p className="font-mono text-3xl font-extrabold text-amber-600">{inProgress.length + assigned.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Giờ làm</span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
              <Timer className="size-4" />
            </span>
          </div>
          <p className="font-mono text-3xl font-extrabold text-foreground">{hours}h {minutes}m</p>
        </div>
      </div>

      {/* Filter Control Panel - Structured 3 Clear Columns with Distinct Labels */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
        {/* Search Input (Full Width) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground tracking-wide flex items-center gap-2">
            <span className="size-5 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <Search className="size-3.5" />
            </span>
            <span>TÌM KIẾM CÔNG VIỆC</span>
          </label>
          <input
            type="text"
            placeholder="Tìm theo biển số xe, tên khách hàng, mã booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-4 pr-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          />
        </div>

        {/* 3 Columns Grid for Date, Status and Size Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Column 1: Date Filter */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-1.5">
            <label className="text-xs font-bold text-foreground tracking-wide flex items-center gap-2">
              <span className="size-5 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                <Calendar className="size-3.5" />
              </span>
              <span>NGÀY KHÁCH ĐẾN</span>
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              title="Lọc theo ngày tháng khách đến"
            />
          </div>

          {/* Column 2: Status Filter */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-1.5">
            <label className="text-xs font-bold text-foreground tracking-wide flex items-center gap-2">
              <span className="size-5 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Wrench className="size-3.5" />
              </span>
              <span>TRẠNG THÁI</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ASSIGNED">Chờ xử lý (Assigned)</option>
              <option value="IN_PROGRESS">Đang làm (In Progress)</option>
              <option value="COMPLETED">Đã hoàn thành (Completed)</option>
            </select>
          </div>

          {/* Column 3: Size Filter */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-1.5">
            <label className="text-xs font-bold text-foreground tracking-wide flex items-center gap-2">
              <span className="size-5 rounded-md bg-sky-500/10 flex items-center justify-center text-sky-600">
                <Car className="size-3.5" />
              </span>
              <span>KÍCH THƯỚC XE</span>
            </label>
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            >
              <option value="ALL">Tất cả cỡ xe</option>
              <option value="SMALL">Nhỏ (S)</option>
              <option value="MEDIUM">Vừa (M)</option>
              <option value="LARGE">Lớn (L)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Quick Action Buttons */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
              <span>
                Tìm thấy <strong className="text-foreground font-semibold">{filteredJobs.length}</strong> công việc phù hợp
              </span>
              {dateFilter && (
                <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                  {dateFilter === todayStr ? "Hôm nay" : `Ngày: ${dateFilter}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateFilter(todayStr)}
                className="h-7 px-2 text-[11px] gap-1"
              >
                <Calendar className="size-3" /> Hôm nay
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-7 px-2 text-[11px] text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 gap-1"
              >
                <RotateCcw className="size-3" /> Đặt lại tất cả
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tasks List */}
      {filteredJobs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border/60 p-12 text-center">
          <p className="text-2xl mb-2">{hasActiveFilters ? "🔍" : "☕"}</p>
          <p className="text-sm font-medium text-foreground">
            {hasActiveFilters ? "Không tìm thấy công việc phù hợp" : "Không có task nào được phân công"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {hasActiveFilters ? "Thử thay đổi ngày tháng, từ khóa hoặc bộ lọc tìm kiếm." : "Nghỉ ngơi đi nhé!"}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-4 text-xs gap-1.5">
              <RotateCcw className="size-3.5" /> Xóa bộ lọc
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedJobs.map((b) => {
            return (
              <Link key={b.booking_id} href={`/washer/${b.booking_id}`}>
                <div className="rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      {/* Time badge */}
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 font-mono text-xs font-semibold text-primary">
                        <Clock className="size-3" />
                        {b.slot_start_time}
                      </div>
                      {/* Customer name */}
                      <p className="text-base font-semibold text-foreground">{b.customer_name || "Khách hàng"}</p>
                      {/* Plate + size */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-extrabold text-foreground tracking-wider">{b.license_plate}</span>
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                          {formatVehicleSize(b.vehicle_size)}
                        </span>
                      </div>
                      {/* Service + type */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{b.services_summary}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${b.booking_type === "WASH" ? "bg-primary" : "bg-violet-600"}`}>
                          {b.booking_type}
                        </span>
                      </div>
                      {/* Bay + Status */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        {(b as any).bay_id && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3.5" />
                            {(b as any).bay_id.replace("bay-", "Cầu #")}
                          </span>
                        )}
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary shrink-0">Xem chi tiết →</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredJobs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-sm shadow-xs">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              Hiển thị <strong className="text-foreground font-semibold">{(currentPage - 1) * pageSize + 1}</strong> - <strong className="text-foreground font-semibold">{Math.min(currentPage * pageSize, filteredJobs.length)}</strong> trên tổng số <strong className="text-foreground font-semibold">{filteredJobs.length}</strong> công việc
            </span>
            <div className="flex items-center gap-1">
              <span>| Số lượng/trang:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-lg border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="h-8 px-2.5 text-xs gap-1"
            >
              <ChevronLeft className="size-3.5" /> Trước
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={currentPage === p ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(p)}
                className="size-8 p-0 text-xs font-semibold"
              >
                {p}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="h-8 px-2.5 text-xs gap-1"
            >
              Sau <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
