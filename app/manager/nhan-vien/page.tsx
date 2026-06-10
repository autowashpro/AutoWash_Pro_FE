"use client"

import { useState, useEffect } from "react"
import { Users, Loader2, AlertCircle, Award, CheckCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getCarWashers } from "@/lib/api"
import { WASHERS } from "@/lib/data"
import type { CarWasher } from "@/lib/types"

const getStatusInfo = (isAvailable: boolean) => {
  if (isAvailable) {
    return { label: "Đang rảnh", dot: "bg-emerald-500", color: "text-emerald-600" }
  }
  return { label: "Đang làm việc", dot: "bg-blue-500", color: "text-blue-600" }
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function EmployeeListPage() {
  const [washers, setWashers] = useState<CarWasher[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "busy">("all")

  useEffect(() => {
    async function loadWashers() {
      try {
        setLoading(true)
        const data = await getCarWashers()
        setWashers(data)
      } catch (err) {
        console.warn("getCarWashers API failed or empty. Falling back to mock data.", err)
        // Fallback to mock data mapped to CarWasher interface
        const fallbackList: CarWasher[] = WASHERS.map(w => ({
          washerId: w.id,
          fullName: w.name,
          tasksToday: 5,
          completedTasksToday: w.jobsToday,
          status: w.status === "available" ? "AVAILABLE" : "BUSY",
          averageRating: w.trustScore ? w.trustScore / 20 : 4.5
        }))
        setWashers(fallbackList)
      } finally {
        setLoading(false)
      }
    }
    loadWashers()
  }, [])

  const filteredWashers = washers.filter((w) => {
    if (filterStatus === "all") return true
    if (filterStatus === "available") return w.status === "AVAILABLE"
    return w.status !== "AVAILABLE"
  })

  const totalStaff = washers.length
  const availableCount = washers.filter(w => w.status === "AVAILABLE").length
  const busyCount = totalStaff - availableCount

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Premium Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Danh sách nhân viên</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-3">
            Theo dõi trạng thái làm việc và năng suất của <span className="font-semibold text-foreground">{totalStaff}</span> thợ rửa xe
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between shadow-sm hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)] transition-all">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Tổng số nhân sự</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">{loading ? "..." : totalStaff}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-[var(--shadow-glow)]">
              <Users className="size-6" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between shadow-sm hover:border-emerald-500/40 transition-all">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Nhân viên đang rảnh</p>
              <p className="text-3xl font-extrabold text-emerald-500 mt-1">{loading ? "..." : availableCount}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 shadow-[var(--shadow-glow)]">
              <CheckCircle className="size-6" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between shadow-sm hover:border-blue-500/40 transition-all">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Nhân viên đang làm xe</p>
              <p className="text-3xl font-extrabold text-blue-500 mt-1">{loading ? "..." : busyCount}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 shadow-[var(--shadow-glow)]">
              <Loader2 className="size-6 animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Filter Tabs — glassmorphism pill */}
        <div className="inline-flex items-center rounded-xl border border-border bg-secondary/60 p-1 mt-2">
          {(["all", "available", "busy"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                filterStatus === status
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === "all"
                ? "Tất cả"
                : status === "available"
                ? "Đang rảnh"
                : "Đang thực hiện dịch vụ"}
            </button>
          ))}
        </div>

        {/* Grid Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 border border-border rounded-2xl bg-card">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang tải danh sách nhân viên...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWashers.map((washer) => {
              const statusInfo = getStatusInfo(washer.status === "AVAILABLE")
              const initials = getInitials(washer.fullName)
              const totalTasks = washer.tasksToday || 5
              const completedTasks = washer.completedTasksToday || 0

              return (
                <div key={washer.washerId} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 h-full flex flex-col justify-between gap-4">
                  {/* Avatar & Name */}
                  <div className="flex items-start gap-4">
                    <div className="size-14 rounded-full bg-gradient-to-br from-primary to-sky-400 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-[var(--shadow-glow)]">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg truncate">{washer.fullName}</h3>
                      <p className="font-mono text-xs text-muted-foreground mt-1">
                        ID: {washer.washerId.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Status & Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`size-2.5 rounded-full ${statusInfo.dot}`} />
                      <span className={`text-xs font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-foreground">
                        {washer.averageRating?.toFixed(1) || "4.5"}
                      </span>
                      <span className="text-amber-500">⭐</span>
                    </div>
                  </div>

                  {/* Tasks Today */}
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground">Hiệu suất hôm nay</p>
                      <p className="text-xs font-mono font-bold text-primary">{Math.round((completedTasks / totalTasks) * 100)}%</p>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-foreground">{completedTasks}/{totalTasks} hoàn thành</p>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-sky-400 transition-all duration-500 rounded-full"
                        style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Detail Button */}
                  <Link href={`/manager/nhan-vien/${washer.washerId}`}>
                    <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5 mt-2">
                      Xem chi tiết
                      <ChevronRight className="size-4" />
                    </button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {!loading && filteredWashers.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border/60 p-16 text-center">
            <Users className="size-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="font-medium text-foreground">Không tìm thấy thợ rửa xe nào ở trạng thái này.</p>
            <p className="text-sm text-muted-foreground mt-1">Thử chọn bộ lọc khác</p>
          </div>
        )}
      </div>
    </div>
  )
}
