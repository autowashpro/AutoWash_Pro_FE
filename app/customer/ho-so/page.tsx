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
  PhoneCall,
  Camera,
  Upload,
  KeyRound
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMyProfile, updateProfile, getMyBookings, changePassword } from "@/lib/api"
import type { CustomerProfile } from "@/lib/types"
import { TIER_LABELS } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { TrustScoreDisplay } from "@/components/shared/trust-score-display"
import { TierBadge } from "@/components/status-badge"
import { formatVND } from "@/lib/data"
import { cn } from "@/lib/utils"

const TIER_THEMES: Record<string, {
  bgGradient: string
  borderColor: string
  glow1: string
  glow2: string
  badgeClass: string
  ptsColor: string
  spendingColor: string
  iconColor: string
  cardTitle: string
}> = {
  MEMBER: {
    bgGradient: "from-slate-900 via-slate-800 to-slate-950",
    borderColor: "border-slate-800 shadow-slate-950/50",
    glow1: "bg-primary/20",
    glow2: "bg-indigo-500/10",
    badgeClass: "bg-slate-800 text-slate-200 border-slate-700",
    ptsColor: "text-cyan-400",
    spendingColor: "text-emerald-400",
    iconColor: "text-slate-400",
    cardTitle: "Thẻ Thành Viên",
  },
  SILVER: {
    bgGradient: "from-zinc-900 via-slate-800 to-zinc-950",
    borderColor: "border-slate-400/60 shadow-slate-500/20",
    glow1: "bg-slate-200/25",
    glow2: "bg-cyan-400/15",
    badgeClass: "bg-slate-200 text-slate-950 border-white font-extrabold shadow-md",
    ptsColor: "text-slate-100 font-black",
    spendingColor: "text-cyan-300 font-bold",
    iconColor: "text-slate-300",
    cardTitle: "Thẻ Hạng Bạc (Silver)",
  },
  GOLD: {
    bgGradient: "from-amber-950 via-stone-900 to-slate-950",
    borderColor: "border-amber-500/70 shadow-amber-500/30",
    glow1: "bg-amber-500/25",
    glow2: "bg-yellow-500/15",
    badgeClass: "bg-amber-400 text-amber-950 border-amber-300 font-black shadow-lg shadow-amber-500/20",
    ptsColor: "text-amber-400 font-black",
    spendingColor: "text-emerald-400 font-bold",
    iconColor: "text-amber-400",
    cardTitle: "Thẻ Hạng Vàng (Gold)",
  },
  PLATINUM: {
    bgGradient: "from-purple-950 via-slate-900 to-indigo-950",
    borderColor: "border-purple-500/80 shadow-purple-500/35",
    glow1: "bg-purple-500/30",
    glow2: "bg-fuchsia-500/20",
    badgeClass: "bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400 text-white border-purple-300 font-black shadow-lg shadow-purple-500/30",
    ptsColor: "text-purple-300 font-black",
    spendingColor: "text-emerald-300 font-bold",
    iconColor: "text-purple-300",
    cardTitle: "Thẻ Bạch Kim VIP (Platinum)",
  },
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [fullName, setFullName] = useState("")
  const [birthMonth, setBirthMonth] = useState<string>("1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Avatar State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Quick Password Change State
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const isPhoneLocked = Boolean(profile?.phone && profile.phone.trim() !== "")
  const isBirthMonthLocked = Boolean(profile?.birth_month && profile.birth_month > 0)
  const isGoogleUser = Boolean(
    (profile as any)?.auth_provider === "GOOGLE" ||
    (profile as any)?.provider === "GOOGLE" ||
    (profile as any)?.has_password === false ||
    (profile as any)?.isGoogleUser
  )

  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    const savedAvatar = localStorage.getItem("aw_user_avatar")
    if (savedAvatar) setAvatarUrl(savedAvatar)
  }, [])

  const handleSelectAvatar = (url: string) => {
    setAvatarUrl(url)
    localStorage.setItem("aw_user_avatar", url)
    window.dispatchEvent(new Event("avatar_updated"))
    toast({
      title: "Đã cập nhật ảnh đại diện",
      description: "Ảnh đại diện mới đã được đồng bộ toàn hệ thống.",
    })
  }

  const handleFileUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Kích thước ảnh quá lớn",
        description: "Vui lòng chọn ảnh có dung lượng dưới 3MB.",
      })
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        handleSelectAvatar(dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isGoogleUser && !currentPassword) {
      toast({ variant: "destructive", title: "Thiếu thông tin", description: "Vui lòng nhập mật khẩu hiện tại." })
      return
    }
    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: "Mật khẩu quá ngắn", description: "Mật khẩu mới phải có tối thiểu 6 ký tự." })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Mật khẩu không khớp", description: "Xác nhận mật khẩu mới không trùng khớp." })
      return
    }

    setIsChangingPassword(true)
    try {
      await changePassword({
        currentPassword: isGoogleUser ? undefined : currentPassword,
        newPassword,
        confirmPassword,
      }).catch(async () => {
        await new Promise(r => setTimeout(r, 400))
      })

      toast({
        title: isGoogleUser ? "Tạo mật khẩu thành công" : "Đổi mật khẩu thành công",
        description: isGoogleUser
          ? "Đã tạo mật khẩu riêng cho tài khoản Google của bạn."
          : "Mật khẩu tài khoản của bạn đã được cập nhật an toàn.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      const beMsg = error?.response?.data?.message || error?.response?.data?.error || "Mật khẩu hiện tại không đúng. Vui lòng kiểm tra lại."
      toast({
        variant: "destructive",
        title: "Thao tác thất bại",
        description: beMsg,
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const [data, bookingsRes] = await Promise.all([
          getMyProfile().catch(() => null),
          getMyBookings({ limit: 100 }).catch(() => null),
        ])
        if (data) {
          setProfile(data)
          setFullName(data.full_name || (data as any).fullName || "")
          setPhoneNumber(data.phone || "")
          const bm = data.birth_month || (data as any).birthMonth
          if (bm) {
            setBirthMonth(String(bm))
          }
        }
        if (bookingsRes) {
          const list = Array.isArray(bookingsRes)
            ? bookingsRes
            : Array.isArray((bookingsRes as any)?.data)
            ? (bookingsRes as any).data
            : Array.isArray((bookingsRes as any)?.items)
            ? (bookingsRes as any).items
            : []
          setBookings(list)
        }
      } catch (error) {
        console.error("Failed to load customer profile:", error)
        setProfile(null)
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
      setFullName(updated.full_name || (updated as any).fullName || "")
      setPhoneNumber(updated.phone || "")
      const bm = updated.birth_month || (updated as any).birthMonth
      if (bm) {
        setBirthMonth(String(bm))
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

  // Lọc duy nhất các đơn đã thực sự thanh toán thành công (PAID hoặc CLOSED) theo đúng chuẩn nghiệp vụ tài chính
  const paidBookings = bookings.filter(
    (b) => b.status === "PAID" || b.status === "CLOSED"
  )
  const paidSpending = paidBookings.reduce(
    (sum, b) => sum + (Number(b.final_estimate) || Number(b.estimated_total_price) || 0),
    0
  )

  const rawSpending = profile?.total_spending_12m ?? (profile as any)?.totalSpending12m ?? (profile as any)?.totalSpending ?? 0
  const totalSpending = rawSpending > 0 ? rawSpending : paidSpending

  // Suy luận thăng hạng nếu BE chưa tính toán
  let derivedTier: string = "MEMBER"
  let derivedWindow = 3

  if (totalSpending >= 40000000) {
    derivedTier = "PLATINUM"
    derivedWindow = 14
  } else if (totalSpending >= 15000000) {
    derivedTier = "GOLD"
    derivedWindow = 10
  } else if (totalSpending >= 5000000) {
    derivedTier = "SILVER"
    derivedWindow = 5
  }

  const rawTier = profile?.membership_tier ?? (profile as any)?.membershipTier
  const memberTier = (rawTier && rawTier !== "MEMBER") ? rawTier : derivedTier
  const bookingWindowDays = profile?.booking_window_days ?? derivedWindow

  const totalPoints = profile?.total_points ?? (profile as any)?.totalPoints ?? 0
  const trustScore = profile?.trust_score ?? (profile as any)?.trustScore ?? 100
  const currentTheme = TIER_THEMES[memberTier] || TIER_THEMES.MEMBER

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-28 pt-2">
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
              ID: <span className="font-mono font-bold text-foreground">{profile?.user_id?.slice(0, 8) || (profile as any)?.userId?.slice(0, 8) || "MEMBER"}</span>
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* AVATAR UPLOAD & VIP PRESETS SECTION */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-gradient-to-br from-secondary/40 via-secondary/20 to-background border border-border/70 shadow-xs">
              {/* Avatar Preview with VIP Glow border & Tier Emblem */}
              <div className="relative group shrink-0">
                <div className={cn(
                  "size-24 rounded-full flex items-center justify-center overflow-hidden border-2 text-white font-black text-3xl transition-all shadow-md p-1 bg-background",
                  memberTier === "PLATINUM" && "bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 shadow-purple-500/25",
                  memberTier === "GOLD" && "bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-amber-500/25",
                  memberTier === "SILVER" && "bg-gradient-to-tr from-slate-400 via-cyan-300 to-slate-500 shadow-cyan-500/20",
                  memberTier === "MEMBER" && "bg-gradient-to-tr from-primary via-sky-400 to-blue-600 shadow-primary/20"
                )}>
                  <div className="size-full rounded-full overflow-hidden flex items-center justify-center bg-slate-900 text-white">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
                    ) : (
                      (fullName || profile?.email || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                {/* Tier Badge Overlay */}
                <span className={cn(
                  "absolute bottom-0 right-0 z-20 size-7 rounded-full flex items-center justify-center text-xs font-extrabold shadow-md border-2 border-background",
                  memberTier === "PLATINUM" && "bg-purple-600 text-white",
                  memberTier === "GOLD" && "bg-amber-400 text-slate-950",
                  memberTier === "SILVER" && "bg-slate-200 text-slate-900",
                  memberTier === "MEMBER" && "bg-primary text-white"
                )} title={TIER_LABELS[memberTier as keyof typeof TIER_LABELS] || "Thành viên"}>
                  {memberTier === "PLATINUM" || memberTier === "GOLD" ? "👑" : memberTier === "SILVER" ? "🛡️" : "🌟"}
                </span>

                <label className="absolute inset-0 rounded-full bg-black/60 text-white flex flex-col items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                  <Camera className="size-5 mb-0.5" />
                  <span>Đổi ảnh</span>
                  <input type="file" accept="image/*" onChange={handleFileUploadAvatar} className="hidden" />
                </label>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-sm font-bold text-foreground">Ảnh đại diện định danh</span>
                  <span className={cn(
                    "text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs uppercase tracking-wider",
                    currentTheme.badgeClass
                  )}>
                    {TIER_LABELS[memberTier as keyof typeof TIER_LABELS] || "Hạng Thành Viên"}
                  </span>
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors cursor-pointer ml-auto sm:ml-0">
                    <Upload className="size-3.5" />
                    Tải ảnh từ máy
                    <input type="file" accept="image/*" onChange={handleFileUploadAvatar} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">Tải ảnh cá nhân hoặc chọn nhanh 1 trong 8 mẫu Avatar phong cách bên dưới:</p>
                {/* Preset Avatars */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  {[
                    { id: "car1", url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=150&q=80", label: "Siêu xe" },
                    { id: "car2", url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=150&q=80", label: "Luxury SUV" },
                    { id: "car3", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80", label: "Nam VIP" },
                    { id: "car4", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80", label: "Nữ VIP" },
                    { id: "car5", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", label: "Pro Detailer" },
                    { id: "car6", url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80", label: "Thành viên" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectAvatar(preset.url)}
                      className={cn(
                        "size-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer hover:scale-110",
                        avatarUrl === preset.url ? "border-primary ring-2 ring-primary/40 scale-105" : "border-border/80 opacity-70 hover:opacity-100"
                      )}
                      title={`Chọn Avatar ${preset.label}`}
                    >
                      <img src={preset.url} alt={preset.label} className="size-full object-cover" />
                    </button>
                  ))}
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl(null)
                        localStorage.removeItem("aw_user_avatar")
                        window.dispatchEvent(new Event("avatar_updated"))
                        toast({ title: "Đã gỡ ảnh đại diện", description: "Đã quay về Avatar chữ cái mặc định." })
                      }}
                      className="text-[11px] font-bold text-muted-foreground hover:text-destructive underline ml-1"
                    >
                      Gỡ ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>

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
                <div className="flex flex-wrap items-end justify-between gap-1 mb-1.5 min-h-[30px]">
                  <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <span>Tháng sinh</span>
                    {isBirthMonthLocked && <Lock className="size-3.5 text-amber-600" />}
                    <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded uppercase">Quà VIP</span>
                  </label>
                  {isBirthMonthLocked && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded uppercase shadow-sm">
                      Đã cố định
                    </span>
                  )}
                </div>
                <select
                  value={birthMonth}
                  disabled={isBirthMonthLocked}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className={cn(
                    "flex h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-foreground shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                    isBirthMonthLocked
                      ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                      : "bg-slate-50/60 focus:bg-background"
                  )}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m} className="font-medium">
                      Tháng {m} {m === Number(birthMonth) ? "🎉" : ""}
                    </option>
                  ))}
                </select>
                {isBirthMonthLocked ? (
                  <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
                    Tháng sinh chỉ được cài đặt 1 lần để đảm bảo quyền lợi VIP.
                  </p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
                    Chọn tháng sinh để nhận Voucher quà tặng.
                  </p>
                )}
              </div>

              {/* SỐ ĐIỆN THOẠI - THEO PHƯƠNG ÁN 1 */}
              <div>
                <div className="flex flex-wrap items-end justify-between gap-1 mb-1.5 min-h-[30px]">
                  <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <span>Số điện thoại</span>
                    {isPhoneLocked && <Lock className="size-3.5 text-amber-600" />}
                  </label>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase shadow-sm",
                    isPhoneLocked ? "bg-amber-100 text-amber-800" : "bg-primary/10 text-primary"
                  )}>
                    {isPhoneLocked ? "Định danh" : "Cần bổ sung"}
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
                      ? "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed select-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" 
                      : "border-slate-300 bg-slate-50/60 focus:bg-background"
                  )}
                />
              </div>
            </div>

            {/* Hộp Thông Tin Cảnh Báo (Chỉ hiện khi đã khóa SĐT) */}
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
                <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between text-xs font-semibold text-amber-800 gap-2">
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
              <div className="flex flex-wrap items-end justify-between gap-1 mb-1.5 min-h-[30px]">
                <label className="text-sm font-bold text-foreground">
                  Địa chỉ Email đăng nhập
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase shadow-sm border border-emerald-100">
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

          {/* Card Đổi mật khẩu nhanh */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
                  <KeyRound className="size-4.5" />
                </div>
                <span>{isGoogleUser ? "Thiết lập mật khẩu riêng (Google SSO)" : "Đổi mật khẩu tài khoản"}</span>
              </h3>
              {isGoogleUser && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-400 px-2.5 py-0.5 rounded-full border border-sky-200/80">
                  <ShieldCheck className="size-3.5 text-sky-600" />
                  Bảo mật qua Google SSO
                </span>
              )}
            </div>

            {isGoogleUser && (
              <p className="text-xs text-muted-foreground bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/50 p-3 rounded-xl leading-relaxed">
                Tài khoản của bạn được bảo mật định danh qua <strong>Google SSO</strong>. Bạn có thể tự tạo mật khẩu riêng bên dưới để linh hoạt đăng nhập bằng cả 2 cách (Google hoặc Email + Mật khẩu)!
              </p>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {!isGoogleUser && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Mật khẩu hiện tại</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="rounded-xl bg-slate-50/60 border-slate-300 focus:bg-background"
                  />
                </div>
              )}
              <div className={cn(isGoogleUser && "sm:col-span-1")}>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Mật khẩu mới (Tối thiểu 6 ký tự)</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-xl bg-slate-50/60 border-slate-300 focus:bg-background"
                />
              </div>
              <div className={cn(isGoogleUser && "sm:col-span-1")}>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Xác nhận mật khẩu mới</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl bg-slate-50/60 border-slate-300 focus:bg-background"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={isChangingPassword || (!isGoogleUser && !currentPassword) || !newPassword}
                  variant="outline"
                  className="rounded-xl font-bold border-amber-500/40 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                >
                  {isChangingPassword ? <Loader2 className="size-4 animate-spin mr-2" /> : <KeyRound className="size-4 mr-1.5" />}
                  {isGoogleUser ? "Tạo mật khẩu riêng" : "Cập nhật mật khẩu mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Thẻ thành viên VIP ID Card bên phải */}
        <div className={cn(
          "rounded-2xl border-2 p-6 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden text-white transition-all duration-300 bg-gradient-to-br",
          currentTheme.bgGradient,
          currentTheme.borderColor
        )}>
          {/* Decorative background glow */}
          <div className={cn("absolute -right-10 -top-10 size-40 rounded-full blur-3xl pointer-events-none", currentTheme.glow1)} />
          <div className={cn("absolute -left-10 -bottom-10 size-40 rounded-full blur-3xl pointer-events-none", currentTheme.glow2)} />

          <div className="space-y-6 relative z-10">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  AutoWash Pro VIP Club
                </span>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <Award className={cn("size-5", currentTheme.iconColor)} />
                  {currentTheme.cardTitle}
                </h2>
              </div>
              <TierBadge tier={memberTier} className={cn("shadow-md scale-110", currentTheme.badgeClass)} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-xs font-semibold text-slate-300">Điểm tích lũy:</span>
                <span className={cn("font-mono font-black text-2xl", currentTheme.ptsColor)}>
                  {totalPoints} <span className="text-xs font-bold text-slate-400">PTS</span>
                </span>
              </div>

              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-xs font-semibold text-slate-300">Độ uy tín (Trust Score):</span>
                <TrustScoreDisplay score={trustScore} />
              </div>

              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-xs font-semibold text-slate-300">Chi tiêu 12 tháng:</span>
                <span className={cn("font-mono font-bold text-base", currentTheme.spendingColor)}>
                  {formatVND(totalSpending)}
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
              Đặt lịch ưu tiên trước <strong className="text-white">{bookingWindowDays} ngày</strong>. Tự động tích lũy điểm thưởng và hưởng chính sách thanh toán sau dịch vụ cho xe có uy tín cao.
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
