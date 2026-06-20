"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Award,
  Ban,
  CheckCircle,
  AlertCircle,
  Coins,
  Lock,
  Unlock,
  User,
  Phone,
  Mail,
  Calendar,
  Loader2,
  Plus,
  Minus
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TierBadge } from "@/components/shared/tier-badge"
import { adjustManagerTrustScore, adjustManagerLoyalty, unblockManagerCustomer } from "@/lib/api/customers"
import { getManagerBookings } from "@/lib/api"
import { formatVND, formatDate } from "@/lib/data"
import type { BookingSummary } from "@/lib/types"

// Minimal CustomerProfile using data from list
interface CustomerProfile {
  user_id: string
  customerId: string
  full_name: string
  email: string
  phone: string
  membership_tier: string
  total_points: number
  trust_score: number
  loyalty_points: number
  status: string
  total_spending_12m: number
  tier_review_at: string
  booking_window_days: number
}

const getTrustScoreColor = (score: number) => {
  if (score >= 80) return { bg: "bg-emerald-500/10", text: "text-emerald-500 border-emerald-500/30", bar: "bg-emerald-500" }
  if (score >= 60) return { bg: "bg-blue-500/10", text: "text-blue-500 border-blue-500/30", bar: "bg-blue-500" }
  if (score >= 50) return { bg: "bg-amber-500/10", text: "text-amber-500 border-amber-500/30", bar: "bg-amber-500" }
  return { bg: "bg-rose-500/10", text: "text-rose-500 border-rose-500/30", bar: "bg-rose-500" }
}

const getTrustScoreLabel = (score: number) => {
  if (score >= 80) return "Xuất sắc (Rất ít rủi ro)"
  if (score >= 60) return "Tốt"
  if (score >= 50) return "Bình thường"
  return "Nguy cơ cao (Hay bùng lịch / Đang bị khóa)"
}

