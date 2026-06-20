import apiClient from "./client"
import type { ApiResponse } from "@/lib/types"

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export interface ManagerCustomer {
  userId: string
  customerId: string
  fullName: string
  phone: string
  email: string
  membershipTier: string
  trustScore: number
  loyaltyPoints: number
  status: "ACTIVE" | "INACTIVE" | "BANNED" | "SHADOW"
}

// ─────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────

/**
 * GET /manager/customers
 * Danh sách toàn bộ khách hàng
 */
export async function getManagerCustomers(): Promise<ManagerCustomer[]> {
  const { data } = await apiClient.get<ApiResponse<ManagerCustomer[]>>("/manager/customers")
  return data.data || []
}

/**
 * GET /manager/customers/search?phone=...
 * Tìm khách theo SĐT (dùng cho Walk-in)
 */
export async function searchCustomerByPhone(phone: string): Promise<ManagerCustomer | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<ManagerCustomer>>(
      "/manager/customers/search",
      { params: { phone } }
    )
    return data.data || null
  } catch {
    return null
  }
}

/**
 * POST /manager/customers/{customerId}/trust-score/adjust
 * Điều chỉnh trust score thủ công
 */
export async function adjustManagerTrustScore(
  customerId: string,
  scoreChange: number,
  reason: string
): Promise<void> {
  await apiClient.post(`/manager/customers/${customerId}/trust-score/adjust`, {
    scoreChange,
    reason,
  })
}

/**
 * POST /manager/customers/{customerId}/loyalty/adjust
 * Điều chỉnh điểm loyalty thủ công
 */
export async function adjustManagerLoyalty(
  customerId: string,
  points: number,
  reason: string
): Promise<void> {
  await apiClient.post(`/manager/customers/${customerId}/loyalty/adjust`, {
    points,
    reason,
  })
}

/**
 * PUT /manager/customers/{customerId}/unblock
 * Mở khóa tài khoản bị khóa do trust score thấp
 */
export async function unblockManagerCustomer(customerId: string): Promise<void> {
  await apiClient.put(`/manager/customers/${customerId}/unblock`)
}
