"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Users, Search, Loader2, ShieldAlert, Award, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TierBadge } from "@/components/shared/tier-badge"
import { getManagerCustomers } from "@/lib/api/customers"
import type { ManagerCustomer } from "@/lib/api/customers"
import type { MemberTier } from "@/lib/types"

const getTrustScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  if (score >= 60) return "text-blue-500 bg-blue-500/10 border-blue-500/20"
  if (score >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20"
  return "text-rose-500 bg-rose-500/10 border-rose-500/20 font-bold"
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":   return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
    case "BANNED":   return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
    case "SHADOW":   return "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400"
    default:         return "bg-muted text-muted-foreground"
  }
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Hoạt động",
  BANNED: "Đã khóa",
  SHADOW: "Vãng lai",
  INACTIVE: "Ngừng HĐ",
}

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<ManagerCustomer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getManagerCustomers()
      setCustomers(data)
    } catch (err: any) {
      console.error("Failed to load customers:", err)
      setError("Không thể tải danh sách khách hàng. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCustomers() }, [])

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return customers
    return customers.filter(c =>
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    )
  }, [customers, searchQuery])

  // Stats
  const totalCustomers = customers.length
  const lowTrustCount  = customers.filter(c => c.trustScore < 50).length
  const vipCount       = customers.filter(c => ["GOLD", "PLATINUM"].includes(c.membershipTier)).length
  const shadowCount    = customers.filter(c => c.status === "SHADOW").length

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="size-8 text-primary" />
              Danh sách khách hàng
            </h1>
            <p className="text-sm text-muted-foreground">Quản lý và theo dõi tất cả khách hàng trong hệ thống</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={loadCustomers} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Tổng khách hàng",   value: totalCustomers, icon: <Users className="size-5 text-primary" />,         color: "text-primary" },
            { label: "Nguy cơ cao",        value: lowTrustCount,  icon: <ShieldAlert className="size-5 text-rose-500" />,  color: "text-rose-500" },
            { label: "VIP (Gold/Plat.)",   value: vipCount,       icon: <Award className="size-5 text-amber-500" />,       color: "text-amber-500" },
            { label: "Khách vãng lai",     value: shadowCount,    icon: <Users className="size-5 text-violet-500" />,      color: "text-violet-500" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0">{icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <AlertTriangle className="size-10 text-amber-500" />
              <p className="font-semibold text-foreground">{error}</p>
              <Button variant="outline" onClick={loadCustomers} className="gap-2">
                <RefreshCw className="size-4" /> Thử lại
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {searchQuery ? "Không tìm thấy khách hàng phù hợp." : "Chưa có dữ liệu khách hàng."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                    <th className="px-5 py-3 text-left font-semibold">Khách hàng</th>
                    <th className="px-4 py-3 text-left font-semibold">Số điện thoại</th>
                    <th className="px-4 py-3 text-left font-semibold">Hạng thành viên</th>
                    <th className="px-4 py-3 text-left font-semibold">Trust Score</th>
                    <th className="px-4 py-3 text-left font-semibold">Điểm thưởng</th>
                    <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((c) => (
                    <tr key={c.customerId}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {c.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{c.fullName}</p>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm text-foreground">{c.phone}</span>
                      </td>
                      <td className="px-4 py-4">
                        <TierBadge tier={c.membershipTier as MemberTier} />
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getTrustScoreColor(c.trustScore)}`}>
                          {c.trustScore}/100
                          {c.trustScore < 50 && <AlertTriangle className="size-3 ml-1" />}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-amber-600 font-semibold text-sm">{c.loyaltyPoints.toLocaleString()} pts</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(c.status)}`}>
                          {STATUS_LABEL[c.status] || c.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/manager/khach-hang/${c.customerId}?name=${encodeURIComponent(c.fullName)}&phone=${encodeURIComponent(c.phone)}&email=${encodeURIComponent(c.email)}&tier=${c.membershipTier}&trust=${c.trustScore}&loyalty=${c.loyaltyPoints}&status=${c.status}`}>
                          <Button size="sm" variant="outline"
                            className="text-xs opacity-0 group-hover:opacity-100 transition-opacity h-8">
                            Xem hồ sơ →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loading && !error && (
          <p className="text-xs text-muted-foreground text-right">
            Hiển thị {filtered.length}/{totalCustomers} khách hàng
          </p>
        )}
      </div>
    </div>
  )
}
