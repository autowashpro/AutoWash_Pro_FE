"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signUp } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state — theo SignUpDto của BE
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Client-side validation
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.")
      return
    }

    // BE yêu cầu: ít nhất 6 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/
    if (!passwordRegex.test(password)) {
      setError("Mật khẩu phải có ít nhất 6 ký tự, 1 chữ hoa, 1 số và 1 ký tự đặc biệt (vd: Abc@123).")
      return
    }

    setIsLoading(true)

    try {
      const result = await signUp({
        fullName,
        email,
        phone: phone || undefined,  // phone là optional theo BE
        password,
      })

      if (!result.success) {
        setError(result.message || "Đăng ký thất bại. Vui lòng thử lại.")
        return
      }

      // Sau khi đăng ký thành công → redirect sang OTP kèm email
      router.push(`/auth/xac-thuc?email=${encodeURIComponent(email)}`)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
      const status = axiosErr.response?.status
      const msg = axiosErr.response?.data?.message

      if (status === 409 || msg?.toLowerCase().includes("đã tồn tại") || msg?.toLowerCase().includes("already")) {
        setError(msg ?? "Email hoặc số điện thoại này đã được đăng ký. Vui lòng dùng thông tin khác.")
      } else if (status === 400) {
        setError(msg ?? "Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.")
      } else if (!axiosErr.response) {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.")
      } else {
        setError(msg ?? "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Tạo tài khoản mới
        </h1>
        <p className="text-muted-foreground">
          Đăng ký để đặt lịch và tích lũy điểm thưởng
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="full-name" className="text-sm font-medium text-foreground">
            Họ và tên <span className="text-destructive">*</span>
          </label>
          <input
            id="full-name"
            type="text"
            placeholder="Nguyễn Văn A"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setError(null) }}
            className="input"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="email@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            className="input"
          />
        </div>

        {/* Phone — optional */}
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Số điện thoại{" "}
            <span className="text-muted-foreground text-xs font-normal">(không bắt buộc)</span>
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="0901234567"
            autoComplete="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(null) }}
            className="input"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Mật khẩu <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Vd: Abc@123"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
            Xác nhận mật khẩu <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(null) }}
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button
          id="btn-register"
          type="submit"
          disabled={isLoading || !fullName || !email || !password || !confirm}
          className="mt-2 h-12 w-full text-base font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang đăng ký...
            </>
          ) : (
            "Đăng ký"
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/auth/dang-nhap" className="font-semibold text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
