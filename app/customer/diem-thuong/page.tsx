import { Gift, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TierBadge } from "@/components/status-badge"
import { LOYALTY_ACTIVITIES, TIER_META, formatDate } from "@/lib/data"

const POINTS = 412
const NEXT_TIER_AT = 500

const rewards = [
  { id: "r-1", name: "Phiếu giảm 50.000đ", cost: 200 },
  { id: "r-2", name: "Rửa xe tiêu chuẩn miễn phí", cost: 350 },
  { id: "r-3", name: "Nâng cấp vệ sinh nội thất", cost: 600 },
]

export default function LoyaltyPage() {
  const progress = Math.min(100, Math.round((POINTS / NEXT_TIER_AT) * 100))

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Điểm thưởng thành viên</h1>
        <p className="text-sm text-muted-foreground">
          Tích điểm sau mỗi lần rửa xe và đổi lấy ưu đãi hấp dẫn.
        </p>
      </div>

      <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Điểm hiện có</p>
            <p className="font-mono text-4xl font-bold">{POINTS}</p>
          </div>
          <TierBadge tier="GOLD" className="bg-primary-foreground/15 text-primary-foreground" />
        </div>
        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs opacity-80">
            <span>Hạng Vàng</span>
            <span>Hạng Bạch kim ({NEXT_TIER_AT} điểm)</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-primary-foreground/20">
            <div
              className="h-full rounded-full bg-primary-foreground"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs opacity-80">
            Ưu đãi hiện tại: giảm {TIER_META.GOLD.discount}% mỗi đơn dịch vụ.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Đổi quà</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {rewards.map((r) => {
            const enough = POINTS >= r.cost
            return (
              <div key={r.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Gift className="size-5" />
                </span>
                <p className="mt-3 flex-1 font-medium text-foreground">{r.name}</p>
                <p className="mt-2 font-mono text-sm font-semibold text-primary">{r.cost} điểm</p>
                <Button
                  size="sm"
                  variant={enough ? "default" : "outline"}
                  disabled={!enough}
                  className="mt-3"
                >
                  {enough ? "Đổi ngay" : "Chưa đủ điểm"}
                </Button>
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Lịch sử điểm</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {LOYALTY_ACTIVITIES.map((a) => {
            const positive = a.points > 0
            return (
              <div key={a.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span
                    className={
                      positive
                        ? "flex size-9 items-center justify-center rounded-full bg-success/10 text-success"
                        : "flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                    }
                  >
                    {positive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(a.date)}</p>
                  </div>
                </div>
                <span
                  className={
                    positive
                      ? "font-mono text-sm font-semibold text-success"
                      : "font-mono text-sm font-semibold text-destructive"
                  }
                >
                  {positive ? "+" : ""}
                  {a.points}
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
