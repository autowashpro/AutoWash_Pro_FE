"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Search, ChevronRight, Loader2, ShieldAlert, Award, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TierBadge } from "@/components/shared/tier-badge"
import { getManagerBookings } from "@/lib/api"
import { USERS, CUSTOMERS_LOW_TRUST } from "@/lib/data"
import type { MemberTier, BookingSummary } from "@/lib/types"

interface CustomerListItem {
  customerId: string
  name: string
  phone: string
  email: string
  trustScore: number
  membershipTier: MemberTier
  status: "ACTIVE" | "BANNED" | "SUSPENDED"
  totalBookings: number
}

const getTrustScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  if (score >= 60) return "text-blue-500 bg-blue-500/10 border-blue-500/20"
  if (score >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20"
  return "text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse font-bold"
}

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<CustomerListItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true)
        const bookingsRes = await getManagerBookings({ limit: 100 })
        const customerMap = new Map<string, CustomerListItem>()

        // 1. Add mock users from lib/data.ts
        const PHONE_MAP: Record<string, string> = {
          "u-1": "0901234567",
          "u-2": "0912345678",
          "u-3": "0923456789",
        }
        const BOOKINGS_MAP: Record<string, number> = {
          "u-1": 12,
          "u-2": 8,
          "u-3": 5,
        }
        USERS.filter(u => u.role === "customer").forEach(u => {
          customerMap.set(u.id, {
            customerId: u.id,
            name: u.name,
            phone: PHONE_MAP[u.id] || u.email?.split("@")[0] || "0900000000",
            email: u.email,
            trustScore: u.id === "u-1" ? 85 : u.id === "u-2" ? 95 : 68,
            membershipTier: (u.tier || "MEMBER") as MemberTier,
            status: u.active ? "ACTIVE" : "BANNED",
            totalBookings: BOOKINGS_MAP[u.id] ?? 3
          })
        })

        // 2. Add low-trust customers
        CUSTOMERS_LOW_TRUST.forEach((c, idx) => {
          customerMap.set(c.id, {
            customerId: c.id,
            name: c.name,
            phone: c.phone.replace("***", "456"),
            email: c.name.toLowerCase().replace(/ /g, "") + "@gmail.com",
            trustScore: c.trustScore,
            membershipTier: "MEMBER",
            status: c.trustScore < 50 ? "BANNED" : "ACTIVE",
            totalBookings: idx + 1  // stable, không dùng random
          })
        })

        // 3. Extract customers from actual bookings fetched from the API
        if (bookingsRes && bookingsRes.data) {
          const bookingsData = bookingsRes.data
          const bookingsArray: BookingSummary[] = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.items || []
          bookingsArray.forEach((booking: BookingSummary) => {
            if (booking.customer_name) {
              const name = booking.customer_name
              const phone = booking.phone || "0901234567"
              // create a simple key using name & phone
              const key = name.toLowerCase().replace(/ /g, "-")
              const existing = customerMap.get(key)
              
              customerMap.set(key, {
                customerId: key,
                name: name,
                phone: phone,
                email: name.toLowerCase().replace(/ /g, "") + "@gmail.com",
                trustScore: booking.trust_score || (existing ? existing.trustScore : 80),
                membershipTier: "MEMBER",
                status: (booking.trust_score && booking.trust_score < 50) ? "BANNED" : "ACTIVE",
                totalBookings: existing ? existing.totalBookings + 1 : 1
              })
            }
          })
        }

        setCustomers(Array.from(customerMap.values()))
      } catch (err) {
        console.error("Failed to load customer list. Using fallbacks.", err)
        // Fallback to basic list from USERS
        const fallbackList: CustomerListItem[] = USERS.filter(u => u.role === "customer").map(u => ({
          customerId: u.id,
          name: u.name,
          phone: "0987654321",
          email: u.email,
          trustScore: u.id === "u-1" ? 85 : u.id === "u-2" ? 95 : 68,
          membershipTier: (u.tier || "MEMBER") as MemberTier,
          status: u.active ? "ACTIVE" : "BANNED",
          totalBookings: 8
        }))
        setCustomers(fallbackList)
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [])

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  )

  const totalCustomers = customers.length
  const lowTrustCount = customers.filter(c => c.trustScore < 50).length
  const vipCount = customers.filter(c => c.membershipTier === "GOLD" || c.membershipTier === "PLATINUM").length

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="size-8 text-primary" />
            Danh sách khách hàng
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý hồ sơ, cấp bậc thành viên và điểm tín nhiệm (Trust Score)
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Tổng số khách</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">{loading ? "..." : totalCustomers}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Users className="size-6" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Khách hàng VIP</p>
              <p className="text-3xl font-extrabold text-amber-500 mt-1">{loading ? "..." : vipCount}</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Award className="size-6" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Cảnh báo Trust Score thấp</p>
              <p className="text-3xl font-extrabold text-rose-500 mt-1">{loading ? "..." : lowTrustCount}</p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
              <ShieldAlert className="size-6" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 max-w-md bg-card border border-border rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary shadow-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng bằng tên hoặc SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-0 text-sm focus:outline-none focus:ring-0 w-full"
          />
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang tải danh sách khách hàng...</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                    <th className="px-6 py-4 text-left font-semibold">Khách hàng</th>
                    <th className="px-6 py-4 text-left font-semibold">Số điện thoại</th>
                    <th className="px-6 py-4 text-left font-semibold">Hạng thành viên</th>
                    <th className="px-6 py-4 text-left font-semibold">Điểm tín nhiệm (Trust Score)</th>
                    <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-left font-semibold">Số Booking</th>
                    <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.customerId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-foreground">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4">
                        <TierBadge tier={customer.membershipTier} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold border ${getTrustScoreColor(customer.trustScore)}`}>
                          {customer.trustScore} / 100
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {customer.status === "BANNED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                            <Ban className="size-3" />
                            Đã khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            Hoạt động
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-semibold">
                        {customer.totalBookings}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/manager/khach-hang/${customer.customerId}`}>
                          <Button size="sm" variant="outline" className="gap-1 hover:border-primary hover:text-primary">
                            <span>Hồ sơ</span>
                            <ChevronRight className="size-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && filteredCustomers.length === 0 && (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card">
            <Users className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Không tìm thấy khách hàng nào khớp với từ khóa tìm kiếm.</p>
          </div>
        )}
      </div>
    </div>
  )
}
