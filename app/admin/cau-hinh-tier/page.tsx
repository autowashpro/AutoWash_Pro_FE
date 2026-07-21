"use client"

import { useState, useEffect } from "react"
import { Shield, Star, Crown, Diamond, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatVND } from "@/lib/data"
import { getLoyaltyConfig, updateLoyaltyConfig } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/shared/page-header"

interface TierConfig {
  id: string
  name: string
  minSpending: number | ''
  advanceBookingDays: number | ''
  pointMultiplier: number | ''
  color: string
  textColor: string
  borderColor: string
  icon: React.ReactNode
}

const initialTiers: TierConfig[] = [
  {
    id: "member",
    name: "THÀNH VIÊN",
    minSpending: 0,
    advanceBookingDays: 3,
    pointMultiplier: 1.0,
    color: "bg-slate-50",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
    icon: <Shield className="size-6 text-slate-500" />,
  },
  {
    id: "silver",
    name: "BẠC",
    minSpending: 500000,
    advanceBookingDays: 7,
    pointMultiplier: 1.2,
    color: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: <Star className="size-6 text-blue-500" />,
  },
  {
    id: "gold",
    name: "VÀNG",
    minSpending: 1500000,
    advanceBookingDays: 10,
    pointMultiplier: 1.5,
    color: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-300",
    icon: <Crown className="size-6 text-amber-500" />,
  },
  {
    id: "platinum",
    name: "BẠCH KIM",
    minSpending: 3000000,
    advanceBookingDays: 14,
    pointMultiplier: 2.0,
    color: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    icon: <Diamond className="size-6 text-purple-500" />,
  },
]

export default function TierConfigPage() {
  const [tiers, setTiers] = useState<TierConfig[]>(initialTiers)
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const data = await getLoyaltyConfig()
      if (data) {
        setTiers(tiers.map(t => {
          const prefix = t.id
          return {
            ...t,
            minSpending: Number(data[`${prefix}MinSpending`] ?? data[`${prefix}_min_spending`] ?? t.minSpending),
            advanceBookingDays: Number(data[`${prefix}AdvanceBookingDays`] ?? data[`${prefix}_advance_booking_days`] ?? t.advanceBookingDays),
            pointMultiplier: Number(data[`${prefix}Multiplier`] ?? data[`${prefix}_multiplier`] ?? t.pointMultiplier),
          }
        }
        ))
      }
    } catch (err) {
      console.warn("Failed to fetch tier config from API:", err)
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể lấy cấu hình hạng từ máy chủ. Vui lòng kiểm tra kết nối Backend.",
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
         parsed = parseInt(value)
         if (isNaN(parsed)) parsed = ''
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
      const payload: Record<string, any> = {}
      tiers.forEach(tier => {
        payload[`${tier.id}_min_spending`] = tier.minSpending === '' ? 0 : tier.minSpending
        payload[`${tier.id}_advance_booking_days`] = tier.advanceBookingDays === '' ? 0 : tier.advanceBookingDays
        payload[`${tier.id}_multiplier`] = tier.pointMultiplier === '' ? 1 : tier.pointMultiplier
      })
      
      await updateLoyaltyConfig(payload)
      toast({
        title: "Cập nhật thành công",
        description: "Cấu hình hạng thành viên đã được lưu thành công.",
      })
    } catch (err: any) {
      console.error("API update loyalty config for tiers failed:", err)
      toast({
        title: "Không thể lưu cấu hình",
        description: err?.response?.data?.message || "Máy chủ từ chối cập nhật cấu hình hoặc lỗi kết nối Backend.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <PageHeader 
        title="Cấu hình Hạng thành viên" 
        description="Thiết lập ngưỡng chi tiêu, hệ số nhân điểm và số ngày đặt trước cho các cấp bậc hạng" 
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Đang tải cấu hình hạng...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-2xl border-2 ${tier.borderColor} ${tier.color} p-6 space-y-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
              >
                {/* Tier Name & Icon */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-background shadow-sm border ${tier.borderColor}`}>
                    {tier.icon}
                  </div>
                  <div className={`${tier.textColor} font-extrabold text-xl tracking-wider uppercase`}>
                    {tier.name}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Min Spending */}
                  <div className="space-y-2 col-span-1 sm:col-span-2">
                    <label className={`text-xs font-semibold ${tier.textColor}`}>
                      Ngưỡng chi tiêu tối thiểu (VNĐ)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        disabled={tier.id === 'member'}
                        value={tier.minSpending}
                        onChange={(e) => handleUpdateTier(tier.id, "minSpending", e.target.value)}
                        className="pl-3 pr-10 font-semibold bg-background"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                        đ
                      </span>
                    </div>
                    <p className={`text-xs ${tier.textColor} opacity-75 min-h-[16px]`}>
                      {tier.minSpending !== '' ? formatVND(Number(tier.minSpending)) : ''}
                    </p>
                  </div>

                  {/* Point Multiplier */}
                  <div className="space-y-2">
                    <label className={`text-xs font-semibold ${tier.textColor}`}>
                      Hệ số nhân điểm
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        value={tier.pointMultiplier}
                        onChange={(e) => handleUpdateTier(tier.id, "pointMultiplier", e.target.value)}
                        className="pl-3 pr-8 font-semibold bg-background"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                        x
                      </span>
                    </div>
                  </div>

                  {/* Advance Booking Days */}
                  <div className="space-y-2">
                    <label className={`text-xs font-semibold ${tier.textColor}`}>
                      Số ngày đặt trước
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={tier.advanceBookingDays}
                        onChange={(e) => handleUpdateTier(tier.id, "advanceBookingDays", e.target.value)}
                        className="pl-3 pr-12 font-semibold bg-background"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                        ngày
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className={`rounded-xl bg-background/50 border ${tier.borderColor} p-3`}>
                  <p className={`text-xs ${tier.textColor} font-medium leading-relaxed`}>
                    💡 Khách hàng cần chi tiêu từ <span className="font-bold">{tier.minSpending !== '' ? formatVND(Number(tier.minSpending)) : '0đ'}</span> để đạt hạng này. Tích lũy điểm x<span className="font-bold">{tier.pointMultiplier !== '' ? tier.pointMultiplier : 1}</span> cho mỗi giao dịch.
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 gap-2 px-8 py-6 rounded-xl shadow-md text-base"
            >
              {isSaving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
              {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
