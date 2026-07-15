"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react"
import { resetPasswordByLink } from "@/lib/api"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!token) {
      setError("Mã xác thực (Token) không hợp lệ hoặc đã bị thiếu từ link email.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.")
      return
    }

    // BE yêu cầu: ít nhất 6 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/
    if (!passwordRegex.test(newPassword)) {
      setError("Mật khẩu phải có ít nhất 6 ký tự, gồm 1 chữ hoa, 1 số và 1 ký tự đặc biệt (vd: Abc@123).")
      return
    }

    setIsLoading(true)

    try {
      const result = await resetPasswordByLink(token, {
        newPassword,
        confirmPassword,
      })

      setSuccessMsg(result.message || "Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...")
      setNewPassword("")
      setConfirmPassword("")
      
      // Chuyển hướng sau 2 giây
      setTimeout(() => {
        router.push("/auth/dang-nhap")
      }, 2000)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
      const status = axiosErr.response?.status
      const msg = axiosErr.response?.data?.message

      if (status === 400 || msg?.toLowerCase().includes("hết hạn") || msg?.toLowerCase().includes("expired") || msg?.toLowerCase().includes("invalid")) {
        setError(msg ?? "Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu lại.")
      } else if (!axiosErr.response) {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.")
      } else {
        setError(msg ?? "Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto border border-destructive/20 animate-pulse">
          <AlertCircle className="size-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Liên kết không hợp lệ</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thiếu mã xác thực (Token) đặt lại mật khẩu. Vui lòng nhấp vào chính xác liên kết trong email được gửi đến bạn hoặc yêu cầu lại liên kết mới.
          </p>
        </div>
        <Link
          href="/auth/quen-mat-khau"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/95 transition-all w-full mt-4"
        >
          Yêu cầu liên kết mới
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-md">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="size-4.5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Bảo mật tài khoản</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Đặt lại{" "}
          <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
            mật khẩu
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Tạo mật khẩu mới cho tài khoản của bạn để đăng nhập lại
        </p>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success animate-fade-in"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive animate-fade-in"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* New Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="new-password" className="text-sm font-medium text-foreground">
            Mật khẩu mới <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="Vd: Abc@123"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(null) }}
              className="rounded-xl border border-border bg-card/60 px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-full placeholder:text-muted-foreground/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Ít nhất 6 ký tự, gồm 1 chữ hoa, 1 số và 1 ký tự đặc biệt
          </p>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
            Xác nhận mật khẩu mới <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              placeholder="Nhập lại mật khẩu mới"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(null) }}
              className="rounded-xl border border-border bg-card/60 px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-full placeholder:text-muted-foreground/60"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !newPassword || !confirmPassword}
          className="mt-2 w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-sky-500 text-white shadow-[0_0_0_1px_rgba(56,189,248,0.15),0_4px_24px_rgba(56,189,248,0.20)] hover:shadow-[0_0_0_1px_rgba(56,189,248,0.20),0_8px_48px_rgba(56,189,248,0.28)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xác minh & cập nhật...
            </>
          ) : (
            "Cập nhật mật khẩu"
          )}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left: Brand + Premium Content */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Deep dark carbon background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#09090f] via-[#0d1017] to-[#0a0e18]" />

        {/* Animated gradient mesh overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/5 blur-3xl" />
          <div className="absolute right-20 top-20 h-48 w-48 rounded-full bg-indigo-500/8 blur-2xl" />
        </div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-10 px-12 text-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_0_32px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform duration-300 border border-white/10 dark:bg-white/95">
              <Image src="/images/logo-awp.png" alt="AutoWash Pro Logo" width={56} height={56} className="size-full object-contain" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">
              AutoWash <span className="text-sky-400">Pro</span>
            </span>
          </Link>

          {/* Tagline */}
          <div className="max-w-sm">
            <p className="text-xl font-semibold text-white/90 leading-snug">
              Bảo mật tuyệt đối.
              <br />
              <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                Hệ thống chuyên nghiệp.
              </span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              Đặt lại mật khẩu của bạn thông qua liên kết bảo mật được gửi đến email cá nhân.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex flex-col bg-background dark:bg-[#09090f]">
        {/* Mobile header */}
        <Link href="/" className="flex items-center justify-center gap-2.5 border-b border-border bg-card dark:bg-[#0d1017] p-4 lg:hidden transition-opacity hover:opacity-80">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-white border border-border/40">
            <Image src="/images/logo-awp.png" alt="AutoWash Pro Logo" width={28} height={28} className="size-full object-contain" />
          </div>
          <span className="text-lg font-bold text-foreground">
            AutoWash <span className="text-primary">Pro</span>
          </span>
        </Link>

        {/* Form container */}
        <div className="flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-12">
          <Suspense
            fallback={
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Đang tải trang đặt lại mật khẩu...</p>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
