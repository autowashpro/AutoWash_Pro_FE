"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { googleLogin, tokenStorage, logout } from "@/lib/api"

interface GoogleLoginButtonProps {
  onError?: (errorMessage: string) => void
  text?: "signin_with" | "signup_with" | "continue_with"
  className?: string
}

export function GoogleLoginButton({ onError, text = "signin_with", className = "" }: GoogleLoginButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)

    try {
      // 1. Popup Đăng nhập bằng Google qua Firebase Web SDK
      const userCredential = await signInWithPopup(auth, googleProvider)
      const user = userCredential.user

      // 2. Lấy Firebase ID Token từ người dùng
      const idToken = await user.getIdToken(true)

      if (!idToken) {
        onError?.("Không lấy được token xác thực từ Firebase. Vui lòng thử lại.")
        return
      }

      // 3. Gửi Firebase ID Token lên Backend .NET (Backend dùng VerifyIdTokenAsync)
      const result = await googleLogin({ idToken })

      if (!result.success) {
        onError?.(result.message || "Đăng nhập bằng Google thất bại từ máy chủ.")
        return
      }

      // 4. Kiểm tra quyền: Cổng này chỉ dành cho CUSTOMER
      if (result.role && result.role.toUpperCase() !== "CUSTOMER") {
        onError?.("Tài khoản của bạn là tài khoản nhân viên/quản trị. Vui lòng sử dụng Cổng nội bộ để đăng nhập.")
        tokenStorage.clearAll()
        try {
          await logout()
        } catch {}
        return
      }

      // 5. Đăng nhập thành công → Redirect sang cổng Customer
      router.push("/customer")
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }
      const axiosErr = err as { response?: { data?: { message?: string } } }

      const code = firebaseError.code
      const msg = axiosErr.response?.data?.message || firebaseError.message

      if (code === "auth/popup-closed-by-user") {
        // Người dùng tự bấm đóng popup -> Không cần hiện lỗi đỏ
        return
      } else if (code === "auth/unauthorized-domain") {
        onError?.("Domain hiện tại chưa được cấp phép trên Firebase Console (Authentication > Settings > Authorized domains).")
      } else if (code === "auth/operation-not-allowed") {
        onError?.("Tính năng Đăng nhập bằng Google chưa được bật trên Firebase Console (Authentication > Sign-in method).")
      } else if (code === "auth/invalid-api-key") {
        onError?.("API Key của Firebase chưa đúng. Vui lòng kiểm tra lại NEXT_PUBLIC_FIREBASE_API_KEY.")
      } else if (msg) {
        onError?.(msg)
      } else {
        onError?.("Đã xảy ra lỗi khi đăng nhập bằng Google. Vui lòng thử lại sau.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const buttonLabel = text === "signup_with" ? "Đăng ký bằng Google" : "Tiếp tục với Google"

  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full h-11 border border-border bg-card/80 hover:bg-muted/80 text-foreground text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-xs hover:border-primary/40 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Đang xác thực...</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{buttonLabel}</span>
          </>
        )}
      </button>
    </div>
  )
}
