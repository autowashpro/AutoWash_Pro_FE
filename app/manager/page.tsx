"use client"

import { useState } from "react"
import { AlertCircle, Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { BOOKINGS, BAYS, WASHERS, CATALOG, formatVND, CUSTOMERS_LOW_TRUST } from "@/lib/data"

const todayBookings = BOOKINGS.filter(b => b.date === "2026-06-01")
const pending = todayBookings.filter(b => ["PENDING", "CONFIRMED"].includes(b.status))
const inProgress = todayBookings.filter(b => b.status === "IN_PROGRESS")
const completed = todayBookings.filter(b => b.status === "COMPLETED")

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
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Tổng quan vận hành</h1>
          <p className="text-sm text-muted-foreground">Quản lý lịch hẹn, phân công nhân viên và tình trạng khoang rửa</p>
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
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-muted-foreground mb-2">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
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
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
              >
                <option>Tất cả loại</option>
                <option>WASH</option>
                <option>FLEX</option>
              </select>
            </div>
          </div>

          {/* 2. KPI Cards - 4 SMALL */}
          <div className="col-span-3 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-muted-foreground">Tổng đặt lịch</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{todayBookings.length}</p>
          </div>
          <div className="col-span-3 rounded-2xl border border-border/50 bg-gold/5 p-5 border-gold/30">
            <p className="text-sm font-semibold text-gold">Chờ xử lý</p>
            <p className="mt-2 text-3xl font-bold text-gold">{pending.length}</p>
          </div>
          <div className="col-span-3 rounded-2xl border border-border/50 bg-primary/5 p-5 border-primary/30">
            <p className="text-sm font-semibold text-primary">Đang thực hiện</p>
            <p className="mt-2 text-3xl font-bold text-primary">{inProgress.length}</p>
          </div>
          <div className="col-span-3 rounded-2xl border border-border/50 bg-success/5 p-5 border-success/30">
            <p className="text-sm font-semibold text-success">Hoàn thành</p>
            <p className="mt-2 text-3xl font-bold text-success">{completed.length}</p>
          </div>

          {/* 3. Bookings Table - LARGE MAIN */}
          <div className="col-span-8 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Lịch hẹn hôm nay</h2>
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
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b.code}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{b.customerName}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{b.serviceName}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-foreground">{b.timeSlot}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{b.bayId ? `Cầu ${b.bayId.split('-')[1]}` : "-"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{b.washerName || "-"}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
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

          {/* 4. Bay Status - MEDIUM */}
          <div className="col-span-4 rounded-2xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Tình trạng cầu nâng</h2>
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

          {/* 5. Low Trust Score Warning - MEDIUM */}
          <div className="col-span-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5 text-rose-600" />
              <h2 className="font-semibold text-rose-900">Điểm uy tín thấp</h2>
            </div>
            <div className="space-y-2">
              {CUSTOMERS_LOW_TRUST.map(cust => (
                <div key={cust.id} className="flex items-center justify-between text-xs border-b border-rose-200 pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{cust.name}</p>
                    <p className="text-muted-foreground">{cust.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-600">{cust.trustScore}</p>
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

      {/* Floating FAB */}
      <div className="fixed bottom-6 right-6">
        <Button size="lg" className="rounded-full gap-2 h-14 px-6 bg-primary hover:bg-primary/90 shadow-lg">
          <Plus className="size-5" />
          Walk-in
        </Button>
      </div>
    </div>
  )
}
