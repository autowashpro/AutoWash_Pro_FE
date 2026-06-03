// ============================================================
// AutoWash Pro — Loyalty & Voucher API
// ============================================================

import apiClient from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  LoyaltyDashboard,
  Reward,
  CustomerVoucher,
  RedeemRewardResponse,
} from '@/lib/types'

/**
 * GET /customer/loyalty
 * Dashboard điểm thưởng + lịch sử giao dịch
 */
export async function getLoyaltyDashboard(): Promise<LoyaltyDashboard> {
  const { data } = await apiClient.get<ApiResponse<LoyaltyDashboard>>('/customer/loyalty')
  return data.data
}

/**
 * GET /rewards/catalog
 * Danh sách reward có thể đổi điểm (public — customer cũng gọi được)
 */
export async function getRewardCatalog(): Promise<Reward[]> {
  const { data } = await apiClient.get<ApiResponse<Reward[]>>('/rewards/catalog')
  return data.data
}

/**
 * POST /customer/loyalty/redeem
 * Đổi điểm lấy voucher
 */
export async function redeemReward(rewardId: string): Promise<RedeemRewardResponse> {
  const { data } = await apiClient.post<ApiResponse<RedeemRewardResponse>>(
    '/customer/loyalty/redeem',
    { reward_id: rewardId },
  )
  return data.data
}

/**
 * GET /customer/rewards?status=ACTIVE
 * Danh sách voucher của customer
 */
export async function getMyVouchers(
  status?: 'ACTIVE' | 'USED' | 'EXPIRED',
): Promise<CustomerVoucher[]> {
  const { data } = await apiClient.get<ApiResponse<CustomerVoucher[]>>(
    '/customer/rewards',
    { params: status ? { status } : undefined },
  )
  return data.data
}

// ─────────────────────────────────────────
// ADMIN — Loyalty Config & Reward CRUD
// ─────────────────────────────────────────

/**
 * GET /admin/loyalty-config
 * Lấy cấu hình loyalty (conversion rate, multipliers, expiry)
 */
export async function getLoyaltyConfig(): Promise<Record<string, unknown>> {
  const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
    '/admin/loyalty-config',
  )
  return data.data
}

/**
 * PUT /admin/loyalty-config
 * Cập nhật cấu hình loyalty
 */
export async function updateLoyaltyConfig(payload: Record<string, unknown>): Promise<void> {
  await apiClient.put('/admin/loyalty-config', payload)
}

/**
 * GET /admin/rewards
 * Danh sách reward (admin view, có thể inactive)
 */
export async function getAdminRewards(): Promise<Reward[]> {
  const { data } = await apiClient.get<ApiResponse<Reward[]>>('/admin/rewards')
  return data.data
}

/**
 * POST /admin/rewards
 * Thêm reward mới
 */
export async function createReward(payload: Omit<Reward, 'reward_id'>): Promise<void> {
  await apiClient.post('/admin/rewards', payload)
}

/**
 * PUT /admin/rewards/:reward_id
 * Cập nhật reward
 */
export async function updateReward(
  rewardId: string,
  payload: Partial<Omit<Reward, 'reward_id'>>,
): Promise<void> {
  await apiClient.put(`/admin/rewards/${rewardId}`, payload)
}
