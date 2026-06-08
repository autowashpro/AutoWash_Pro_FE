"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WASHERS } from "@/lib/data"

type StatusFilter = "all" | "available" | "offline"

const getStatusInfo = (status: string) => {
  switch (status) {
    case "available":
      return { label: "Đang rảnh", dot: "bg-success", color: "text-success" }
    case "busy":
      return { label: "Đang làm", dot: "bg-primary", color: "text-primary" }
    case "offline":
      return { label: "Nghỉ", dot: "bg-slate-400", color: "text-slate-600" }
    default:
      return { label: "—", dot: "bg-muted", color: "text-muted-foreground" }
  }
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function EmployeeListPage() {
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all")

  const filteredWashers = 
    filterStatus === "all"
      ? WASHERS
      : filterStatus === "available"
        ? WASHERS.filter((w) => w.status === "available" || w.status === "busy")
        : WASHERS.filter((w) => w.status === "offline")

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
            Quản lý <span className="font-semibold text-foreground">{filteredWashers.length}</span> nhân viên rửa xe
          </p>
        </div>

        {/* Filter Tabs — glassmorphism pill */}
        <div className="inline-flex items-center rounded-xl border border-border bg-secondary/60 p-1">
          {(["all", "available", "offline"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                filterStatus === status
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === "all" ? "Tất cả" : status === "available" ? "Đang ca" : "Nghỉ"}
            </button>
          ))}
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWashers.map((washer) => {
            const statusInfo = getStatusInfo(washer.status)
            const initials = getInitials(washer.name)
            const totalTasks = 5
            const completedTasks = washer.jobsToday

            return (
              <Link key={washer.id} href={`/manager/nhan-vien/${washer.id}`}>
                <div className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full flex flex-col gap-4">
                  {/* Avatar & Name */}
                  <div className="flex items-start gap-4">
                    <div className="size-14 rounded-full bg-gradient-to-br from-primary to-sky-400 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-[var(--shadow-glow)]">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg">{washer.name}</h3>
                      <p className="font-mono text-xs text-muted-foreground mt-1">{washer.id.toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <div className={`size-2.5 rounded-full ${statusInfo.dot}`} />
                    <span className={`text-sm font-semibold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Tasks Today */}
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground">Task hôm nay</p>
                      <p className="text-xs font-mono font-bold text-primary">{Math.round((completedTasks / totalTasks) * 100)}%</p>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-foreground">{completedTasks}/{totalTasks} hoàn thành</p>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-sky-400 transition-all duration-500 rounded-full"
                        style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Đánh giá trung bình</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-foreground">
                        {(washer.trustScore / 20).toFixed(1)}
                      </span>
                      <span className="text-lg">⭐</span>
                    </div>
                  </div>

                  {/* Detail Button */}
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5 mt-2">
                    Xem chi tiết
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </Link>
            )
          })}
        </div>

        {filteredWashers.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border/60 p-16 text-center">
            <Users className="size-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="font-medium text-foreground">Không có nhân viên</p>
            <p className="text-sm text-muted-foreground mt-1">Thử chọn bộ lọc khác</p>
          </div>
        )}
      </div>
    </div>
  )
}