export default function CustomerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  // State
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [apiMessage, setApiMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [bookings, setBookings] = useState<BookingSummary[]>([])

  // Modal States
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false)
  const [trustScoreChange, setTrustScoreChange] = useState<number>(10)
  const [trustReason, setTrustReason] = useState("")

  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false)
  const [loyaltyPointsChange, setLoyaltyPointsChange] = useState<number>(100)
  const [loyaltyReason, setLoyaltyReason] = useState("")

  // Fetch customer profile — BE không có GET /manager/customers/{id}
  // Dùng state được truyền qua URL search params hoặc load lại từ list
  const fetchProfileData = async () => {
    try {
      setLoading(true)
      // Lấy data từ query params nếu có (truyền từ list page)
      const params = new URLSearchParams(window.location.search)
      const name        = params.get("name") || "Khách hàng"
      const phone       = params.get("phone") || ""
      const email       = params.get("email") || ""
      const tier        = params.get("tier") || "MEMBER"
      const trust       = parseInt(params.get("trust") || "80")
      const loyalty     = parseInt(params.get("loyalty") || "0")
      const status      = params.get("status") || "ACTIVE"

      const p: CustomerProfile = {
        user_id: customerId,
        customerId: customerId,
        full_name: name,
        email,
        phone,
        membership_tier: tier,
        total_points: loyalty,
        trust_score: trust,
        loyalty_points: loyalty,
        status,
        total_spending_12m: 0,
        tier_review_at: new Date().toISOString(),
        booking_window_days: 7
      }
      setProfile(p)
    } finally {
      setLoading(false)
    }
  }

  // Fetch recent bookings — filter by customer name (BE chưa có endpoint theo customerId)
  const fetchRecentBookings = async () => {
    try {
      const res = await getManagerBookings({ limit: 100 })
      if (res && res.data) {
        const arr: BookingSummary[] = Array.isArray(res.data) ? res.data : []
        if (profile) {
          setBookings(arr.filter(b => b.customer_name?.toLowerCase() === profile.full_name.toLowerCase()))
        }
      }
    } catch (err) {
      console.error("Failed to load customer bookings", err)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [customerId])

  useEffect(() => {
    if (profile) {
      fetchRecentBookings()
    }
  }, [profile])

  // Adjust Trust Score
  const handleAdjustTrust = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trustReason.trim()) return

    try {
      setSubmitting(true)
      await adjustManagerTrustScore(customerId, trustScoreChange, trustReason)
      setApiMessage({ type: "success", text: "Đã cập nhật điểm tín nhiệm thành công!" })
      setIsTrustModalOpen(false)
      setTrustReason("")
      // Cập nhật local state
      if (profile) setProfile({ ...profile, trust_score: Math.min(100, Math.max(0, profile.trust_score + trustScoreChange)) })
    } catch (err: any) {
      console.error(err)
      setApiMessage({ type: "error", text: err?.response?.data?.message || "Lỗi khi cập nhật Trust Score." })
    } finally {
      setSubmitting(false)
    }
  }

  // Adjust Loyalty Points
  const handleAdjustLoyalty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loyaltyReason.trim()) return

    try {
      setSubmitting(true)
      await adjustManagerLoyalty(customerId, loyaltyPointsChange, loyaltyReason)
      setApiMessage({ type: "success", text: "Đã điều chỉnh điểm loyalty thành công!" })
      setIsLoyaltyModalOpen(false)
      setLoyaltyReason("")
      if (profile) setProfile({ ...profile, total_points: Math.max(0, profile.total_points + loyaltyPointsChange) })
    } catch (err: any) {
      console.error(err)
      setApiMessage({ type: "error", text: err?.response?.data?.message || "Lỗi khi điều chỉnh loyalty." })
    } finally {
      setSubmitting(false)
    }
  }

  // Unblock Customer
  const handleUnblock = async () => {
    if (!window.confirm("Bạn có chắc muốn mở khóa tài khoản này không?")) return

    try {
      setSubmitting(true)
      await unblockManagerCustomer(customerId)
      setApiMessage({ type: "success", text: "Đã mở khóa tài khoản thành công!" })
      if (profile) setProfile({ ...profile, trust_score: 60, status: "ACTIVE" })
    } catch (err: any) {
      console.error(err)
      setApiMessage({ type: "error", text: err?.response?.data?.message || "Lỗi khi mở khóa tài khoản." })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="size-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Đang tải hồ sơ khách hàng...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <AlertCircle className="size-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Không tìm thấy khách hàng</h2>
          <Link href="/manager/khach-hang">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isBlocked = profile.trust_score < 50
  const colors = getTrustScoreColor(profile.trust_score)
  const scoreLabel = getTrustScoreLabel(profile.trust_score)

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/manager/khach-hang">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hồ sơ khách hàng</h1>
              <p className="text-sm text-muted-foreground">{profile.full_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isBlocked && (
              <Button
                onClick={handleUnblock}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Unlock className="size-4" />
                {submitting ? "Đang xử lý..." : "Mở khóa tài khoản"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Banner blocked */}
        {isBlocked && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 flex items-center gap-3 text-rose-500">
            <Lock className="size-5 shrink-0" />
            <div className="text-sm font-semibold">
              Tài khoản này hiện đang bị khóa do điểm tín nhiệm quá thấp (dưới 50). Khách hàng không thể đặt lịch online.
            </div>
          </div>
        )}

        {/* API Alerts */}
        {apiMessage && (
          <div
            className={`rounded-2xl border p-4 flex items-center justify-between ${
              apiMessage.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                : "border-rose-500/20 bg-rose-500/10 text-rose-600"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              {apiMessage.type === "success" ? <CheckCircle className="size-5" /> : <AlertCircle className="size-5" />}
              {apiMessage.text}
            </div>
            <button onClick={() => setApiMessage(null)} className="text-xs underline hover:opacity-80">
              Đóng
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Personal Profile */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {profile.full_name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">{profile.full_name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <TierBadge tier={profile.membership_tier as any} />
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 pt-4 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Số điện thoại</p>
                    <p className="font-mono font-semibold text-foreground">{profile.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Mail className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Hạn xem xét thứ hạng</p>
                    <p className="text-foreground">{formatDate(profile.tier_review_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Trust Score */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tín nhiệm (Trust Score)</h3>
                <span className={`inline-flex rounded px-2 py-0.5 text-xs font-bold border ${colors.text}`}>
                  {profile.trust_score} / 100
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-4xl font-extrabold text-foreground">{profile.trust_score}</div>
                  <p className="text-xs text-muted-foreground mt-1">{scoreLabel}</p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${colors.bar}`}
                    style={{ width: `${profile.trust_score}%` }}
                  />
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  * Điểm tín nhiệm dùng để theo dõi hành vi đặt lịch. Điểm dưới 50 sẽ tự động khóa tài khoản để chống phá hoại.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsTrustModalOpen(true)}
              className="mt-6 w-full border-primary/30 text-primary hover:bg-primary/5 hover:border-primary"
            >
              Điều chỉnh Trust Score
            </Button>
          </div>

          {/* Card 3: Loyalty & Spend */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Điểm thưởng & Chi tiêu</h3>
                <Coins className="size-4 text-amber-500" />
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Điểm tích lũy hiện tại</p>
                  <p className="text-3xl font-extrabold text-amber-500 mt-1">
                    {profile.total_points.toLocaleString()} <span className="text-sm font-semibold text-muted-foreground">points</span>
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Tổng chi tiêu 12 tháng qua</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">
                    {formatVND(profile.total_spending_12m || 0)}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsLoyaltyModalOpen(true)}
              className="mt-6 w-full border-amber-500/30 text-amber-600 hover:bg-amber-500/5 hover:border-amber-500"
            >
              Điều chỉnh Loyalty Points
            </Button>
          </div>
        </div>

        {/* Recent Bookings History */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">
            Lịch sử booking của khách ({bookings.length} lần)
          </h3>

          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left font-semibold">Mã đặt lịch</th>
                    <th className="px-4 py-3 text-left font-semibold">Dịch vụ chính</th>
                    <th className="px-4 py-3 text-left font-semibold">Cỡ xe</th>
                    <th className="px-4 py-3 text-left font-semibold">Biển số xe</th>
                    <th className="px-4 py-3 text-left font-semibold">Thời gian slot</th>
                    <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((booking) => (
                    <tr key={booking.booking_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/manager/booking/${booking.booking_id}`}>
                          <span className="font-mono text-xs font-bold text-primary hover:underline cursor-pointer">
                            {booking.booking_id.slice(-6).toUpperCase()}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {booking.services_summary}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs font-bold">
                        {booking.vehicle_size}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold">
                        {booking.license_plate}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(booking.slot_start_time.split("T")[0])}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold border bg-muted text-muted-foreground`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Chưa có lịch sử đặt lịch nào cho khách hàng này.
            </div>
          )}
        </div>
      </div>

      {/* Trust Score Modal */}
      {isTrustModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">Điều chỉnh Trust Score</h3>
            <p className="text-xs text-muted-foreground">
              Tác động trực tiếp đến khả năng đặt lịch online của khách hàng. Hãy ghi rõ lý do.
            </p>

            <form onSubmit={handleAdjustTrust} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Thay đổi điểm số (Khoảng -100 đến +100)
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTrustScoreChange(prev => Math.max(-100, prev - 5))}
                    className="size-10 rounded-xl"
                  >
                    -5
                  </Button>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    required
                    value={trustScoreChange}
                    onChange={(e) => setTrustScoreChange(parseInt(e.target.value) || 0)}
                    className="flex-1 bg-input border border-border text-center rounded-xl h-10 font-bold text-foreground"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTrustScoreChange(prev => Math.min(100, prev + 5))}
                    className="size-10 rounded-xl"
                  >
                    +5
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="trust-reason" className="text-xs font-semibold text-muted-foreground block">
                  Lý do điều chỉnh
                </label>
                <textarea
                  id="trust-reason"
                  required
                  rows={3}
                  placeholder="Ví dụ: Khách vắng mặt không lý do (-40), Khách hợp tác kiểm tra xe kỹ (+10)..."
                  value={trustReason}
                  onChange={(e) => setTrustReason(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none text-foreground"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsTrustModalOpen(false)
                    setTrustReason("")
                  }}
                  className="flex-1"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !trustReason.trim()}
                  className="flex-1 bg-primary text-white"
                >
                  {submitting ? "Đang lưu..." : "Xác nhận"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loyalty Points Modal */}
      {isLoyaltyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">Điều chỉnh Loyalty Points</h3>
            <p className="text-xs text-muted-foreground">
              Thưởng hoặc trừ điểm của khách hàng (ví dụ: bồi thường khiếu nại, sự kiện đặc biệt).
            </p>

            <form onSubmit={handleAdjustLoyalty} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Thay đổi điểm số (vd: -500, +1000)
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLoyaltyPointsChange(prev => prev - 50)}
                    className="size-10 rounded-xl"
                  >
                    -50
                  </Button>
                  <input
                    type="number"
                    required
                    value={loyaltyPointsChange}
                    onChange={(e) => setLoyaltyPointsChange(parseInt(e.target.value) || 0)}
                    className="flex-1 bg-input border border-border text-center rounded-xl h-10 font-bold text-foreground"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLoyaltyPointsChange(prev => prev + 50)}
                    className="size-10 rounded-xl"
                  >
                    +50
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="loyalty-reason" className="text-xs font-semibold text-muted-foreground block">
                  Lý do điều chỉnh
                </label>
                <textarea
                  id="loyalty-reason"
                  required
                  rows={3}
                  placeholder="Ví dụ: Bồi thường sự cố xước xe (+1000 điểm), Quà tặng sinh nhật thành viên (+500)..."
                  value={loyaltyReason}
                  onChange={(e) => setLoyaltyReason(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none text-foreground"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsLoyaltyModalOpen(false)
                    setLoyaltyReason("")
                  }}
                  className="flex-1"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !loyaltyReason.trim()}
                  className="flex-1 bg-amber-500 text-white hover:bg-amber-600"
                >
                  {submitting ? "Đang lưu..." : "Xác nhận"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
