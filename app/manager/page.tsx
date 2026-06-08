"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, Plus, LayoutDashboard, Clock, Wrench, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { BOOKINGS, BAYS, WASHERS, CATALOG, formatVND, CUSTOMERS_LOW_TRUST } from "@/lib/data"

const todayBookings = BOOKINGS.filter(b => b.date === "2026-06-01")
const pending = todayBookings.filter(b => ["PENDING", "CONFIRMED"].includes(b.status))
const inProgress = todayBookings.filter(b => b.status === "IN_PROGRESS")
const completed = todayBookings.filter(b => b.status === "COMPLETED")

// ── Status badge helper (inline, avoids depending on StatusBadge for raw status strings) ──
function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "Chờ xác nhận",
      className:
        "inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    },
    CONFIRMED: {
      label: "Xác nhận",
      className:
        "inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
    },
    IN_PROGRESS: {
      label: "Đang thực hiện",
      className:
        "inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
    },
    COMPLETED: {
      label: "Hoàn thành",
      className:
        "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    CANCELLED: {
      label: "Đã hủy",
      className:
        "inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
    },
  }
  const cfg = map[status] ?? { label: status, className: "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground" }
  return <span className={cfg.className}>{cfg.label}</span>
}

export default function ManagerDashboardPage() {
  const [selectedDate, setSelectedDate] = useState("2026-06-01")
  const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái")
  const [typeFilter, setTypeFilter] = useState("Tất cả loại")

  const bayStatusColor = {
    available: "border-success/30 bg-success/10 text-success hover:border-success/50",
    occupied: "border-primary/30 bg-primary/10 text-primary hover:border-primary/50",
    maintenance: "border-rose-300/30 bg-rose-50 text-rose-600 hover:border-rose-300/50",
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Quản lý lịch hẹn</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-3">Theo dõi và xử lý các lịch hẹn của khách hàng.</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* 1. Filter Bar - WIDE TOP */}
          <div className="col-span-12 rounded-2xl border border-border bg-card p-4 flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-muted-foreground mb-2">Ngày</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-muted-foreground mb-2">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <option>Tất cả trạng thái</option>
                <option>Chờ xác nhận</option>
                <option>Đang thực hiện</option>
                <option>Hoàn thành</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-muted-foreground mb-2">Loại dịch vụ</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <option>Tất cả loại</option>
                <option>WASH</option>
                <option>FLEX</option>
              </select>
            </div>
          </div>

          {/* ── 2. KPI Cards ── */}
          {/* Total Bookings */}
          <div className="col-span-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
                <LayoutDashboard className="size-5" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Tổng đặt lịch</p>
            </div>
            <p className="text-3xl font-mono font-bold text-foreground">{todayBookings.length}</p>
          </div>

          {/* Pending */}
          <div className="col-span-3 rounded-2xl border border-gold/30 bg-gold/5 p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100/80 to-amber-50 dark:from-amber-900/30 dark:to-amber-950/20 text-amber-600 dark:text-amber-400">
                <Clock className="size-5" />
              </div>
              <p className="text-sm font-semibold text-gold">Chờ xử lý</p>
            </div>
            <p className="text-3xl font-mono font-bold text-gold">{pending.length}</p>
          </div>

          {/* In Progress */}
          <div className="col-span-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
                <Wrench className="size-5" />
              </div>
              <p className="text-sm font-semibold text-primary">Đang thực hiện</p>
            </div>
            <p className="text-3xl font-mono font-bold text-primary">{inProgress.length}</p>
          </div>

          {/* Completed */}
          <div className="col-span-3 rounded-2xl border border-success/30 bg-success/5 p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100/80 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-950/20 text-success">
                <CheckCircle2 className="size-5" />
              </div>
              <p className="text-sm font-semibold text-success">Hoàn thành</p>
            </div>
            <p className="text-3xl font-mono font-bold text-success">{completed.length}</p>
          </div>

          {/* ── 3. Bookings Table - LARGE MAIN ── */}
          <div className="col-span-8 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
                <h2 className="text-base font-bold text-foreground">Lịch hẹn hôm nay</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                    <th className="px-4 py-3 text-left font-semibold">Mã</th>
                    <th className="px-4 py-3 text-left font-semibold">Khách hàng</th>
                    <th className="px-4 py-3 text-left font-semibold">Dịch vụ</th>
                    <th className="px-4 py-3 text-left font-semibold">Giờ hẹn</th>
                    <th className="px-4 py-3 text-left font-semibold">Cầu</th>
                    <th className="px-4 py-3 text-left font-semibold">Nhân viên</th>
                    <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {todayBookings.map(b => (
                    <tr key={b.id} className="hover:bg-secondary/40 transition-colors duration-150 border-b border-border/50 last:border-0">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b.code}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{b.customerName}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{b.serviceName}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-foreground">{b.timeSlot}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{b.bayId ? `Cầu ${b.bayId.split('-')[1]}` : "-"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{b.washerName || "-"}</td>
                      <td className="px-4 py-3">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {!b.washerName && <Button size="sm" variant="outline" className="h-7 text-xs">Gán NV</Button>}
                          {b.status === "PENDING" && <Button size="sm" variant="outline" className="h-7 text-xs">Xác nhận</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 4. Bay Status - MEDIUM ── */}
          <div className="col-span-4 rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
              <h2 className="text-base font-bold text-foreground">Tình trạng cầu nâng</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {BAYS.map(bay => (
                <div
                  key={bay.id}
                  className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${bayStatusColor[bay.status]}`}
                >
                  <p className="font-semibold text-sm">{bay.name}</p>
                  {bay.currentBookingCode && (
                    <p className="text-xs mt-2 font-mono opacity-80">{bay.currentBookingCode}</p>
                  )}
                  {bay.washerName && (
                    <p className="text-xs opacity-75 mt-1">{bay.washerName}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── 5. Low Trust Score Warning - MEDIUM ── */}
          <div className="col-span-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 space-y-4 dark:border-rose-900/40 dark:bg-rose-950/20">
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-0.5 rounded-full bg-rose-500" />
              <AlertCircle className="size-4 text-rose-600 dark:text-rose-400" />
              <h2 className="text-base font-bold text-rose-900 dark:text-rose-200">Điểm uy tín thấp</h2>
            </div>
            <div className="space-y-2">
              {CUSTOMERS_LOW_TRUST.map(cust => (
                <div key={cust.id} className="flex items-center justify-between text-xs border-b border-rose-200 dark:border-rose-900/40 pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{cust.name}</p>
                    <p className="text-muted-foreground">{cust.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-rose-600 dark:text-rose-400">{cust.trustScore}</p>
                    {cust.lastBookingCode && (
                      <p className="text-muted-foreground text-xs">{cust.lastBookingCode}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Walk-in FAB — navigate to walk-in booking form */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/manager/khach-vang-lai">
          <button className="flex items-center gap-2 rounded-full h-14 px-6 bg-gradient-to-r from-primary to-sky-500 text-white font-semibold shadow-[var(--shadow-glow-lg)] transition-all duration-200 hover:shadow-[0_8px_48px_rgba(56,189,248,0.40)] hover:-translate-y-0.5 hover:scale-105">
            <Plus className="size-5" />
            Walk-in
          </button>
        </Link>
      </div>
    </div>
  )
}
