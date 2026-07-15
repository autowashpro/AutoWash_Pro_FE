"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import { forgotPassword } from "@/lib/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    // Client-side validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z]{2,})+$/
    if (!emailRegex.test(email)) {
      setError("Email phải đúng định dạng, ví dụ: example@gmail.com.")
      return
    }

    setIsLoading(true)

    try {
      const result = await forgotPassword({ email })

      // BE trả về { success, message } hoặc chỉ { message } tùy endpoint
      // Theo logic AuthService.cs, nó trả về (true, "Link đặt lại mật khẩu đã được gửi tới email.")
      setSuccessMsg(result.message || "Link đặt lại mật khẩu đã được gửi tới email của bạn.")
      setEmail("")
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
      const status = axiosErr.response?.status
      const msg = axiosErr.response?.data?.message

      if (status === 404 || msg?.toLowerCase().includes("không tồn tại") || msg?.toLowerCase().includes("not found")) {
        setError("Email này không tồn tại trong hệ thống. Vui lòng kiểm tra lại.")
      } else if (msg?.toLowerCase().includes("banned") || msg?.toLowerCase().includes("khóa")) {
        setError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.")
      } else if (msg?.toLowerCase().includes("google")) {
        setError("Tài khoản của bạn đăng ký qua Google. Vui lòng sử dụng đăng nhập bằng Google.")
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
          Quên{" "}
          <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
            mật khẩu?
          </span>
        </h1>
        <p className="text-muted-foreground">
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu
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
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Địa chỉ Email
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

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !email}
          className="mt-2 w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-sky-500 text-white shadow-[0_0_0_1px_rgba(56,189,248,0.15),0_4px_24px_rgba(56,189,248,0.20)] hover:shadow-[0_0_0_1px_rgba(56,189,248,0.20),0_8px_48px_rgba(56,189,248,0.28)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang gửi yêu cầu...
            </>
          ) : (
            "Gửi liên kết đặt lại mật khẩu"
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="text-center mt-2 border-t border-border pt-4">
        <Link
          href="/auth/dang-nhap"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Quay lại trang Đăng nhập
        </Link>
      </div>
    </div>
  )
}
