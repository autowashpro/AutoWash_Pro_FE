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
 * GET /api/customer/rewards?status=ACTIVE
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
 * GET /admin/loyalty/config
 * Lấy cấu hình loyalty (conversion rate, multipliers, expiry)
 */
export async function getLoyaltyConfig(): Promise<Record<string, any>> {
  const [configRes, tiersRes] = await Promise.all([
    apiClient.get<ApiResponse<any>>('/admin/loyalty/config').catch(() => ({ data: { data: {} } })),
    apiClient.get<ApiResponse<any[]>>('/admin/loyalty/tiers').catch(() => ({ data: { data: [] } }))
  ])
  
  const config = configRes.data?.data || {}
  const tiers = tiersRes.data?.data || []
  
  const result: Record<string, any> = {
    points_per_amount: config.conversion_rate || 10000,
    expiration_months: config.point_expiry_months || 12,
    pointsPerAmount: config.conversion_rate || 10000,
    expirationMonths: config.point_expiry_months || 12,
  }
  
  tiers.forEach((t: any) => {
    const tierName = (t.tier || '').toLowerCase() // member, silver, gold, platinum
    result[`${tierName}Multiplier`] = t.point_multiplier || 1.0
    result[`${tierName}_multiplier`] = t.point_multiplier || 1.0
    
    result[`${tierName}MinSpending`] = t.spending_threshold || 0
    result[`${tierName}_min_spending`] = t.spending_threshold || 0
    
    result[`${tierName}AdvanceBookingDays`] = t.booking_window_days || 7
    result[`${tierName}_advance_booking_days`] = t.booking_window_days || 7
  })
  
  return result
}

/**
 * PUT /admin/loyalty/config
 * Cập nhật cấu hình loyalty
 */
export async function updateLoyaltyConfig(payload: Record<string, any>): Promise<void> {
  // 1. Cập nhật cấu hình chung của Loyalty (Conversion Rate và Expiry Months)
  if (payload.points_per_amount !== undefined || payload.expiration_months !== undefined || payload.expirationMonths !== undefined) {
    const configBody = {
      conversion_rate: payload.points_per_amount ?? 10000,
      point_expiry_months: Math.max(1, payload.expiration_months ?? payload.expirationMonths ?? 12),
    }
    await apiClient.put('/admin/loyalty/config', configBody)
  }
  
  // 2. Cập nhật cấu hình từng Hạng thành viên (Tiers)
  const tiers = ['MEMBER', 'SILVER', 'GOLD', 'PLATINUM']
  const hasTierUpdates = tiers.some(t => {
    const prefix = t.toLowerCase()
    return (
      payload[`${prefix}_min_spending`] !== undefined ||
      payload[`${prefix}_advance_booking_days`] !== undefined ||
      payload[`${prefix}_multiplier`] !== undefined ||
      payload[`${prefix}MinSpending`] !== undefined ||
      payload[`${prefix}AdvanceBookingDays`] !== undefined ||
      payload[`${prefix}Multiplier`] !== undefined
    )
  })
  
  if (hasTierUpdates) {
    // Lấy cấu hình các Tier hiện tại để bảo toàn các trường không đổi
    const tiersRes = await apiClient.get<ApiResponse<any[]>>('/admin/loyalty/tiers').catch(() => ({ data: { data: [] } }))
    const currentTiers = tiersRes.data?.data || []
    
    for (const t of tiers) {
      const prefix = t.toLowerCase()
      const current = currentTiers.find((x: any) => x.tier === t) || {}
      
      const multiplier = payload[`${prefix}_multiplier`] ?? payload[`${prefix}Multiplier`] ?? current.point_multiplier ?? 1.0
      const minSpending = payload[`${prefix}_min_spending`] ?? payload[`${prefix}MinSpending`] ?? current.spending_threshold ?? 0
      const bookingWindow = payload[`${prefix}_advance_booking_days`] ?? payload[`${prefix}AdvanceBookingDays`] ?? current.booking_window_days ?? 7
      
      const tierBody = {
        tier: t,
        spending_threshold: Number(minSpending),
        point_multiplier: Number(multiplier),
        booking_window_days: Number(bookingWindow),
        is_active: current.is_active ?? true
      }
      
      await apiClient.put('/admin/loyalty/tiers', tierBody)
    }
  }
}

/**
 * GET /admin/rewards
 * Danh sách reward (admin view, có thể inactive)
 */
export async function getAdminRewards(): Promise<Reward[]> {
  const { data } = await apiClient.get<ApiResponse<any>>('/admin/rewards')
  const raw = data.data || {}
  return raw.items || []
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
