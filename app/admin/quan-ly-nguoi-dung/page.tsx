"use client"

import { useState } from "react"
import Link from "next/link"
import { Lock, Unlock, RotateCcw, Plus, ChevronRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CUSTOMERS_LOW_TRUST, WASHERS, BOOKINGS, formatVND } from "@/lib/data"

type UserTab = "customers" | "washers" | "managers"
type LockStatus = "active" | "locked"

type CustomerUser = {
  id: string
  name: string
  phone: string
  trustScore: number
  lastBookingCode: string
  email?: string
  bookingCount?: number
  status?: LockStatus
  tier?: "BRONZE" | "SILVER" | "GOLD"
}

const getTrustScoreColor = (score: number) => {
  if (score >= 80) return "text-success bg-success/10 border-success/30"
  if (score >= 50) return "text-gold bg-gold/10 border-gold/30"
  return "text-rose-600 bg-rose-50 border-rose-200"
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case "GOLD":
      return "bg-gold/10 text-gold border-gold/30"
    case "SILVER":
      return "bg-slate-100 text-slate-700 border-slate-300"
    case "BRONZE":
      return "bg-amber-100/50 text-amber-700 border-amber-300"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

// Mock enhanced customer data with email, booking count, and status
const customersWithDetails: CustomerUser[] = CUSTOMERS_LOW_TRUST.map((c, i) => ({
  ...c,
  email: `customer${i + 1}@gmail.com`,
  bookingCount: Math.floor(Math.random() * 15) + 3,
  status: Math.random() > 0.7 ? "locked" : "active",
  tier: ["BRONZE", "SILVER", "GOLD"][Math.floor(Math.random() * 3)] as any,
}))

// Mock enhanced washer data
const washersWithDetails = WASHERS.map((w, i) => ({
  ...w,
  email: `washer${i + 1}@gmail.com`,
}))

export default function AdminUsersPage() {
  const [tab, setTab] = useState<UserTab>("customers")
  const [lockedUsers, setLockedUsers] = useState<Set<string>>(new Set())
  const [showResetModal, setShowResetModal] = useState<{ type: string; id: string } | null>(null)

  const toggleLockCustomer = (id: string) => {
    const newLocked = new Set(lockedUsers)
    if (newLocked.has(id)) {
      newLocked.delete(id)
    } else {
      newLocked.add(id)
    }
    setLockedUsers(newLocked)
  }

  const isUserLocked = (id: string) => lockedUsers.has(id)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="size-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Quản lý người dùng</h1>
            </div>
            <div className="flex gap-3">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="size-4" />
                Thêm nhân viên
              </Button>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="size-4" />
                Thêm Manager
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-border">
          {(["customers", "washers", "managers"] as const).map((tabName) => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
                tab === tabName
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {tabName === "customers"
                ? "Khách hàng"
                : tabName === "washers"
                  ? "Nhân viên rửa xe"
                  : "Manager"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Customers Tab */}
          {tab === "customers" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                    <th className="px-6 py-4 text-left font-semibold">Họ tên</th>
                    <th className="px-6 py-4 text-left font-semibold">Email</th>
                    <th className="px-6 py-4 text-left font-semibold">SĐT</th>
                    <th className="px-6 py-4 text-left font-semibold">Hạng</th>
                    <th className="px-6 py-4 text-left font-semibold">Trust Score</th>
                    <th className="px-6 py-4 text-left font-semibold">Số đặt lịch</th>
                    <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-left font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customersWithDetails.map((customer) => {
                    const isLocked = isUserLocked(customer.id)
                    const currentStatus = isLocked ? "locked" : customer.status

                    return (
                      <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{customer.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{customer.email}</td>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          {customer.phone}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${getTierColor(customer.tier || "BRONZE")}`}
                          >
                            {customer.tier || "BRONZE"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border font-mono ${getTrustScoreColor(customer.trustScore)}`}
                          >
                            {customer.trustScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {customer.bookingCount}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              currentStatus === "active"
                                ? "bg-success/10 text-success"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {currentStatus === "active" ? "Hoạt động" : "Đã khóa"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/khach-hang/${customer.id}`}>
                              <Button size="sm" variant="outline" className="gap-1">
                                Xem
                                <ChevronRight className="size-3" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleLockCustomer(customer.id)}
                              className="gap-1"
                            >
                              {isLocked ? (
                                <>
                                  <Unlock className="size-3" />
                                  Mở khóa
                                </>
                              ) : (
                                <>
                                  <Lock className="size-3" />
                                  Khóa
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowResetModal({ type: "customer", id: customer.id })}
                              className="gap-1"
                            >
                              <RotateCcw className="size-3" />
                              Reset
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Washers Tab */}
          {tab === "washers" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                    <th className="px-6 py-4 text-left font-semibold">Tên</th>
                    <th className="px-6 py-4 text-left font-semibold">Mã NV</th>
                    <th className="px-6 py-4 text-left font-semibold">Trạng thái ca</th>
                    <th className="px-6 py-4 text-left font-semibold">Task hôm nay</th>
                    <th className="px-6 py-4 text-left font-semibold">Đánh giá TB</th>
                    <th className="px-6 py-4 text-left font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {washersWithDetails.map((washer) => {
                    const isLocked = isUserLocked(washer.id)
                    const statusColor = washer.status === "offline" ? "bg-slate-100 text-slate-700" : "bg-primary/10 text-primary"

                    return (
                      <tr key={washer.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{washer.name}</td>
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-muted-foreground">
                          {washer.id.toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
                            {washer.status === "offline" ? "Nghỉ" : "Đang ca"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {washer.jobsToday}/5 hoàn thành
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-foreground">
                              {(washer.trustScore / 20).toFixed(1)}
                            </span>
                            <span>⭐</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/nhan-vien/${washer.id}`}>
                              <Button size="sm" variant="outline" className="gap-1">
                                Xem
                                <ChevronRight className="size-3" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleLockCustomer(washer.id)}
                              className="gap-1"
                            >
                              {isLocked ? (
                                <>
                                  <Unlock className="size-3" />
                                  Kích hoạt
                                </>
                              ) : (
                                <>
                                  <Lock className="size-3" />
                                  Vô hiệu
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Managers Tab */}
          {tab === "managers" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                    <th className="px-6 py-4 text-left font-semibold">Tên</th>
                    <th className="px-6 py-4 text-left font-semibold">Email</th>
                    <th className="px-6 py-4 text-left font-semibold">Quyền</th>
                    <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-left font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { id: "m-1", name: "Nguyễn Văn A", email: "manager1@company.com", role: "Full Access", status: "active" },
                    { id: "m-2", name: "Trần Thị B", email: "manager2@company.com", role: "Booking & Report", status: "active" },
                  ].map((manager) => {
                    const isLocked = isUserLocked(manager.id)

                    return (
                      <tr key={manager.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{manager.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{manager.email}</td>
                        <td className="px-6 py-4 text-foreground text-sm">{manager.role}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              isLocked
                                ? "bg-rose-50 text-rose-600"
                                : "bg-success/10 text-success"
                            }`}
                          >
                            {isLocked ? "Đã khóa" : "Hoạt động"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="gap-1">
                              Xem
                              <ChevronRight className="size-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleLockCustomer(manager.id)}
                              className="gap-1"
                            >
                              {isLocked ? (
                                <>
                                  <Unlock className="size-3" />
                                  Mở khóa
                                </>
                              ) : (
                                <>
                                  <Lock className="size-3" />
                                  Khóa
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reset Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4">
              <h2 className="text-lg font-bold text-foreground mb-4">Reset điểm uy tín</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Bạn có chắc muốn reset điểm uy tín cho khách hàng này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowResetModal(null)}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-rose-600 hover:bg-rose-700"
                  onClick={() => {
                    setShowResetModal(null)
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
