"use client"

import { useState, useEffect } from "react"
import { Shield, Star, Crown, Diamond, Save, Loader2, Calculator, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatVND } from "@/lib/data"
import { getLoyaltyConfig, updateLoyaltyConfig } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"

interface TierConfig {
  id: string
  name: string
  minSpending: number | ''
  advanceBookingDays: number | ''
  pointMultiplier: number | ''
  badgeBg: string
  textColor: string
  borderColor: string
  accentColor: string
  icon: React.ReactNode
}

const formatNumberWithDots = (val: number | string | '') => {
  if (val === '' || val === undefined || val === null) return ''
  const clean = val.toString().replace(/\D/g, '')
  if (!clean) return ''
  return parseInt(clean, 10).toLocaleString('vi-VN')
}

const parseNumberFromDots = (str: string): number | '' => {
  const clean = str.replace(/\D/g, '')
  if (!clean) return ''
  return parseInt(clean, 10)
}

const initialTiers: TierConfig[] = [
  {
    id: "member",
    name: "THÀNH VIÊN",
    minSpending: 0,
    advanceBookingDays: 3,
    pointMultiplier: 1.0,
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    textColor: "text-slate-800 dark:text-slate-200",
    borderColor: "border-border/80",
    accentColor: "text-slate-500",
    icon: <Shield className="size-5 text-slate-600 dark:text-slate-400" />,
  },
  {
    id: "silver",
    name: "BẠC",
    minSpending: 5000000,
    advanceBookingDays: 5,
    pointMultiplier: 1.25,
    badgeBg: "bg-slate-200/70 dark:bg-slate-800",
    textColor: "text-slate-900 dark:text-slate-100",
    borderColor: "border-slate-300 dark:border-slate-700",
    accentColor: "text-slate-600",
    icon: <Star className="size-5 text-slate-500" />,
  },
  {
    id: "gold",
    name: "VÀNG",
    minSpending: 15000000,
    advanceBookingDays: 10,
    pointMultiplier: 1.5,
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/20",
    textColor: "text-amber-900 dark:text-amber-300",
    borderColor: "border-amber-500/30",
    accentColor: "text-amber-600",
    icon: <Crown className="size-5 text-amber-600 dark:text-amber-400" />,
  },
  {
    id: "platinum",
    name: "BẠCH KIM",
    minSpending: 40000000,
    advanceBookingDays: 14,
    pointMultiplier: 2.5,
    badgeBg: "bg-purple-500/10 dark:bg-purple-500/20",
    textColor: "text-purple-900 dark:text-purple-300",
    borderColor: "border-purple-500/30",
    accentColor: "text-purple-600",
    icon: <Diamond className="size-5 text-purple-600 dark:text-purple-400" />,
  },
]

