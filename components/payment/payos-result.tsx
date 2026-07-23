"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, XCircle, Copy, Check, ListChecks, Home, CreditCard, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface PayOSResultProps {
  forcedStatus?: "success" | "cancel"
}

export function PayOSResultContent({ forcedStatus }: PayOSResultProps) {
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState(false)

  const code = searchParams.get("code") || ""
  const id = searchParams.get("id") || ""
  const cancelParam = searchParams.get("cancel") || ""
  const statusParam = searchParams.get("status") || ""
  const orderCode = searchParams.get("orderCode") || ""

  // Determine if payment is success or canceled
  const isCanceled =
    forcedStatus === "cancel" ||
    cancelParam === "true" ||
    statusParam === "CANCELLED" ||
    statusParam === "FAILED" ||
    (code !== "" && code !== "00")

  const isSuccess = !isCanceled && (forcedStatus === "success" || statusParam === "PAID" || code === "00" || cancelParam === "false")

  const handleCopyOrderCode = () => {
    if (!orderCode) return
    navigator.clipboard.writeText(orderCode)
    setCopied(true)
    toast.success("Đã sao chép mã đơn hàng")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Status Icon */}
        <div className="flex justify-center">
          {isSuccess ? (
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
              <div className="relative flex size-24 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 shadow-xl">
                <CheckCircle2 className="size-14" />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-rose-500/20 blur-xl" />
              <div className="relative flex size-24 items-center justify-center rounded-full bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 shadow-xl">
                <XCircle className="size-14" />
              </div>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {isSuccess ? "Thanh toán thành công! 🎉" : "Thanh toán không thành công"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {isSuccess
              ? "Giao dịch PayOS đã được hoàn tất thành công. Cảm ơn bạn đã sử dụng dịch vụ của AutoWash Pro."
              : "Giao dịch thanh toán qua PayOS đã bị hủy hoặc chưa hoàn thành. Bạn có thể kiểm tra lại trong quản lý."}
          </p>
        </div>

        {/* Transaction Info Box */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="size-4 text-primary" /> Cổng thanh toán
            </span>
            <span className="text-xs font-bold text-foreground bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              PayOS QR
            </span>
          </div>

          {orderCode && (
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground font-medium">Mã đơn hàng (Order Code)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground">{orderCode}</span>
                <button
                  onClick={handleCopyOrderCode}
                  className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors"
                  title="Sao chép"
                >
                  {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>
          )}

          {id && (
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground font-medium">Mã giao dịch PayOS</span>
              <span className="font-mono text-xs font-semibold text-muted-foreground truncate max-w-[180px]" title={id}>
                {id}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground font-medium">Trạng thái</span>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                isSuccess
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400"
              }`}
            >
              <span className={`size-1.5 rounded-full ${isSuccess ? "bg-emerald-500" : "bg-rose-500"}`} />
              {isSuccess ? "ĐÃ THANH TOÁN (PAID)" : "ĐÃ HỦY (CANCELLED)"}
            </span>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>Giao dịch được bảo mật bởi PayOS & AutoWash Pro</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button asChild className="w-full h-12 rounded-xl text-sm font-semibold shadow-md gap-2">
            <Link href="/customer/lich-hen">
              <ListChecks className="size-4" /> Xem lịch hẹn của tôi
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full h-12 rounded-xl text-sm font-medium gap-2">
            <Link href="/customer">
              <Home className="size-4" /> Trở về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
