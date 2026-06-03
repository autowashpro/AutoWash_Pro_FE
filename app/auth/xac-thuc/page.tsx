"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OTPPage() {
  const router = useRouter()
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

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
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only keep last digit
    setOtp(newOtp)

    // Auto-focus next input
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
      inputRefs.current[5]?.focus()
    }
  }

  const handleResend = useCallback(() => {
    setCountdown(60)
    setCanResend(false)
    // Would trigger resend API call here
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.join("").length !== 6) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    router.push("/customer")
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
          Nhập mã 6 số đã gửi đến email của bạn
        </p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* OTP Inputs */}
        <div
          className="flex justify-center gap-2 sm:gap-3"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-14 w-11 rounded-xl border-2 border-border bg-card text-center text-xl font-semibold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring sm:h-16 sm:w-14 sm:text-2xl"
              aria-label={`Số thứ ${index + 1}`}
            />
          ))}
        </div>

        {/* Resend link */}
        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Gửi lại mã
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Gửi lại mã ({countdown}s)
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
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

      {/* Helper text */}
      <p className="text-center text-xs text-muted-foreground">
        Không nhận được mã? Kiểm tra thư mục spam hoặc{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          gửi lại
        </button>
      </p>
    </div>
  )
}
