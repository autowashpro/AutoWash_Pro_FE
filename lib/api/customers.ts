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
  totalBookings: number
  status: "ACTIVE" | "INACTIVE" | "BANNED" | "SHADOW"
}

export interface ManagerCustomerDetail extends ManagerCustomer {
  registeredAt?: string
}

/** Normalize BE PascalCase → camelCase (ASP.NET default serialization) */
function normalizeCustomer(c: any): ManagerCustomer {
  return {
    userId:        c.userId        || c.UserId        || "",
    customerId:    c.customerId    || c.CustomerId    || "",
    fullName:      c.fullName      || c.FullName      || "",
    phone:         c.phone         || c.Phone         || "",
    email:         c.email         || c.Email         || "",
    membershipTier: c.membershipTier || c.MembershipTier || "MEMBER",
    trustScore:    c.trustScore    ?? c.TrustScore    ?? 80,
    loyaltyPoints: c.loyaltyPoints ?? c.LoyaltyPoints ?? 0,
    totalBookings: c.totalBookings ?? c.TotalBookings ?? 0,
    status:        c.status        || c.Status        || "ACTIVE",
  }
}

// ─────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────

/**
 * GET /manager/customers
 * Danh sách toàn bộ khách hàng (normalize PascalCase → camelCase)
 */
export async function getManagerCustomers(): Promise<ManagerCustomer[]> {
  const { data } = await apiClient.get<ApiResponse<any>>("/manager/customers", {
    params: { pageNumber: 1, pageSize: 1000 }
  })
  const rawData = data.data || {}
  const raw: any[] = Array.isArray(rawData.items)
    ? rawData.items
    : Array.isArray(data.data)
      ? data.data
      : []
  return raw.map(normalizeCustomer)
}

/**
 * GET /manager/customers/{customerId}
 * Chi tiết 1 khách hàng
 */
export async function getManagerCustomerDetail(customerId: string): Promise<ManagerCustomerDetail> {
  const { data } = await apiClient.get<ApiResponse<any>>(`/manager/customers/${customerId}`)
  const c = data.data || {}
  return {
    ...normalizeCustomer(c),
    registeredAt: c.registeredAt || c.RegisteredAt,
  }
}

/**
 * GET /manager/customers/{customerId}/bookings
 * Lịch sử booking của khách
 */
export async function getManagerCustomerBookings(customerId: string): Promise<any[]> {
  const { data } = await apiClient.get<ApiResponse<any>>(`/manager/customers/${customerId}/bookings`)
  return Array.isArray(data.data) 
    ? data.data 
    : (Array.isArray(data?.data?.items) ? data.data.items : [])
}

/**
 * GET /manager/customers/search?phone=...
 * Tìm khách theo SĐT
 */
export async function searchCustomerByPhone(phone: string): Promise<ManagerCustomer | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<any>>(
      "/manager/customers/search",
      { params: { phone } }
    )
    if (!data.data) return null
    return normalizeCustomer(data.data)
  } catch {
    return null
  }
}

/**
 * POST /manager/customers/{customerId}/trust-score/adjust
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
 */
export async function unblockManagerCustomer(customerId: string): Promise<void> {
  await apiClient.put(`/manager/customers/${customerId}/unblock`)
}
