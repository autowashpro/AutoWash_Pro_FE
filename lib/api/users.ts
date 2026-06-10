// ============================================================
// AutoWash Pro — Users API (Customer profile, Vehicles, Admin)
// ============================================================

import apiClient from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  CustomerProfile,
  UpdateProfileRequest,
  Vehicle,
  CreateVehicleRequest,
  CarWasher,
  AdminUser,
  UserRole,
  BookingReport,
  WasherReport,
} from '@/lib/types'

// ─────────────────────────────────────────
// CUSTOMER — Profile
// ─────────────────────────────────────────

/**
 * GET /customer/profile
 */
export async function getMyProfile(): Promise<CustomerProfile> {
  const { data } = await apiClient.get<ApiResponse<CustomerProfile>>('/customer/profile')
  return data.data
}

/**
 * PUT /customer/profile
 */
export async function updateProfile(payload: UpdateProfileRequest): Promise<CustomerProfile> {
  const { data } = await apiClient.put<ApiResponse<CustomerProfile>>(
    '/customer/profile',
    payload,
  )
  return data.data
}

// ─────────────────────────────────────────
// CUSTOMER — Vehicles (Xe)
// ─────────────────────────────────────────

/**
 * GET /customer/vehicles
 */
export async function getMyVehicles(): Promise<Vehicle[]> {
  const { data } = await apiClient.get<ApiResponse<Vehicle[]>>('/customer/vehicles')
  return data.data
}

/**
 * POST /customer/vehicles
 */
export async function createVehicle(payload: CreateVehicleRequest & { is_default?: boolean }): Promise<Vehicle> {
  const { data } = await apiClient.post<ApiResponse<Vehicle>>('/customer/vehicles', payload)
  return data.data
}

/**
 * PUT /customer/vehicles/:vehicle_id
 */
export async function updateVehicle(
  vehicleId: string,
  payload: Partial<CreateVehicleRequest> & { is_default?: boolean },
): Promise<Vehicle> {
  const { data } = await apiClient.put<ApiResponse<Vehicle>>(
    `/customer/vehicles/${vehicleId}`,
    payload,
  )
  return data.data
}

/**
 * DELETE /customer/vehicles/:vehicle_id
 */
export async function deleteVehicle(vehicleId: string): Promise<void> {
  await apiClient.delete(`/customer/vehicles/${vehicleId}`)
}

// ─────────────────────────────────────────
// MANAGER — Customers & Car Washers
// ─────────────────────────────────────────

/**
 * GET /manager/customers/:customer_id
 * Xem hồ sơ khách hàng (Manager view)
 */
export async function getCustomerProfile(customerId: string): Promise<CustomerProfile> {
  const { data } = await apiClient.get<ApiResponse<CustomerProfile>>(
    `/manager/customers/${customerId}`,
  )
  return data.data
}

/**
 * GET /manager/customers/search?phone=...
 * Tìm khách hàng theo số điện thoại (dùng trong Walk-in form)
 */
export async function searchCustomerByPhone(phone: string): Promise<CustomerProfile | null> {
  const { data } = await apiClient.get<ApiResponse<CustomerProfile>>(
    '/manager/customers/search',
    { params: { phone } },
  )
  return data.data
}



/**
 * POST /manager/customers/:customer_id/trust-score/adjust
 * Điều chỉnh Trust Score thủ công
 */
export async function adjustTrustScore(
  customerId: string,
  scoreChange: number,
  reason: string,
): Promise<void> {
  await apiClient.post(`/manager/customers/${customerId}/trust-score/adjust`, {
    score_change: scoreChange,
    reason,
  })
}

/**
 * POST /manager/customers/:customer_id/loyalty/adjust
 * Điều chỉnh điểm loyalty thủ công (bồi thường khiếu nại...)
 */
export async function adjustLoyaltyPoints(
  customerId: string,
  points: number,
  reason: string,
): Promise<void> {
  await apiClient.post(`/manager/customers/${customerId}/loyalty/adjust`, {
    points,
    reason,
  })
}

/**
 * PUT /manager/customers/:customer_id/unblock
 * Mở khóa tài khoản bị block bởi Trust Score thấp
 */
export async function unblockCustomer(customerId: string): Promise<void> {
  await apiClient.put(`/manager/customers/${customerId}/unblock`)
}

/**
 * GET /manager/car-washers
 * Danh sách Car Washer (dùng trong dropdown assign)
 */
export async function getCarWashers(): Promise<CarWasher[]> {
  const { data } = await apiClient.get<ApiResponse<CarWasher[]>>('/manager/washers')
  return data.data
}

// ─────────────────────────────────────────
// MANAGER — Reports
// ─────────────────────────────────────────

/**
 * GET /manager/reports/bookings?from=...&to=...
 */
export async function getBookingReport(from: string, to: string): Promise<BookingReport> {
  const { data } = await apiClient.get<ApiResponse<BookingReport>>(
    '/manager/reports/bookings',
    { params: { from, to } },
  )
  return data.data
}

/**
 * GET /manager/reports/car-washers?from=...&to=...
 */
export async function getWasherReport(from: string, to: string): Promise<WasherReport[]> {
  const { data } = await apiClient.get<ApiResponse<WasherReport[]>>(
    '/manager/reports/car-washers',
    { params: { from, to } },
  )
  return data.data
}

// ─────────────────────────────────────────
// ADMIN — User Management
// ─────────────────────────────────────────

/**
 * GET /admin/users?role=CUSTOMER&page=1
 */
export async function getAdminUsers(params?: {
  role?: UserRole
  page?: number
  limit?: number
}): Promise<PaginatedResponse<AdminUser>> {
  const { data } = await apiClient.get<PaginatedResponse<AdminUser>>(
    '/admin/users',
    { params },
  )
  return data
}

/**
 * PUT /admin/users/:user_id/status
 * Ban / Unban tài khoản
 */
export async function updateUserStatus(
  userId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED',
): Promise<void> {
  await apiClient.put(`/admin/users/${userId}/status`, { status })
}

/**
 * POST /admin/users
 * Tạo tài khoản Manager / Car Washer
 */
export async function createStaffAccount(payload: {
  full_name: string
  email: string
  phone: string
  role: 'MANAGER' | 'CAR_WASHER'
  password: string
}): Promise<AdminUser> {
  const { data } = await apiClient.post<ApiResponse<AdminUser>>('/admin/users', payload)
  return data.data
}
