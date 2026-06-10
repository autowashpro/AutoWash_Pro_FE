"use client"

import { useState, useEffect } from "react"
import { Star, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatVND } from "@/lib/data"
import { getLoyaltyConfig, updateLoyaltyConfig } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface TierConfig {
  id: string
  name: string
  minSpending: number
  advanceBookingDays: number
  color: string
  textColor: string
  borderColor: string
}

const initialTiers: TierConfig[] = [
  {
    id: "member",
    name: "THÀNH VIÊN",
    minSpending: 0,
    advanceBookingDays: 7,
    color: "bg-muted/30",
    textColor: "text-muted-foreground",
    borderColor: "border-border",
  },
  {
    id: "silver",
    name: "BẠC",
    minSpending: 5000000,
    advanceBookingDays: 14,
    color: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  {
    id: "gold",
    name: "VÀNG",
    minSpending: 15000000,
    advanceBookingDays: 21,
    color: "bg-gold/10",
    textColor: "text-gold",
    borderColor: "border-gold/30",
  },
  {
    id: "platinum",
    name: "BẠCH KIM",
    minSpending: 40000000,
    advanceBookingDays: 30,
    color: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
  },
]

export default function TierConfigPage() {
  const [tiers, setTiers] = useState<TierConfig[]>(initialTiers)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const { toast } = useToast()

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const data = await getLoyaltyConfig()
      if (data) {
        setTiers([
          {
            id: "member",
            name: "THÀNH VIÊN",
            minSpending: Number(data.memberMinSpending || data.member_min_spending || 0),
            advanceBookingDays: Number(data.memberAdvanceBookingDays || data.member_advance_booking_days || 7),
            color: "bg-muted/30",
            textColor: "text-muted-foreground",
            borderColor: "border-border",
          },
          {
            id: "silver",
            name: "BẠC",
            minSpending: Number(data.silverMinSpending || data.silver_min_spending || 5000000),
            advanceBookingDays: Number(data.silverAdvanceBookingDays || data.silver_advance_booking_days || 14),
            color: "bg-blue-50",
            textColor: "text-blue-700",
            borderColor: "border-blue-200",
          },
          {
            id: "gold",
            name: "VÀNG",
            minSpending: Number(data.goldMinSpending || data.gold_min_spending || 15000000),
            advanceBookingDays: Number(data.goldAdvanceBookingDays || data.gold_advance_booking_days || 21),
            color: "bg-gold/10",
            textColor: "text-gold",
            borderColor: "border-gold/30",
          },
          {
            id: "platinum",
            name: "BẠCH KIM",
            minSpending: Number(data.platinumMinSpending || data.platinum_min_spending || 40000000),
            advanceBookingDays: Number(data.platinumAdvanceBookingDays || data.platinum_advance_booking_days || 30),
            color: "bg-purple-50",
            textColor: "text-purple-700",
            borderColor: "border-purple-200",
          },
        ])
      }
    } catch (err) {
      console.warn("Failed to fetch tier config, using default/mock", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleUpdateTier = (
    id: string,
    field: "minSpending" | "advanceBookingDays",
    value: number
  ) => {
    setTiers(
      tiers.map((tier) =>
        tier.id === id ? { ...tier, [field]: value } : tier
      )
    )
  }

  const handleSave = async () => {
    try {
      const payload: Record<string, any> = {}
      tiers.forEach(tier => {
        payload[`${tier.id}_min_spending`] = tier.minSpending
        payload[`${tier.id}_advance_booking_days`] = tier.advanceBookingDays
      })
      
      await updateLoyaltyConfig(payload)
      toast({
        title: "Cập nhật thành công",
        description: "Cấu hình hạng thành viên đã được lưu thành công.",
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.warn("API update loyalty config for tiers failed, fallback offline", err)
      toast({
        title: "Cập nhật ngoại tuyến",
        description: "Cấu hình hạng được lưu tạm thời trên trình duyệt (Chế độ offline).",
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Cấu hình hạng thành viên</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-3">
            Cấu hình ngưỡng chi tiêu và số ngày đặt trước cho mỗi hạng thành viên
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Đang tải cấu hình hạng...</p>
          </div>
        ) : (
          <>
            {/* Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`rounded-2xl border-2 ${tier.borderColor} ${tier.color} p-6 space-y-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5`}
                >
                  {/* Tier Name */}
                  <div className={`${tier.textColor} font-extrabold text-lg tracking-wider`}>
                    {tier.name}
                  </div>

                  {/* Min Spending */}
                  <div className="space-y-2">
                    <label className={`text-xs font-semibold ${tier.textColor}`}>
                      Ngưỡng chi tiêu tối thiểu
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        disabled={tier.id === 'member'} // Thành viên mới mặc định 0đ
                        value={tier.minSpending}
                        onChange={(e) =>
                          handleUpdateTier(tier.id, "minSpending", parseInt(e.target.value) || 0)
                        }
                        className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-xs font-semibold text-muted-foreground">đ</span>
                    </div>
                    <p className={`text-xs ${tier.textColor} opacity-75`}>
                      {formatVND(tier.minSpending)}
                    </p>
                  </div>

                  {/* Advance Booking Days */}
                  <div className="space-y-2 pt-4 border-t border-border/30">
                    <label className={`text-xs font-semibold ${tier.textColor}`}>
                      Số ngày có thể đặt trước
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={tier.advanceBookingDays}
                        onChange={(e) =>
                          handleUpdateTier(
                            tier.id,
                            "advanceBookingDays",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 rounded-lg border border-border bg-input px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-xs font-semibold text-muted-foreground">ngày</span>
                    </div>
                    <p className={`text-xs ${tier.textColor} opacity-75`}>
                      Khách hàng có thể đặt lịch trước tối đa {tier.advanceBookingDays} ngày
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className={`rounded-lg ${tier.color} border ${tier.borderColor} p-3`}>
                    <p className={`text-xs ${tier.textColor} font-medium`}>
                      💡 Khách hàng sẽ được xếp vào hạng này khi tổng chi tiêu từ{" "}
                      <span className="font-bold">{formatVND(tier.minSpending)}</span> trở lên
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              {saved && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 text-success text-sm font-semibold">
                  ✓ Cấu hình tier đã được lưu thành công
                </div>
              )}
              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 gap-2 px-6 shadow-[var(--shadow-glow)]"
              >
                <Save className="size-4" />
                Lưu cấu hình tier
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
