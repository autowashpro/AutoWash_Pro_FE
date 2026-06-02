"use client"

import { useState } from "react"
import { Star, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatVND } from "@/lib/data"

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
  const [saved, setSaved] = useState(false)

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

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Star className="size-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Cấu hình hạng thành viên</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Cấu hình ngưỡng chi tiêu và số ngày đặt trước cho mỗi hạng thành viên
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-2xl border-2 ${tier.borderColor} ${tier.color} p-6 space-y-6`}
            >
              {/* Tier Name */}
              <div className={`${tier.textColor} font-bold text-lg`}>
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
                    value={tier.minSpending}
                    onChange={(e) =>
                      handleUpdateTier(tier.id, "minSpending", parseInt(e.target.value) || 0)
                    }
                    className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-20 rounded-lg border border-border bg-input px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
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
            className="bg-primary hover:bg-primary/90 gap-2 px-6"
          >
            <Save className="size-4" />
            Lưu cấu hình tier
          </Button>
        </div>
      </div>
    </div>
  )
}
