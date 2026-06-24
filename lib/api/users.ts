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
  const { data } = await apiClient.get<ApiResponse<any>>(
    '/manager/customers/search',
    { params: { phone } },
  )
  const raw = data.data
  if (!raw) return null
  return {
    user_id: raw.userId || '',
    full_name: raw.fullName || '',
    email: raw.email || '',
    phone: raw.phone || '',
    membership_tier: raw.membershipTier || 'MEMBER',
    total_points: raw.loyaltyPoints || 0,
    trust_score: raw.trustScore ?? 100,
    total_spending_12m: raw.totalSpending12m || 0,
    tier_review_at: raw.tierReviewAt || '',
    booking_window_days: raw.bookingWindowDays || 7,
  }
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
    scoreChange,
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
  const { data } = await apiClient.get<ApiResponse<any>>(
    '/manager/reports/bookings',
    { params: { from, to } },
  )
  const raw = data.data || {}
  return {
    total_bookings: raw.total_bookings ?? raw.totalBookings ?? 0,
    by_status: raw.by_status ?? raw.byStatus ?? {},
    by_type: raw.by_type ?? raw.byType ?? { WASH: 0, FLEX: 0 },
    total_revenue: raw.total_revenue ?? raw.totalRevenue ?? 0,
    dailyBreakdown: (raw.dailyBreakdown || raw.daily_breakdown || []).map((item: any) => ({
      date: item.date ?? '',
      count: item.count ?? item.bookingsCount ?? item.countBookings ?? 0,
      revenue: item.revenue ?? item.totalRevenue ?? item.revenueTotal ?? 0,
    })),
  }
}

/**
 * GET /manager/reports/car-washers?from=...&to=...
 */
export async function getWasherReport(from: string, to: string): Promise<WasherReport[]> {
  const { data } = await apiClient.get<ApiResponse<any[]>>(
    '/manager/reports/car-washers',
    { params: { from, to } },
  )
  return (data.data || []).map((item: any) => ({
    car_washer_id: item.car_washer_id ?? item.carWasherId ?? item.washerId ?? '',
    full_name: item.full_name ?? item.fullName ?? 'Không rõ tên',
    total_assigned: item.total_assigned ?? item.totalAssigned ?? 0,
    total_completed: item.total_completed ?? item.totalCompleted ?? 0,
    avg_overall_score: item.avg_overall_score ?? item.avgOverallScore ?? item.avg_rating ?? item.avgRating ?? 0,
    avg_service_quality_score: item.avg_service_quality_score ?? item.avgServiceQualityScore ?? 0,
  }))
}

// ─────────────────────────────────────────
// ADMIN — User Management
// ─────────────────────────────────────────

/**
 * GET /api/AdminUser?role=CUSTOMER&page=1
 */
export async function getAdminUsers(params?: {
  role?: UserRole
  page?: number
  limit?: number
}): Promise<PaginatedResponse<AdminUser>> {
  const { data } = await apiClient.get<any>(
    '/AdminUser',
    {
      params: {
        page: params?.page,
        size: params?.limit,
        role: params?.role,
      },
    },
  )
  const raw = data.data || {}
  return {
    success: data.success ?? true,
    data: raw.items || [],
    pagination: {
      page: raw.page || 1,
      limit: raw.size || 10,
      total: raw.total_items || 0,
      totalPages: raw.total_pages || 1,
    },
  }
}

/**
 * PATCH /api/AdminUser/:userId/status
 * Ban / Unban tài khoản
 */
export async function updateUserStatus(
  userId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED',
): Promise<void> {
  await apiClient.patch(`/AdminUser/${userId}/status`, { status })
}

/**
 * POST /api/AdminUser/staff
 * Tạo tài khoản Manager / Car Washer
 */
export async function createStaffAccount(payload: {
  full_name: string
  email: string
  phone: string
  role: 'MANAGER' | 'CAR_WASHER'
  password: string
}): Promise<AdminUser> {
  const body = {
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    password: payload.password,
  }
  const { data } = await apiClient.post<ApiResponse<any>>('/AdminUser/staff', body)
  const raw = data.data || {}
  return {
    user_id: raw.user_id || raw.userId || '',
    full_name: raw.full_name || raw.fullName || '',
    email: raw.email || '',
    phone: raw.phone || '',
    role: raw.role || '',
    status: raw.status || '',
    email_verified: raw.email_verified ?? raw.emailVerified ?? true,
  } as any
}

/**
 * DELETE /api/AdminUser/:userId
 * Xóa người dùng (soft delete phía BE)
 */
export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/AdminUser/${userId}`)
}
