"use client"

import { useState } from "react"
import { Settings, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PointsConfig {
  pointsPerAmount: number // 1 point per X VND
  expirationDays: number
  memberMultiplier: number
  silverMultiplier: number
  goldMultiplier: number
  platinumMultiplier: number
}

export default function PointsConfigPage() {
  const [config, setConfig] = useState<PointsConfig>({
    pointsPerAmount: 10000,
    expirationDays: 365,
    memberMultiplier: 1.0,
    silverMultiplier: 1.2,
    goldMultiplier: 1.5,
    platinumMultiplier: 2.0,
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Settings className="size-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Cấu hình hệ thống điểm thưởng</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Quản lý tỷ lệ tích điểm, hết hạn, và hệ số nhân theo hạng thành viên
          </p>
        </div>

        {/* Points Accumulation Section */}
        <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
          <h2 className="text-xl font-bold text-foreground">Tỷ lệ tích điểm</h2>

          <div className="space-y-4">
            {/* Points per Amount */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Cứ bao nhiêu đồng thanh toán = 1 điểm
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Cứ</span>
                <input
                  type="number"
                  value={config.pointsPerAmount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      pointsPerAmount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-24 rounded-lg border border-border bg-input px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">đ thanh toán = 1 điểm</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ví dụ: Nếu nhập 10000, mỗi 10.000đ chi tiêu sẽ được 1 điểm
              </p>
            </div>

            {/* Expiration Days */}
            <div className="space-y-2 pt-4 border-t border-border">
              <label className="text-sm font-semibold text-foreground">
                Thời gian hết hạn điểm
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Điểm hết hạn sau</span>
                <input
                  type="number"
                  value={config.expirationDays}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      expirationDays: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-24 rounded-lg border border-border bg-input px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">ngày</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ví dụ: Nếu nhập 365, điểm sẽ hết hạn sau 365 ngày kể từ ngày tạo
              </p>
            </div>
          </div>
        </div>

        {/* Tier Multipliers Section */}
        <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
          <h2 className="text-xl font-bold text-foreground">Hệ số nhân theo hạng</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Member */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">THÀNH VIÊN</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">x</span>
                <input
                  type="number"
                  value={config.memberMultiplier}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      memberMultiplier: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.1"
                  className="w-20 rounded-lg border border-border bg-input px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Silver */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-semibold text-blue-700 mb-2">BẠC</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-700">x</span>
                <input
                  type="number"
                  value={config.silverMultiplier}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      silverMultiplier: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.1"
                  className="w-20 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Gold */}
            <div className="rounded-lg border border-gold/30 bg-gold/10 p-4">
              <p className="text-xs font-semibold text-gold mb-2">VÀNG</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gold">x</span>
                <input
                  type="number"
                  value={config.goldMultiplier}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      goldMultiplier: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.1"
                  className="w-20 rounded-lg border border-gold/50 bg-white px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>

            {/* Platinum */}
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <p className="text-xs font-semibold text-purple-700 mb-2">BẠCH KIM</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-700">x</span>
                <input
                  type="number"
                  value={config.platinumMultiplier}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      platinumMultiplier: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.1"
                  className="w-20 rounded-lg border border-purple-300 bg-white px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              💡 Hệ số này sẽ nhân với số điểm được tích lũy. Ví dụ: Thành viên BẠC mua 100.000đ sẽ được 10 điểm × 1.2 = 12 điểm
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 text-success text-sm font-semibold">
              ✓ Cấu hình đã được lưu thành công
            </div>
          )}
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 gap-2 px-6"
          >
            <Save className="size-4" />
            Lưu cấu hình
          </Button>
        </div>
      </div>
    </div>
  )
}
