"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    router.push("/auth/xac-thuc")
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Họ và tên
          </label>
          <input
            id="name"
            type="text"
            placeholder="Nguyễn Văn A"
            required
            className="input"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="email@example.com"
            required
            className="input"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-foreground"
          >
            Số điện thoại
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="0901234567"
            required
            className="input"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Tối thiểu 8 ký tự"
              required
              minLength={8}
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirm"
            className="text-sm font-medium text-foreground"
          >
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              required
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
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
        <Link
          href="/auth/dang-nhap"
          className="font-semibold text-primary hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
