"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { AlertCircle, Plus, Loader2, RefreshCw, LayoutDashboard, Clock, Wrench, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { getManagerBookings, confirmBooking, getManagerSlots } from "@/lib/api/bookings"
import { getManagerCustomers } from "@/lib/api/customers"
import type { BookingSummary, SlotDetail } from "@/lib/types"
import type { ManagerCustomer } from "@/lib/api/customers"
import { toast } from "sonner"
import { AssignWasherModal } from "@/components/manager/assign-washer-modal"

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
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")

  const [bookings, setBookings] = useState<BookingSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [assignModalBookingId, setAssignModalBookingId] = useState<string | null>(null)
  const [isReassign, setIsReassign] = useState(false)

  // Dashboard side panels data
  const [todaySlots, setTodaySlots] = useState<SlotDetail[]>([])
  const [lowTrustCustomers, setLowTrustCustomers] = useState<ManagerCustomer[]>([])

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getManagerBookings({
        date: selectedDate,
        limit: 100
      })
      const bookingsData = data.data
      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.items || []
      setBookings(bookingsArray)
      setLastRefreshed(new Date())
    } catch (error) {
      console.error("Failed to fetch manager bookings", error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  // Load side panel data: today slots + low trust customers
  const fetchSidePanelData = useCallback(async () => {
    try {
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
      const [slots, customers] = await Promise.allSettled([
        getManagerSlots(dateStr),
        getManagerCustomers(),
      ])
      if (slots.status === "fulfilled") setTodaySlots(slots.value)
      if (customers.status === "fulfilled") {
        setLowTrustCustomers(customers.value.filter(c => c.trustScore < 60).slice(0, 5))
      }
    } catch (err) {
      console.warn("fetchSidePanelData failed", err)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    fetchSidePanelData()
  }, [])

  // Auto-refresh mỗi 60 giây
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings()
    }, 60_000)
    return () => clearInterval(interval)
  }, [fetchBookings])

  const pending = bookings.filter(b => ["PENDING_CONFIRMATION", "CONFIRMED"].includes(b.status))
  const inProgress = bookings.filter(b => b.status === "IN_PROGRESS" || b.status === "VEHICLE_INSPECTED" || b.status === "CHECKED_IN")
  const completed = bookings.filter(b => b.status === "COMPLETED" || b.status === "PAID" || b.status === "CLOSED")

  let filteredBookings = bookings
  if (statusFilter !== "ALL") {
    if (statusFilter === "PENDING") {
      filteredBookings = filteredBookings.filter(b => ["PENDING_CONFIRMATION", "CONFIRMED"].includes(b.status))
    } else if (statusFilter === "IN_PROGRESS") {
      filteredBookings = filteredBookings.filter(b => b.status === "IN_PROGRESS" || b.status === "VEHICLE_INSPECTED" || b.status === "CHECKED_IN")
    } else if (statusFilter === "COMPLETED") {
      filteredBookings = filteredBookings.filter(b => b.status === "COMPLETED" || b.status === "PAID" || b.status === "CLOSED")
    }
  }

  if (typeFilter !== "ALL") {
    filteredBookings = filteredBookings.filter(b => b.booking_type === typeFilter)
  }

  const bayStatusColor: Record<string, string> = {
    available: "border-success/30 bg-success/10 text-success hover:border-success/50",
    occupied: "border-primary/30 bg-primary/10 text-primary hover:border-primary/50",
    maintenance: "border-rose-300/30 bg-rose-50 text-rose-600 hover:border-rose-300/50",
  }

  const handleConfirm = async (bookingId: string) => {
    try {
      await confirmBooking(bookingId)
      toast.success("Xác nhận lịch hẹn thành công")
      fetchBookings()
    } catch (error) {
      toast.error("Lỗi khi xác nhận lịch hẹn")
      fetchBookings() // Mock update
    }
  }

  // Xây dựng bay status từ IN_PROGRESS bookings (dùng activeBays từ slot data hôm nay)
  const activeBaysCount = todaySlots.length > 0 ? (todaySlots[0].active_bays ?? 3) : 3
  const bayList = Array.from({ length: activeBaysCount }, (_, i) => ({ id: `bay-${i+1}`, name: `Cầu ${i+1}` }))

  // Map booking đang có bay_id
  const occupiedBays = new Set<string>()
  const bayBookingMap: Record<string, string> = {}
  bookings.filter(b => ["IN_PROGRESS", "VEHICLE_INSPECTED", "CHECKED_IN", "CUSTOMER_CONFIRMED_CONDITION"].includes(b.status))
    .forEach(b => {
      const bayId = (b as any).bay_id
      if (bayId) {
        occupiedBays.add(bayId)
        bayBookingMap[bayId] = b.license_plate || ""
      }
    })

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
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
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="IN_PROGRESS">Đang xử lý</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-muted-foreground mb-2">Loại dịch vụ</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <option value="ALL">Tất cả loại</option>
                <option value="WASH">WASH (Cần cầu nâng)</option>
                <option value="FLEX">FLEX (Làm ngoài)</option>
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
            <p className="text-3xl font-mono font-bold text-foreground">
              {loading ? <Loader2 className="size-6 animate-spin" /> : bookings.length}
            </p>
          </div>

          {/* Pending */}
          <div className="col-span-3 rounded-2xl border border-gold/30 bg-gold/5 p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100/80 to-amber-50 dark:from-amber-900/30 dark:to-amber-950/20 text-amber-600 dark:text-amber-400">
                <Clock className="size-5" />
              </div>
              <p className="text-sm font-semibold text-gold">Chờ xử lý</p>
            </div>
            <p className="text-3xl font-mono font-bold text-gold">
              {loading ? <Loader2 className="size-6 animate-spin" /> : pending.length}
            </p>
          </div>

          {/* In Progress */}
          <div className="col-span-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
                <Wrench className="size-5" />
              </div>
              <p className="text-sm font-semibold text-primary">Đang thực hiện</p>
            </div>
            <p className="text-3xl font-mono font-bold text-primary">
              {loading ? <Loader2 className="size-6 animate-spin" /> : inProgress.length}
            </p>
          </div>

          {/* Completed */}
          <div className="col-span-3 rounded-2xl border border-success/30 bg-success/5 p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100/80 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-950/20 text-success">
                <CheckCircle2 className="size-5" />
              </div>
              <p className="text-sm font-semibold text-success">Hoàn thành</p>
            </div>
            <p className="text-3xl font-mono font-bold text-success">
              {loading ? <Loader2 className="size-6 animate-spin" /> : completed.length}
            </p>
          </div>

          {/* ── 3. Bookings Table - LARGE MAIN ── */}
          <div className="col-span-8 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
                  <h2 className="text-base font-bold text-foreground">Lịch hẹn {selectedDate}</h2>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto min-h-[300px]">
              {loading ? (
                <div className="flex h-[300px] items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  Không có lịch hẹn nào
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                      <th className="px-4 py-3 text-left font-semibold">Mã</th>
                      <th className="px-4 py-3 text-left font-semibold">Khách hàng</th>
                      <th className="px-4 py-3 text-left font-semibold">Dịch vụ</th>
                      <th className="px-4 py-3 text-left font-semibold">Giờ hẹn</th>
                      <th className="px-4 py-3 text-left font-semibold">Nhân viên</th>
                      <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                      <th className="px-4 py-3 text-left font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredBookings.map(b => (
                      <tr key={b.booking_id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          <Link href={`/manager/booking/${b.booking_id}`} className="hover:text-primary hover:underline">
                            {b.booking_id.split('-')[0] || b.booking_id}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          <div className="flex flex-col">
                            <span>{b.customer_name || "Khách hàng"}</span>
                            <span className="font-mono text-xs text-muted-foreground">{b.license_plate}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{b.services_summary}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-foreground">{b.slot_start_time}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{b.assigned_washer || "-"}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-4 py-3">
                         <div className="flex gap-1 flex-wrap">
                            <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                              <Link href={`/manager/booking/${b.booking_id}`}>Chi tiết</Link>
                            </Button>
                            {b.status === "PENDING_CONFIRMATION" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => handleConfirm(b.booking_id)}
                              >
                                Xác nhận
                              </Button>
                            )}
                            {(b.status === "CONFIRMED" || b.status === "ASSIGNED") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/5"
                                onClick={() => {
                                  setIsReassign(b.status === "ASSIGNED")
                                  setAssignModalBookingId(b.booking_id)
                                }}
                              >
                                {b.status === "ASSIGNED" ? "Gán lại" : "Gán NV"}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── Right Column (Stacked) ── */}
          <div className="col-span-4 space-y-6">
          {/* ── 4. Bay Status — từ slot API ── */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
                <h2 className="text-base font-bold text-foreground">Tình trạng cầu nâng</h2>
                <span className="text-xs text-muted-foreground ml-auto">{activeBaysCount} cầu hôm nay</span>
              </div>
              {todaySlots.length === 0 ? (
                <p className="text-xs text-muted-foreground">Chưa có cấu hình slot cho hôm nay</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {bayList.map(bay => {
                    const isOccupied = occupiedBays.has(bay.id)
                    return (
                      <div key={bay.id}
                        className={`rounded-xl border-2 p-3 transition-all ${
                          isOccupied
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-emerald-300/30 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
                        }`}>
                        <p className="font-semibold text-sm">{bay.name}</p>
                        <p className="text-xs mt-1">{isOccupied ? (bayBookingMap[bay.id] || "Đang sử dụng") : "Trống"}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── 5. Low Trust Score — từ customer API ── */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 space-y-4 dark:border-rose-900/40 dark:bg-rose-950/20">
              <div className="flex items-center gap-2">
                <span className="inline-block h-4 w-0.5 rounded-full bg-rose-500" />
                <AlertCircle className="size-4 text-rose-600 dark:text-rose-400" />
                <h2 className="text-base font-bold text-rose-900 dark:text-rose-200">Điểm uy tín thấp</h2>
              </div>
              {lowTrustCustomers.length === 0 ? (
                <p className="text-xs text-muted-foreground">Không có khách hàng uy tín thấp 🎉</p>
              ) : (
                <div className="space-y-2">
                  {lowTrustCustomers.map(cust => (
                    <Link key={cust.customerId} href={`/manager/khach-hang/${cust.customerId}`}>
                      <div className="flex items-center justify-between text-xs border-b border-rose-200 dark:border-rose-900/40 pb-2 last:border-0 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 rounded px-1 cursor-pointer">
                        <div>
                          <p className="font-medium text-foreground">{cust.fullName}</p>
                          <p className="text-muted-foreground">{cust.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-rose-600 dark:text-rose-400">{cust.trustScore}</p>
                          <p className="text-muted-foreground">/100</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Washer Modal */}
      {assignModalBookingId && (
        <AssignWasherModal
          bookingId={assignModalBookingId}
          isReassign={isReassign}
          onAssign={() => {
            setAssignModalBookingId(null)
            fetchBookings()
          }}
          onClose={() => setAssignModalBookingId(null)}
        />
      )}

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
