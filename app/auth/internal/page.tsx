"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, AlertCircle, ShieldAlert, ArrowLeft } from "lucide-react"
import { signIn, logout, tokenStorage } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// Redirect theo role sau khi đăng nhập thành công
function getRedirectPath(role?: string): string {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "/admin"
    case "MANAGER":
      return "/manager"
    case "CAR_WASHER":
      return "/washer"
    default:
      return "/customer"
  }
}

export default function InternalLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<React.ReactNode>(null)
  const { toast } = useToast()

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

      // Kiểm tra quyền: nếu là CUSTOMER thì từ chối truy cập cổng nội bộ
      if (result.role?.toUpperCase() === "CUSTOMER") {
        setError("Tài khoản khách hàng không được phép truy cập cổng nội bộ. Vui lòng sử dụng cổng đăng nhập khách hàng.")
        // Xóa token đã lưu để tránh giữ phiên đăng nhập không hợp lệ
        tokenStorage.clearAll()
        try {
          await logout()
        } catch {}
        return
      }

      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng quay trở lại cổng nội bộ hệ thống.`,
      })

      // Redirect đến trang tương ứng
      router.push(getRedirectPath(result.role))
    } catch (err: unknown) {
      tokenStorage.clearAll()
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
      const status = axiosErr.response?.status
      const msg = axiosErr.response?.data?.message

      if (status === 401) {
        setError("Email hoặc mật khẩu nhân viên không đúng. Vui lòng thử lại.")
      } else if (msg?.toLowerCase().includes("banned") || msg?.toLowerCase().includes("cấm")) {
        setError("Tài khoản nhân viên này đã bị cấm hoạt động.")
      } else if (msg?.toLowerCase().includes("suspend") || msg?.toLowerCase().includes("khóa")) {
        setError("Tài khoản nhân viên này đã bị tạm khóa.")
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
    <div className="flex flex-col gap-6">
      {/* Portal Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <ShieldAlert className="size-4.5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Cổng Nhân Viên</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Đăng nhập{" "}
          <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            hệ thống
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Dành riêng cho Quản trị viên, Quản lý và Nhân viên rửa xe.
        </p>
      </div>

      {/* Warning Box */}
      <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 text-xs text-amber-500 leading-relaxed">
        🔒 Đây là hệ thống quản trị nội bộ của AutoWash Pro. Mọi hành vi truy cập trái phép sẽ bị ghi lại lịch sử hoạt động và xử lý theo quy định.
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
            Email nội bộ
          </label>
          <input
            id="email"
            type="email"
            placeholder="nhanvien@autowash.pro"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            className="rounded-xl border border-border bg-card/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all w-full placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Mật khẩu hệ thống
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu hệ thống"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              className="rounded-xl border border-border bg-card/60 px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all w-full placeholder:text-muted-foreground/60"
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
          type="submit"
          disabled={isLoading || !email || !password}
          className="mt-2 w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-[0_4px_20px_rgba(245,158,11,0.15)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xác thực...
            </>
          ) : (
            "Xác thực nội bộ"
          )}
        </button>
      </form>

      {/* Back link to Customer Login */}
      <div className="text-center mt-2 border-t border-border pt-4">
        <Link
          href="/auth/dang-nhap"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Đăng nhập Cổng khách hàng
        </Link>
      </div>
    </div>
  )
}
