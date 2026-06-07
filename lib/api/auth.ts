// ============================================================
// AutoWash Pro — Auth API
// Khớp với BE: Group7.SWP391.AutoWashPro.API/AuthController
// ============================================================

import apiClient, { tokenStorage } from './client'

// ─────────────────────────────────────────
// Request / Response types (theo BE DTOs)
// ─────────────────────────────────────────

export interface SignUpRequest {
  fullName: string
  email: string
  phone?: string
  password: string
}

export interface SignUpResult {
  success: boolean
  message: string
}

export interface OtpVerifyRequest {
  email: string    // BE dùng email, không phải user_id
  otp: string
}

export interface OtpVerifyResult {
  success: boolean
  message: string
}

export interface LoginRequest {
  email: string    // BE dùng email, không phải phone
  password: string
}

export interface LoginResult {
  success: boolean
  message: string
  token?: string        // access token (BE gọi là "token")
  refreshToken?: string // BE set vào httpOnly cookie, field này thường null
  role?: string
  needUpdateProfile?: boolean
}

// ─────────────────────────────────────────
// Auth API functions
// ─────────────────────────────────────────

/**
 * POST /api/auth/signup
 * Đăng ký tài khoản mới → BE gửi OTP về email
 */
export async function signUp(payload: SignUpRequest): Promise<SignUpResult> {
  const { data } = await apiClient.post<SignUpResult>('/auth/signup', payload)
  return data
}

/**
 * POST /api/auth/verify-otp
 * Xác thực OTP sau đăng ký. Chỉ trả success/message, chưa có token.
 * User phải signin lại sau khi verify.
 */
export async function verifyOtp(payload: OtpVerifyRequest): Promise<OtpVerifyResult> {
  const { data } = await apiClient.post<OtpVerifyResult>('/auth/verify-otp', payload)
  return data
}

/**
 * POST /api/auth/resend-otp
 * Gửi lại OTP — body: { email }
 */
export async function resendOtp(email: string): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post('/auth/resend-otp', { email })
  return data
}

/**
 * POST /api/auth/signin
 * Đăng nhập → trả access token (body) + refresh token (httpOnly cookie)
 */
export async function signIn(payload: LoginRequest): Promise<LoginResult> {
  const { data } = await apiClient.post<LoginResult>('/auth/signin', payload, {
    withCredentials: true, // Cần để nhận cookie refreshToken từ BE
  })

  if (data.success && data.token) {
    tokenStorage.setAccess(data.token)
    if (data.role) tokenStorage.setRole(data.role)
  }

  return data
}

/**
 * POST /api/auth/renew-token
 * Refresh access token — BE đọc refreshToken từ httpOnly cookie tự động
 */
export async function renewToken(): Promise<LoginResult> {
  const { data } = await apiClient.post<LoginResult>('/auth/renew-token', {}, {
    withCredentials: true,
  })

  if (data.success && data.token) {
    tokenStorage.setAccess(data.token)
    if (data.role) tokenStorage.setRole(data.role)
  }

  return data
}

/**
 * POST /api/auth/logout
 * Đăng xuất — xóa refreshToken cookie phía BE + xóa local storage
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout', {}, { withCredentials: true })
  } finally {
    tokenStorage.clearAll()
  }
}

/**
 * GET /api/auth/me
 * Lấy thông tin user hiện tại từ JWT token
 */
export async function getMe() {
  const { data } = await apiClient.get('/auth/me')
  return data
}
