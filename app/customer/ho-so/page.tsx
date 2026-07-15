"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  User, 
  Calendar, 
  CreditCard, 
  Award, 
  Shield, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  Car, 
  CalendarRange, 
  Gift,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Info,
  HelpCircle,
  PhoneCall
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMyProfile, updateProfile } from "@/lib/api"
import type { CustomerProfile } from "@/lib/types"
import { TIER_LABELS } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { TrustScoreDisplay } from "@/components/shared/trust-score-display"
import { TierBadge } from "@/components/status-badge"
import { formatVND } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [fullName, setFullName] = useState("")
  const [birthMonth, setBirthMonth] = useState<string>("1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const isPhoneLocked = Boolean(profile?.phone && profile.phone.trim() !== "")

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMyProfile()
        setProfile(data)
        setFullName(data.full_name || "")
        setPhoneNumber(data.phone || "")
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
        setPhoneNumber(fallback.phone)
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
      const payload: any = {
        full_name: fullName.trim(),
        birth_month: parseInt(birthMonth, 10),
      }
      if (!isPhoneLocked && phoneNumber.trim() !== "") {
        payload.phone = phoneNumber.trim()
      }
      const updated = await updateProfile(payload)
      setProfile(updated)
      setFullName(updated.full_name || "")
      setPhoneNumber(updated.phone || "")
      if (updated.birth_month) {
        setBirthMonth(String(updated.birth_month))
      }
      toast({
        title: "Cập nhật thành công",
        description: "Hồ sơ cá nhân của bạn đã được đồng bộ an toàn.",
      })
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      const beMessage = error?.response?.data?.message || error?.response?.data?.error || "Đã có lỗi xảy ra khi cập nhật hồ sơ. Vui lòng kiểm tra lại thông tin hoặc thử lại sau."
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description: beMessage,
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-9 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground animate-pulse">Đang tải dữ liệu hồ sơ định danh...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-28 pt-2">
      {/* Header Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Hồ sơ khách hàng</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              <ShieldCheck className="size-3.5" />
              Định danh an toàn
            </span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Quản lý thông tin định danh, quyền lợi thành viên và chỉ số uy tín của bạn.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form thông tin cơ bản */}
        <div className="rounded-2xl border-2 border-slate-200/90 bg-card p-6 md:p-7 md:col-span-2 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <User className="size-5 stroke-[2.2]" />
              </div>
              <span>Thông tin cá nhân</span>
            </h2>
            <span className="text-xs font-semibold text-muted-foreground">
              ID: <span className="font-mono font-bold text-foreground">{profile?.user_id?.slice(0, 8) || "MEMBER"}</span>
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                Họ và tên thành viên <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="Nhập họ và tên đầy đủ..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11 rounded-xl font-semibold text-base border-slate-300 bg-slate-50/60 focus:bg-background transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">
                  Tháng sinh <span className="text-xs font-normal text-primary">(Nhận quà VIP)</span>
                </label>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-3.5 py-2 text-sm font-semibold text-foreground shadow-2xs transition-colors focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m} className="font-medium">
                      Tháng {m} {m === 7 ? "🎉" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* SỐ ĐIỆN THOẠI - THEO PHƯƠNG ÁN 1 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <span>Số điện thoại</span>
                    {isPhoneLocked && <Lock className="size-3.5 text-amber-600" />}
                  </label>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                    isPhoneLocked ? "bg-amber-100 text-amber-800" : "bg-primary/10 text-primary"
                  )}>
                    {isPhoneLocked ? "Cố định định danh" : "Cần bổ sung"}
                  </span>
                </div>
                <Input
                  type="text"
                  placeholder="Nhập số điện thoại..."
                  value={isPhoneLocked ? (profile?.phone || "") : phoneNumber}
                  onChange={(e) => !isPhoneLocked && setPhoneNumber(e.target.value)}
                  disabled={isPhoneLocked}
                  className={cn(
                    "h-11 rounded-xl font-mono text-base font-bold transition-colors",
                    isPhoneLocked 
                      ? "bg-slate-100/90 border-slate-200 text-slate-700 cursor-not-allowed select-all" 
                      : "border-slate-300 bg-slate-50/60 focus:bg-background"
                  )}
                />
              </div>
            </div>

            {/* CHÚ THÍCH PHƯƠNG ÁN 1 CHO KHÁCH HÀNG */}
            {isPhoneLocked && (
              <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-3.5 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Info className="size-4.5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs text-amber-900 leading-relaxed">
                    <p className="font-bold text-amber-950">
                      Vì sao không thể tự chỉnh sửa số điện thoại định danh?
                    </p>
                    <p>
                      Số điện thoại là thông tin định danh duy nhất bảo vệ hồ sơ, điểm thưởng <strong>Loyalty Points</strong> và chỉ số <strong>Trust Score</strong> của bạn trong hệ thống AutoWash Pro.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs font-semibold text-amber-800">
                  <span>Bạn muốn chuyển đổi số điện thoại mới?</span>
                  <Link
                    href="/gioi-thieu"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-bold"
                  >
                    <PhoneCall className="size-3" />
                    Liên hệ Hỗ trợ
                  </Link>
                </div>
              </div>
            )}

            {/* EMAIL ĐỊNH DANH */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-foreground">
                  Địa chỉ Email đăng nhập
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  Đã xác minh
                </span>
              </div>
              <Input
                type="email"
                value={profile?.email || ""}
                disabled
                className="h-11 rounded-xl font-mono text-sm font-semibold bg-slate-100/90 border-slate-200 text-slate-700 cursor-not-allowed select-all"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <Button 
                type="submit" 
                disabled={isSaving} 
                className="h-11 px-7 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.99]"
              >
                {isSaving && <Loader2 className="size-4 animate-spin mr-2" />}
                Lưu cập nhật hồ sơ
              </Button>
            </div>
          </form>
        </div>

        {/* Thẻ thành viên VIP ID Card bên phải */}
        <div className="rounded-2xl border-2 border-slate-900 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-6 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 size-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  AutoWash Pro VIP Club
                </span>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <Award className="size-5 text-amber-400" />
                  Thẻ Thành Viên
                </h2>
              </div>
              <TierBadge tier={profile?.membership_tier || "MEMBER"} className="shadow-md scale-110" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-xs font-semibold text-slate-300">Điểm tích lũy:</span>
                <span className="font-mono font-black text-2xl text-amber-400">
                  {profile?.total_points} <span className="text-xs font-bold text-slate-400">PTS</span>
                </span>
              </div>

              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-xs font-semibold text-slate-300">Độ uy tín (Trust Score):</span>
                <TrustScoreDisplay score={profile?.trust_score ?? 100} />
              </div>

              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-xs font-semibold text-slate-300">Chi tiêu 12 tháng:</span>
                <span className="font-mono font-bold text-base text-emerald-400">
                  {formatVND(profile?.total_spending_12m || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/10 p-4 border border-white/15 space-y-2 relative z-10 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Sparkles className="size-4 shrink-0" />
              <span>Đặc quyền của bạn:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Đặt lịch ưu tiên trước <strong className="text-white">{profile?.booking_window_days} ngày</strong>. Tự động tích lũy điểm thưởng và hưởng chính sách thanh toán sau dịch vụ cho xe có uy tín cao.
            </p>
          </div>
        </div>
      </div>

      {/* Quick links bento panel */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-extrabold text-foreground">Truy cập nhanh</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/customer/phuong-tien"
            className="group flex flex-col justify-between rounded-2xl border-2 border-slate-200/90 bg-card p-5.5 transition-all duration-200 hover:border-primary hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Car className="size-5.5 stroke-[2.2]" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1.5 group-hover:text-primary" />
            </div>
            <div className="mt-5">
              <p className="font-bold text-foreground text-base group-hover:text-primary transition-colors">Quản lý xe của tôi</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Thêm xe mới, chỉnh sửa biển số hoặc chọn xe ưu tiên mặc định.</p>
            </div>
          </Link>

          <Link
            href="/customer/lich-hen"
            className="group flex flex-col justify-between rounded-2xl border-2 border-slate-200/90 bg-card p-5.5 transition-all duration-200 hover:border-primary hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <CalendarRange className="size-5.5 stroke-[2.2]" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1.5 group-hover:text-primary" />
            </div>
            <div className="mt-5">
              <p className="font-bold text-foreground text-base group-hover:text-primary transition-colors">Lịch hẹn dịch vụ</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Theo dõi quy trình rửa xe, xác nhận tình trạng hoặc hủy lịch.</p>
            </div>
          </Link>

          <Link
            href="/customer/diem-thuong"
            className="group flex flex-col justify-between rounded-2xl border-2 border-slate-200/90 bg-card p-5.5 transition-all duration-200 hover:border-primary hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Gift className="size-5.5 stroke-[2.2]" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1.5 group-hover:text-primary" />
            </div>
            <div className="mt-5">
              <p className="font-bold text-foreground text-base group-hover:text-primary transition-colors">Điểm thưởng & Quà</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Đổi voucher rửa xe miễn phí và kiểm tra lịch sử tích lũy điểm.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
