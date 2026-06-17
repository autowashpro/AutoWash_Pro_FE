"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { signIn, logout, tokenStorage } from "@/lib/api"

// Redirect theo role sau khi đăng nhập thành công
function getRedirectPath(role?: string): string {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "/admin"
    case "MANAGER":
      return "/manager"
    case "CAR_WASHER":
      return "/washer"
    case "CUSTOMER":
    default:
      return "/customer"
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<React.ReactNode>(null)

  // Form state — BE dùng email + password
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn({ email, password })

      if (!result.success) {
        if (result.message?.includes("chưa xác minh email") || result.message?.includes("OTP")) {
          setError(
            <span>
              Tài khoản chưa được xác minh email.{" "}
              <Link href={`/auth/xac-thuc?email=${encodeURIComponent(email)}`} className="font-bold underline hover:text-sky-300">
                Nhấp vào đây để xác thực OTP
              </Link>
            </span>
          )
        } else {
          setError(result.message || "Đăng nhập thất bại. Vui lòng thử lại.")
        }
        return
      }

      // Kiểm tra quyền: Cổng này chỉ dành cho CUSTOMER
      if (result.role && result.role.toUpperCase() !== "CUSTOMER") {
        setError("Tài khoản của bạn là tài khoản nhân viên/quản trị. Vui lòng sử dụng Cổng nhân viên để đăng nhập.")
        tokenStorage.clearAll()
        try {
          await logout()
        } catch {}
        return
      }

      // Redirect theo role trả về từ BE
      router.push(getRedirectPath(result.role))
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
      const status = axiosErr.response?.status
      const msg = axiosErr.response?.data?.message

      if (status === 401) {
        setError("Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.")
      } else if (msg?.toLowerCase().includes("banned") || msg?.toLowerCase().includes("cấm")) {
        setError("Tài khoản của bạn đã bị cấm. Vui lòng liên hệ hỗ trợ.")
      } else if (msg?.toLowerCase().includes("suspend") || msg?.toLowerCase().includes("khóa")) {
        setError("Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ hỗ trợ.")
      } else if (!axiosErr.response) {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.")
      } else {
        setError(msg ?? "Đã xảy ra lỗi. Vui lòng thử lại sau.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Chào mừng{" "}
          <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
            trở lại
          </span>
        </h1>
        <p className="text-muted-foreground">
          Đăng nhập để tiếp tục đặt lịch rửa xe
        </p>
      </div>

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
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="email@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            className="rounded-xl border border-border bg-card/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-full placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Mật khẩu
            </label>
            <Link
              href="/auth/quen-mat-khau"
              className="text-sm font-medium text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
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
        </div>

        {/* Submit */}
        <button
          id="btn-login"
          type="submit"
          disabled={isLoading || !email || !password}
          className="mt-2 w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-sky-500 text-white shadow-[0_0_0_1px_rgba(56,189,248,0.15),0_4px_24px_rgba(56,189,248,0.20)] hover:shadow-[0_0_0_1px_rgba(56,189,248,0.20),0_8px_48px_rgba(56,189,248,0.28)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">Hoặc</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Footer — Register link as outlined button */}
      <div className="text-center flex flex-col gap-3">
        <div>
          <p className="mb-3 text-sm text-muted-foreground">Chưa có tài khoản?</p>
          <Link
            href="/auth/dang-ky"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-semibold text-foreground transition-all hover:bg-muted/60 hover:border-primary/40 hover:text-primary"
          >
            Đăng ký ngay
          </Link>
        </div>
        <div className="border-t border-border pt-3 mt-1">
          <Link
            href="/auth/internal"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            Bạn là nhân viên? Đăng nhập Cổng nội bộ
          </Link>
        </div>
      </div>
    </div>
  )
}
