"use client"

import { useState, useRef, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { verifyOtp, resendOtp, signIn } from "@/lib/api"

function OTPPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // BE dùng email để verify OTP (không phải user_id)
  const email = searchParams.get("email") ?? ""

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(120) // BE OTP hết hạn sau 2 phút
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Redirect nếu không có email (truy cập trực tiếp)
  useEffect(() => {
    if (!email) {
      router.replace("/auth/dang-ky")
    }
  }, [email, router])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError(null)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "")
    if (pastedData.length === 6) {
      setOtp(pastedData.split(""))
      setError(null)
      inputRefs.current[5]?.focus()
    }
  }

  const handleResend = useCallback(async () => {
    setIsResending(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await resendOtp(email)
      setCountdown(60)
      setCanResend(false)
      setOtp(Array(6).fill(""))
      setSuccessMsg("Đã gửi lại mã OTP về email của bạn.")
      inputRefs.current[0]?.focus()
    } catch {
      setError("Không thể gửi lại mã. Vui lòng thử lại sau.")
    } finally {
      setIsResending(false)
    }
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")
    if (otpCode.length !== 6) return

    setIsLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      // BE verify-otp nhận { email, otp }
      const result = await verifyOtp({ email, otp: otpCode })

      if (!result.success) {
        setError(result.message || "Mã OTP không đúng. Vui lòng thử lại.")
        setOtp(Array(6).fill(""))
        inputRefs.current[0]?.focus()
        return
      }

      // Sau khi verify thành công, tự động đăng nhập redirect
      // (Hoặc hướng dẫn user vào trang login)
      setSuccessMsg("Xác thực thành công! Đang chuyển hướng...")
      setTimeout(() => router.push("/auth/dang-nhap"), 1500)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr.response?.data?.message

      if (msg?.toLowerCase().includes("hết hạn") || msg?.toLowerCase().includes("expired")) {
        setError("Mã OTP đã hết hạn. Vui lòng nhấn \"Gửi lại mã\" để lấy mã mới.")
        setCanResend(true)
        setCountdown(0)
      } else if (msg?.toLowerCase().includes("không đúng") || msg?.toLowerCase().includes("invalid")) {
        setError("Mã OTP không đúng. Vui lòng kiểm tra lại.")
      } else if (!axiosErr.response) {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.")
      } else {
        setError(msg ?? "Đã xảy ra lỗi. Vui lòng thử lại sau.")
      }

      setOtp(Array(6).fill(""))
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const isComplete = otp.every((digit) => digit !== "")

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Xác thực Email
        </h1>
        <p className="text-muted-foreground">
          Nhập mã 6 số đã gửi đến{" "}
          <span className="font-semibold text-foreground">{email}</span>
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive animate-fade-in"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success animate-fade-in"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* OTP Inputs */}
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`h-14 w-11 rounded-xl border-2 bg-card text-center text-xl font-bold text-foreground outline-none transition-all sm:h-16 sm:w-14 sm:text-2xl ${
                error
                  ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-border focus:border-primary focus:ring-2 focus:ring-ring"
              }`}
              aria-label={`Số thứ ${index + 1}`}
            />
          ))}
        </div>

        {/* Resend */}
        <div className="flex items-center justify-center gap-1 text-sm">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-semibold text-primary hover:underline disabled:opacity-50"
            >
              {isResending ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                "Gửi lại mã"
              )}
            </button>
          ) : (
            <p className="text-muted-foreground">
              Gửi lại mã sau{" "}
              <span className="font-semibold tabular-nums text-foreground">{countdown}s</span>
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          id="btn-verify-otp"
          type="submit"
          disabled={!isComplete || isLoading}
          className="h-12 w-full text-base font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xác thực...
            </>
          ) : (
            "Xác nhận"
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Không nhận được mã? Kiểm tra thư mục spam hoặc{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || isResending}
          className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          gửi lại
        </button>
      </p>
    </div>
  )
}

export default function OTPPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Đang tải trang xác thực...</p>
        </div>
      }
    >
      <OTPPageContent />
    </Suspense>
  )
}
