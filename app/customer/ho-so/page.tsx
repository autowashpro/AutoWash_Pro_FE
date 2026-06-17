"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { User, Calendar, CreditCard, Award, Shield, ArrowRight, Loader2, Sparkles, Car, CalendarRange, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMyProfile, updateProfile } from "@/lib/api"
import type { CustomerProfile } from "@/lib/types"
import { TIER_LABELS } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { TrustScoreDisplay } from "@/components/shared/trust-score-display"
import { TierBadge } from "@/components/status-badge"
import { formatVND } from "@/lib/data"

export default function ProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [fullName, setFullName] = useState("")
  const [birthMonth, setBirthMonth] = useState<string>("1")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadProfile() {
      // TODO: connect API
      try {
        const data = await getMyProfile()
        setProfile(data)
        setFullName(data.full_name)
        // If there's birth_month in response, we use it, otherwise default to "1"
        if (data.birth_month) {
          setBirthMonth(String(data.birth_month))
        }
      } catch (error) {
        console.warn("Failed to load customer profile, using mock fallback:", error)
        const fallback = {
          user_id: "u-1",
          full_name: "Nguyễn Minh Anh",
          email: "minhanh@email.com",
          phone: "0987654321",
          membership_tier: "GOLD" as any,
          total_points: 412,
          trust_score: 95,
          total_spending_12m: 12500000,
          tier_review_at: "2026-12-31",
          booking_window_days: 7
        }
        setProfile(fallback)
        setFullName(fallback.full_name)
        setBirthMonth("8")
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const updated = await updateProfile({
        full_name: fullName,
        birth_month: parseInt(birthMonth, 10),
      })
      setProfile(updated)
      setFullName(updated.full_name)
      if (updated.birth_month) {
        setBirthMonth(String(updated.birth_month))
      }
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin hồ sơ thành công.",
      })
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải hồ sơ của bạn...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-24">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Hồ sơ cá nhân</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin tài khoản và xem các chỉ số uy tín thành viên của bạn.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form update */}
        <div className="rounded-2xl border border-border bg-card p-6 md:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="size-5 text-primary" />
            Thông tin cơ bản
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Họ và tên
              </label>
              <Input
                type="text"
                placeholder="Nhập họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tháng sinh (để nhận quà sinh nhật)
                </label>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 opacity-60">
                  Số điện thoại (Cố định)
                </label>
                <Input
                  type="text"
                  value={profile?.phone || ""}
                  disabled
                  className="bg-muted opacity-80 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 opacity-60">
                Địa chỉ email (Cố định)
              </label>
              <Input
                type="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted opacity-80 cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                {isSaving && <Loader2 className="size-4 animate-spin mr-2" />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>

        {/* Stats membership */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Award className="size-5 text-primary" />
              Thẻ thành viên
            </h2>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hạng hiện tại:</span>
              <TierBadge tier={profile?.membership_tier || "MEMBER"} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Điểm tích lũy:</span>
              <span className="font-mono font-bold text-foreground text-lg">
                {profile?.total_points}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Độ uy tín:</span>
              <TrustScoreDisplay score={profile?.trust_score ?? 100} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Chi tiêu 12T:</span>
              <span className="font-mono font-semibold text-foreground">
                {formatVND(profile?.total_spending_12m || 0)}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-accent/30 p-4 border border-border space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
              <Sparkles className="size-3.5" />
              Quyền lợi hạng:
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tự động gia hạn hạng đặt lịch trước {profile?.booking_window_days} ngày. Đóng vai trò nâng mức uy tín của bạn khi rửa xe đúng hẹn.
            </p>
          </div>
        </div>
      </div>

      {/* Quick links bento panel */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Liên kết nhanh</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/customer/phuong-tien"
            className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Car className="size-5" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <div className="mt-4">
              <p className="font-semibold text-foreground">Quản lý xe của tôi</p>
              <p className="text-xs text-muted-foreground mt-1">Thêm, chỉnh sửa hoặc đặt xe mặc định.</p>
            </div>
          </Link>

          <Link
            href="/customer/lich-hen"
            className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarRange className="size-5" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <div className="mt-4">
              <p className="font-semibold text-foreground">Lịch hẹn dịch vụ</p>
              <p className="text-xs text-muted-foreground mt-1">Xem, xác nhận tình trạng xe hoặc hủy lịch.</p>
            </div>
          </Link>

          <Link
            href="/customer/diem-thuong"
            className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Gift className="size-5" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <div className="mt-4">
              <p className="font-semibold text-foreground">Điểm thưởng & Quà</p>
              <p className="text-xs text-muted-foreground mt-1">Đổi ưu đãi thành viên và xem lịch sử điểm.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
