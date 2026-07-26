"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { updateProfile } from "@/lib/api/users"

interface CompleteGoogleProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName?: string
  onComplete?: () => void
}

export function CompleteGoogleProfileModal({
  open,
  onOpenChange,
  userName,
  onComplete,
}: CompleteGoogleProfileModalProps) {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!phone) {
      setError("Số điện thoại không được để trống.")
      return
    }

    const phoneRegex = /^0\d{9}$/
    if (!phoneRegex.test(phone)) {
      setError("Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.")
      return
    }

    if (!birthMonth) {
      setError("Vui lòng chọn tháng sinh của bạn.")
      return
    }

    const monthNum = parseInt(birthMonth, 10)
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      setError("Tháng sinh không hợp lệ.")
      return
    }

    setIsLoading(true)

    try {
      await updateProfile({
        full_name: userName || "Khách hàng",
        phone: phone.trim(),
        birth_month: monthNum,
      })

      onOpenChange(false)
      if (onComplete) {
        onComplete()
      } else {
        router.push("/customer")
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr.response?.data?.message
      setError(msg || "Không thể cập nhật thông tin. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md border-border bg-card p-6">
        <DialogHeader className="gap-2 text-left">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="size-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Bổ sung thông tin</span>
          </div>
          <DialogTitle className="text-xl font-extrabold text-foreground">
            Chào mừng bạn đến với AutoWash Pro! 🎉
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Để hoàn tất đăng ký và nhận quà ưu đãi sinh nhật, vui lòng điền thêm **Số điện thoại** và **Tháng sinh** của bạn.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive animate-fade-in"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2" noValidate>
          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="modal-phone" className="text-sm font-medium text-foreground">
              Số điện thoại <span className="text-destructive">*</span>
            </label>
            <input
              id="modal-phone"
              type="tel"
              placeholder="0901234567"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(null) }}
              className="rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-full placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Birth Month */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="modal-birth-month" className="text-sm font-medium text-foreground">
              Tháng sinh <span className="text-destructive">*</span>
            </label>
            <select
              id="modal-birth-month"
              required
              value={birthMonth}
              onChange={(e) => { setBirthMonth(e.target.value); setError(null) }}
              className="rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-full text-foreground"
            >
              <option value="" disabled>Chọn tháng sinh của bạn</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Nhận voucher quà tặng vào tháng sinh nhật
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !phone || !birthMonth}
            className="mt-2 w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-sky-500 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu thông tin...
              </>
            ) : (
              "Hoàn tất & Vào trang chủ"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
