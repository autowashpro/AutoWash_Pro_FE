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
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="size-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Danh sách nhân viên</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Quản lý {filteredWashers.length} nhân viên rửa xe
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 border-b border-border">
          {(["all", "available", "offline"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                filterStatus === status
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {status === "all"
                ? "Tất cả"
                : status === "available"
                  ? "Đang ca"
                  : "Nghỉ"}
            </button>
          ))}
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWashers.map((washer) => {
            const statusInfo = getStatusInfo(washer.status)
            const initials = getInitials(washer.name)
            const totalTasks = 5 // Mock value
            const completedTasks = washer.jobsToday

            return (
              <Link key={washer.id} href={`/manager/nhan-vien/${washer.id}`}>
                <div className="rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col gap-4">
                  {/* Avatar & Name */}
                  <div className="flex items-start gap-4">
                    <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg">{washer.name}</h3>
                      <p className="font-mono text-xs text-muted-foreground mt-1">
                        {washer.id.toUpperCase()}
                      </p>
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
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Task hôm nay</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-foreground">
                        {completedTasks}/{totalTasks} hoàn thành
                      </p>
                      <div className="w-24 h-2 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                        />
                      </div>
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
                  <Button className="w-full bg-primary hover:bg-primary/90 gap-2 mt-2">
                    <span>Xem chi tiết</span>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </Link>
            )
          })}
        </div>

        {filteredWashers.length === 0 && (
          <div className="text-center py-12">
            <Users className="size-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Không có nhân viên</p>
          </div>
        )}
      </div>
    </div>
  )
}
