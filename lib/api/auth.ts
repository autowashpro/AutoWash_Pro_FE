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

// ─────────────────────────────────────────
// CÁC ENDPOINT AUTH BỔ SUNG KHỚP VỚI SWAGGER
// ─────────────────────────────────────────

export interface ChangePasswordRequest {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordByLinkRequest {
  newPassword?: string
  confirmPassword?: string
}

export interface GoogleLoginRequest {
  idToken: string
}

export interface CreateStaffRequest {
  fullName: string
  email: string
  phone?: string
  password?: string
  branchId?: string
  role: number // Enum UserRole (0: ADMIN, 1: MANAGER, 2: WASHER, etc.)
}

export interface UpdatePhoneRequest {
  phone: string
}

export interface CreateShadowCustomerRequest {
  phone: string
  fullName: string
}

export interface ClaimAccountRequest {
  claim_token: string
  email: string
  password?: string
}

export interface ResendClaimLinkRequest {
  phone: string
  email: string
}

/**
 * POST /api/auth/change-password
 * Đổi mật khẩu cho người dùng hiện tại (yêu cầu Authorization Header)
 */
export async function changePassword(payload: ChangePasswordRequest): Promise<{ message: string }> {
  const { data } = await apiClient.post('/auth/change-password', payload)
  return data
}

/**
 * POST /api/auth/forgot-password
 * Gửi link reset mật khẩu qua email
 */
export async function forgotPassword(payload: ForgotPasswordRequest): Promise<{ message: string }> {
  const { data } = await apiClient.post('/auth/forgot-password', payload)
  return data
}

/**
 * POST /api/auth/reset-password-by-link
 * Reset mật khẩu bằng link xác thực (token được lấy từ query URL)
 */
export async function resetPasswordByLink(token: string, payload: ResetPasswordByLinkRequest): Promise<{ message: string }> {
  const { data } = await apiClient.post('/auth/reset-password-by-link', payload, {
    params: { token }
  })
  return data
}

/**
 * POST /api/auth/google-login
 * Đăng nhập bằng Google IdToken
 */
export async function googleLogin(payload: GoogleLoginRequest): Promise<LoginResult> {
  const { data } = await apiClient.post<LoginResult>('/auth/google-login', payload, {
    withCredentials: true,
  })

  if (data.success && data.token) {
    tokenStorage.setAccess(data.token)
    if (data.role) tokenStorage.setRole(data.role)
  }

  return data
}

/**
 * POST /api/auth/create-staff
 * Admin tạo tài khoản nhân viên (yêu cầu quyền ADMIN)
 */
export async function createStaff(payload: CreateStaffRequest): Promise<{ message: string }> {
  const { data } = await apiClient.post('/auth/create-staff', payload)
  return data
}

/**
 * PUT /api/auth/update-phone
 * Cập nhật số điện thoại cho tài khoản hiện tại
 */
export async function updatePhone(payload: UpdatePhoneRequest): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.put('/auth/update-phone', payload)
  return data
}

/**
 * POST /api/auth/shadow-customer
 * Manager tạo tài khoản shadow cho khách vãng lai
 */
export async function createShadowCustomer(payload: CreateShadowCustomerRequest): Promise<{ success: boolean; message: string; businessCode: string }> {
  const { data } = await apiClient.post('/auth/shadow-customer', payload)
  return data
}

/**
 * POST /api/auth/claim-account
 * Liên kết, kích hoạt tài khoản shadow thành tài khoản online chính thức
 */
export async function claimAccount(payload: ClaimAccountRequest): Promise<{ success: boolean; message: string; data?: any }> {
  const { data } = await apiClient.post('/auth/claim-account', payload, {
    withCredentials: true,
  })

  // Nếu claim thành công và trả về token -> lưu vào cookie/storage giống như signin thông thường
  if (data.success && data.data && data.data.token) {
    tokenStorage.setAccess(data.data.token)
    if (data.data.role) tokenStorage.setRole(data.data.role)
  }

  return data
}

/**
 * POST /api/auth/resend-claim-link
 * Gửi lại link claim tài khoản cho khách hàng shadow
 */
export async function resendClaimLink(payload: ResendClaimLinkRequest): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post('/auth/resend-claim-link', payload)
  return data
}