export default function TierConfigPage() {
  const [tiers, setTiers] = useState<TierConfig[]>(initialTiers)
  const [pointsPerAmount, setPointsPerAmount] = useState<number | ''>(10000)
  const [expirationMonths, setExpirationMonths] = useState<number | ''>(12)
  const [testAmount, setTestAmount] = useState<number | ''>(500000)
  
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const data = await getLoyaltyConfig()
      if (data) {
        setPointsPerAmount(Number(data.pointsPerAmount ?? data.points_per_amount ?? 10000))
        setExpirationMonths(Number(data.expirationMonths ?? data.expiration_months ?? 12))

        setTiers(tiers.map(t => {
          const prefix = t.id
          return {
            ...t,
            minSpending: Number(data[`${prefix}MinSpending`] ?? data[`${prefix}_min_spending`] ?? t.minSpending),
            advanceBookingDays: Number(data[`${prefix}AdvanceBookingDays`] ?? data[`${prefix}_advance_booking_days`] ?? t.advanceBookingDays),
            pointMultiplier: Number(data[`${prefix}Multiplier`] ?? data[`${prefix}_multiplier`] ?? t.pointMultiplier),
          }
        }))
      }
    } catch (err) {
      console.warn("Failed to fetch tier config from API:", err)
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể lấy cấu hình hạng từ máy chủ. Đang dùng dữ liệu tạm.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleUpdateTier = (
    id: string,
    field: "minSpending" | "advanceBookingDays" | "pointMultiplier",
    value: string
  ) => {
    let parsed: number | '' = ''
    if (value !== '') {
      if (field === 'pointMultiplier') {
        parsed = parseFloat(value)
        if (isNaN(parsed)) parsed = ''
      } else {
        parsed = parseNumberFromDots(value)
      }
    }
    setTiers(
      tiers.map((tier) =>
        tier.id === id ? { ...tier, [field]: parsed } : tier
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload: Record<string, any> = {
        points_per_amount: pointsPerAmount === '' ? 10000 : pointsPerAmount,
        expiration_months: expirationMonths === '' ? 12 : expirationMonths,
      }
      
      tiers.forEach(tier => {
        payload[`${tier.id}_min_spending`] = tier.minSpending === '' ? 0 : tier.minSpending
        payload[`${tier.id}_advance_booking_days`] = tier.advanceBookingDays === '' ? 0 : tier.advanceBookingDays
        payload[`${tier.id}_multiplier`] = tier.pointMultiplier === '' ? 1 : tier.pointMultiplier
      })
      
      await updateLoyaltyConfig(payload)
      toast({
        title: "Cập nhật thành công",
        description: "Cấu hình Hạng thành viên & Điểm thưởng đã được lưu.",
      })
    } catch (err: any) {
      console.error("API update loyalty config failed:", err)
      toast({
        title: "Không thể lưu cấu hình",
        description: err?.response?.data?.message || "Lỗi kết nối máy chủ.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-6xl mx-auto">
      <PageHeader 
        title="Cấu hình Hạng & Điểm thưởng" 
        description="Trung tâm quản lý cấp bậc thành viên, tỷ lệ tích điểm và bộ mô phỏng quy đổi thời gian thực" 
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="size-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Đang tải dữ liệu cấu hình...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: General Loyalty Points Rule */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Coins className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground tracking-tight">Quy tắc tích điểm & hết hạn toàn hệ thống</h2>
                <p className="text-xs text-muted-foreground">Thiết lập tỷ lệ quy đổi số tiền chi tiêu ra điểm thưởng cơ bản</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Points per Amount */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Tỷ lệ quy đổi điểm</span>
                  <span className="text-[11px] font-normal text-muted-foreground">Ví dụ: 10.000đ = 1 điểm</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formatNumberWithDots(pointsPerAmount)}
                    onChange={(e) => setPointsPerAmount(parseNumberFromDots(e.target.value))}
                    className="pr-24 font-bold text-sm bg-background"
                    placeholder="10.000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    đ = 1 điểm
                  </span>
                </div>
              </div>

              {/* Expiration Months */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Thời gian hết hạn điểm</span>
                  <span className="text-[11px] font-normal text-muted-foreground">Hạn sử dụng điểm thưởng</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={expirationMonths}
                    onChange={(e) => setExpirationMonths(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    className="pr-16 font-bold text-sm bg-background"
                    placeholder="12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    tháng
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Live Points Simulator (Bento Card) */}
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.02] p-6 space-y-5 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Calculator className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground tracking-tight">Bộ mô phỏng tính điểm thời gian thực</h3>
                  <p className="text-xs text-muted-foreground">Thử nghiệm số điểm khách hàng nhận được tương ứng với số tiền hóa đơn</p>
                </div>
              </div>

              {/* Input Test Amount with Thousand Separator Dots */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Hóa đơn thử:</span>
                <div className="relative w-40">
                  <Input
                    type="text"
                    value={formatNumberWithDots(testAmount)}
                    onChange={(e) => setTestAmount(parseNumberFromDots(e.target.value))}
                    className="pr-7 text-xs font-bold bg-background h-9"
                    placeholder="500.000"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    đ
                  </span>
                </div>
              </div>
            </div>

            {/* Calculated Points Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {tiers.map((tier) => {
                const pPerAmt = Number(pointsPerAmount) || 10000
                const multiplier = Number(tier.pointMultiplier) || 1.0
                const numericTestAmount = Number(testAmount) || 0
                const basePoints = numericTestAmount / pPerAmt
                const calculatedPoints = Math.floor(basePoints * multiplier)

                return (
                  <div key={tier.id} className={cn("rounded-xl border p-3.5 space-y-1 bg-card/80 backdrop-blur-sm", tier.borderColor)}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {tier.name}
                      </span>
                      <span className="text-[11px] font-bold text-muted-foreground">
                        x{multiplier}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 pt-1">
                      <span className="text-xl font-extrabold text-foreground">
                        +{calculatedPoints.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">điểm</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 3: Tier Configuration Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground tracking-tight">Cấu hình chi tiết 4 Cấp bậc Hạng</h2>
              <span className="text-xs text-muted-foreground">Tự động cập nhật thứ hạng khi người dùng đủ tổng chi tiêu</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={cn(
                    "rounded-2xl border p-6 space-y-5 shadow-sm transition-all duration-200 hover:shadow-md bg-card relative overflow-hidden",
                    tier.borderColor
                  )}
                >
                  {/* Tier Title & Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-xl border shadow-xs", tier.badgeBg, tier.borderColor)}>
                        {tier.icon}
                      </div>
                      <div>
                        <h3 className={cn("font-extrabold text-base tracking-wider uppercase", tier.textColor)}>
                          {tier.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                          {tier.minSpending !== '' ? formatVND(Number(tier.minSpending)) : '0đ'} chi tiêu
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-muted text-muted-foreground border border-border/50">
                      x{tier.pointMultiplier} Hệ số
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Min Spending with Dots Separator */}
                    <div className="space-y-1.5 col-span-1 sm:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                        <span>Chi tiêu tối thiểu (VNĐ)</span>
                        <span className="text-[11px] font-bold text-foreground">
                          {tier.minSpending !== '' ? formatVND(Number(tier.minSpending)) : '0đ'}
                        </span>
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          disabled={tier.id === 'member'}
                          value={formatNumberWithDots(tier.minSpending)}
                          onChange={(e) => handleUpdateTier(tier.id, "minSpending", e.target.value)}
                          className="pr-10 font-bold text-sm bg-background disabled:opacity-60"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                          đ
                        </span>
                      </div>
                    </div>

                    {/* Point Multiplier */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Hệ số nhân điểm
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          value={tier.pointMultiplier}
                          onChange={(e) => handleUpdateTier(tier.id, "pointMultiplier", e.target.value)}
                          className="pr-8 font-bold text-sm bg-background"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                          x
                        </span>
                      </div>
                    </div>

                    {/* Advance Booking Days */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Số ngày đặt trước
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={tier.advanceBookingDays}
                          onChange={(e) => handleUpdateTier(tier.id, "advanceBookingDays", e.target.value)}
                          className="pr-14 font-bold text-sm bg-background"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                          ngày
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              💡 Lưu ý: Các thay đổi sẽ có hiệu lực lập tức đối với tất cả các giao dịch mới.
            </p>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 gap-2 px-8 py-5 rounded-xl shadow-md font-bold text-sm"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isSaving ? "Đang lưu cấu hình..." : "Lưu cấu hình"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
