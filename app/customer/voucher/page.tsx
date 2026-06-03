"use client"

import { useState } from "react"
import { Copy, Check, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VOUCHERS, formatDate, formatVND } from "@/lib/data"
import { GenericBadge } from "@/components/status-badge"

const TABS = ["Đang dùng được", "Đã dùng", "Hết hạn"] as const

export default function MyVouchersPage() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Đang dùng được")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const statusMap: Record<typeof TABS[number], Array<typeof VOUCHERS[0]["status"]>> = {
    "Đang dùng được": ["active"],
    "Đã dùng": ["used"],
    "Hết hạn": ["expired"],
  }

  const filteredVouchers = VOUCHERS.filter((v) =>
    statusMap[activeTab].includes(v.status)
  )

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Voucher của tôi</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý các voucher và mã giảm giá của bạn.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            <span className="ml-2 rounded-full bg-muted px-2 text-xs">
              {VOUCHERS.filter((v) =>
                statusMap[tab].includes(v.status)
              ).length}
            </span>
          </button>
        ))}
      </div>

      {/* Voucher cards */}
      <div className="space-y-3">
        {filteredVouchers.length > 0 ? (
          filteredVouchers.map((voucher) => {
            const discountDisplay =
              voucher.discountType === "fixed"
                ? formatVND(voucher.discountValue)
                : `${voucher.discountValue}%`

            const statusConfig = {
              active: { label: "Đang dùng", tone: "success" as const },
              used: { label: "Đã dùng", tone: "muted" as const },
              expired: { label: "Hết hạn", tone: "danger" as const },
            }

            const config = statusConfig[voucher.status]

            return (
              <div
                key={voucher.id}
                className={`rounded-2xl border p-4 transition-all ${
                  voucher.status === "active"
                    ? "border-border bg-card hover:border-primary/30"
                    : "border-border/50 bg-muted/30"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Title + Code */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{voucher.title}</h3>
                      <GenericBadge label={config.label} tone={config.tone} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Giảm {discountDisplay} • Từ {voucher.createdFrom}
                    </p>

                    {/* Code */}
                    <div
                      className={`rounded-lg border p-3 font-mono text-sm font-bold tracking-wider flex items-center justify-between gap-2 ${
                        voucher.status === "active"
                          ? "border-primary/30 bg-primary/5 text-primary"
                          : "border-border/50 bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <span className="break-all">{voucher.code}</span>
                      <button
                        onClick={() => handleCopy(voucher.code, voucher.id)}
                        disabled={voucher.status !== "active"}
                        className="shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {copiedId === voucher.id ? (
                          <Check className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right: Expiry + Button */}
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="size-4" />
                      HSD: {formatDate(voucher.expiryDate)}
                    </div>
                    {voucher.status === "active" && (
                      <Button
                        size="sm"
                        onClick={() => handleCopy(voucher.code, voucher.id)}
                        className="w-full sm:w-auto"
                      >
                        {copiedId === voucher.id ? "Đã copy!" : "Copy mã"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-xl border border-border/50 bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {activeTab === "Đang dùng được"
                ? "Bạn chưa có voucher nào. Hãy đổi điểm để nhận voucher!"
                : `Không có voucher ${activeTab.toLowerCase()}.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
