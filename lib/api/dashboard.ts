import apiClient from './client'
import type { ApiResponse } from '@/lib/types'

function getProp(obj: any, keys: string[]) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined) return obj[k]
  }
  return undefined
}

/**
 * GET /api/admin/dashboard
 * Lấy thống kê báo cáo hệ thống cho Admin
 */
export async function getAdminDashboard(): Promise<any> {
  const { data } = await apiClient.get<ApiResponse<any>>('/admin/dashboard')
  const raw = data.data || {}

  const bookings = getProp(raw, ['bookings', 'Bookings']) || {}
  const revenue = getProp(raw, ['revenue', 'Revenue']) || {}
  const users = getProp(raw, ['users', 'Users']) || {}
  const complaints = getProp(raw, ['complaints', 'Complaints']) || {}
  const promotions = getProp(raw, ['promotions', 'Promotions']) || {}

  return {
    bookings: {
      todayBookings: getProp(bookings, ['todayBookings', 'TodayBookings']) ?? 0,
      monthBookings: getProp(bookings, ['monthBookings', 'MonthBookings']) ?? 0,
      byStatus: getProp(bookings, ['byStatus', 'ByStatus']) || {},
    },
    revenue: {
      todayRevenue: getProp(revenue, ['todayRevenue', 'TodayRevenue']) ?? 0,
      monthRevenue: getProp(revenue, ['monthRevenue', 'MonthRevenue']) ?? 0,
      totalRevenue: getProp(revenue, ['totalRevenue', 'TotalRevenue']) ?? 0,
      pendingAmount: getProp(revenue, ['pendingAmount', 'PendingAmount']) ?? 0,
    },
    users: {
      activeCustomers: getProp(users, ['activeCustomers', 'ActiveCustomers']) ?? 0,
      activeManagers: getProp(users, ['activeManagers', 'ActiveManagers']) ?? 0,
      activeWashers: getProp(users, ['activeWashers', 'ActiveWashers']) ?? 0,
    },
    complaints: {
      openComplaints: getProp(complaints, ['openComplaints', 'OpenComplaints']) ?? 0,
      byStatus: getProp(complaints, ['byStatus', 'ByStatus']) || {},
    },
    promotions: {
      voucherClaimed: getProp(promotions, ['voucherClaimed', 'VoucherClaimed']) ?? 0,
      voucherUsed: getProp(promotions, ['voucherUsed', 'VoucherUsed']) ?? 0,
      voucherExpired: getProp(promotions, ['voucherExpired', 'VoucherExpired']) ?? 0,
      rewardRedeemed: getProp(promotions, ['rewardRedeemed', 'RewardRedeemed']) ?? 0,
      rewardUsed: getProp(promotions, ['rewardUsed', 'RewardUsed']) ?? 0,
      rewardExpired: getProp(promotions, ['rewardExpired', 'RewardExpired']) ?? 0,
    }
  }
}
