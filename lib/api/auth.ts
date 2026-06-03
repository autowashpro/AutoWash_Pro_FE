// ============================================================
// AutoWash Pro — Auth API
// ============================================================

import apiClient, { tokenStorage } from './client'
import type {
  ApiResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
} from '@/lib/types'

/**
 * POST /auth/register
 * Đăng ký tài khoản mới, nhận user_id để xác thực OTP
 */
export async function register(payload: RegisterRequest): Promise<{ user_id: string; message: string }> {
  const { data } = await apiClient.post<ApiResponse<{ user_id: string; message: string }>>(
    '/auth/register',
    payload,
  )
  return data.data
}

/**
 * POST /auth/verify-otp
 * Xác thực OTP sau đăng ký. Trả về tokens và user info.
 */
export async function verifyOtp(payload: VerifyOtpRequest): Promise<AuthUser> {
  const { data } = await apiClient.post<ApiResponse<AuthUser>>('/auth/verify-otp', payload)
  const authUser = data.data
  // Lưu token vào localStorage ngay sau verify
  tokenStorage.setAccess(authUser.access_token)
  tokenStorage.setRefresh(authUser.refresh_token)
  return authUser
}

/**
 * POST /auth/login
 * Đăng nhập bằng phone + password
 */
export async function login(payload: LoginRequest): Promise<AuthUser> {
  const { data } = await apiClient.post<ApiResponse<AuthUser>>('/auth/login', payload)
  const authUser = data.data
  tokenStorage.setAccess(authUser.access_token)
  tokenStorage.setRefresh(authUser.refresh_token)
  return authUser
}

/**
 * POST /auth/logout
 * Đăng xuất — xóa token phía server và client
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout')
  } finally {
    // Luôn xóa local token dù server có lỗi
    tokenStorage.clearAll()
  }
}

/**
 * POST /auth/refresh-token
 * Gọi thủ công nếu cần. Thường được tự động gọi bởi interceptor.
 */
export async function refreshToken(refreshTk: string): Promise<string> {
  const { data } = await apiClient.post<ApiResponse<{ access_token: string; expires_in: number }>>(
    '/auth/refresh-token',
    { refresh_token: refreshTk },
  )
  const newToken = data.data.access_token
  tokenStorage.setAccess(newToken)
  return newToken
}
