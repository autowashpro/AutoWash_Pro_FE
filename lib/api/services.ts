// ============================================================
// AutoWash Pro — Services API
// ============================================================

import apiClient from './client'
import type { ApiResponse, ServiceCategory, ServiceListParams, StoreInfo } from '@/lib/types'

/**
 * GET /store-info
 * Thông tin cửa hàng (public)
 */
export async function getStoreInfo(): Promise<StoreInfo> {
  const { data } = await apiClient.get<ApiResponse<StoreInfo>>('/store-info')
  return data.data
}

/**
 * GET /services?vehicle_size=MEDIUM
 * Danh sách dịch vụ theo cỡ xe (public)
 * Trả về đã gộp theo category, price đã lọc theo vehicle_size
 */
export async function getServices(params: ServiceListParams): Promise<ServiceCategory[]> {
  const { data } = await apiClient.get<ApiResponse<{ categories: ServiceCategory[] }>>(
    '/services',
    { params },
  )
  return data.data.categories
}

// ─────────────────────────────────────────
// ADMIN — Service Management
// ─────────────────────────────────────────

/**
 * GET /admin/services
 * Lấy toàn bộ dịch vụ (admin view, không filter theo vehicle_size)
 */
export async function getAdminServices(): Promise<ServiceCategory[]> {
  const { data } = await apiClient.get<ApiResponse<{ categories: ServiceCategory[] }>>(
    '/admin/services',
  )
  return data.data.categories
}

/**
 * GET /manager/services?vehicleSize=MEDIUM
 * Lấy dịch vụ theo vehicleSize để dùng trong Walk-in Form
 */
export async function getManagerServices(vehicleSize?: string): Promise<any[]> {
  const params = vehicleSize ? { vehicleSize } : {}
  const { data } = await apiClient.get<ApiResponse<any[]>>(
    '/manager/services',
    { params },
  )
  return data.data || []
}

/**
 * POST /admin/services
 * Thêm dịch vụ mới
 */
export async function createService(payload: {
  category_id: string
  service_code: string
  name: string
  estimated_duration_minutes: number
  prices: Array<{ vehicle_size: string; price: number }>
}): Promise<void> {
  await apiClient.post('/admin/services', payload)
}

/**
 * PUT /admin/services/:service_id
 * Cập nhật dịch vụ
 */
export async function updateService(
  serviceId: string,
  payload: {
    name?: string
    estimated_duration_minutes?: number
    prices?: Array<{ vehicle_size: string; price: number }>
    status?: 'ACTIVE' | 'INACTIVE'
  },
): Promise<void> {
  await apiClient.put(`/admin/services/${serviceId}`, payload)
}
