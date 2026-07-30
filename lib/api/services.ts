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

export function fixMojibake(str: string): string {
  if (!str) return ""
  let current = str
  for (let pass = 0; pass < 2; pass++) {
    if (/[\u00C0-\u00FF]/.test(current)) {
      try {
        const decoded = decodeURIComponent(escape(current))
        if (decoded && decoded !== current) {
          current = decoded
          continue
        }
      } catch {
        // ignore decoding errors
      }
    }
    break
  }
  return current
}

/**
 * GET /services?vehicle_size=MEDIUM
 * Danh sách dịch vụ theo cỡ xe (public)
 * Trả về danh mục động trực tiếp từ API
 */
export async function getServices(params: ServiceListParams): Promise<ServiceCategory[]> {
  const { data } = await apiClient.get<ApiResponse<{ categories: ServiceCategory[] }>>(
    '/services',
    { params },
  )
  
  const rawCategories = data.data?.categories || [];
  return rawCategories.map(cat => ({
    ...cat,
    name: fixMojibake(cat.name || ""),
    services: (cat.services || []).map(s => ({
      ...s,
      name: fixMojibake(s.name || ""),
      description: fixMojibake(s.description || ""),
    }))
  }))
}

// ─────────────────────────────────────────
// ADMIN — Service Management
// ─────────────────────────────────────────

/**
 * GET /api/manager/services
 * Lấy toàn bộ dịch vụ
 */
export async function getAdminServices(): Promise<ServiceCategory[]> {
  const { data } = await apiClient.get<ApiResponse<any[]>>(
    '/manager/services',
  )
  const items = data.data || []
  const grouped: Record<string, { categoryId: string; categoryName: string; isWashGroup: boolean; services: any[] }> = {}
  
  items.forEach((item: any) => {
    const rawCatName = item.category_name || item.categoryName || item.CategoryName || 'Khác'
    const catName = fixMojibake(rawCatName)
    if (!grouped[catName]) {
      grouped[catName] = {
        categoryId: item.category_id || item.categoryId || item.CategoryId,
        categoryName: catName,
        isWashGroup: item.is_wash_group ?? item.isWashGroup ?? item.IsWashGroup ?? false,
        services: []
      }
    }
    grouped[catName].services.push({
      service_id: item.serviceId || item.ServiceId || item.service_id || item.id || item.Id,
      name: fixMojibake(item.name || item.Name || ''),
      description: fixMojibake(item.description || item.Description || ''),
      estimated_duration_minutes: item.estimatedDurationMinutes || item.EstimatedDurationMinutes || item.estimated_duration_minutes || 30,
      status: item.status || item.Status || (item.isActive || item.IsActive ? 'ACTIVE' : 'INACTIVE'),
      prices: [
        { vehicle_size: 'SMALL', price: item.smallPrice ?? item.SmallPrice ?? item.small_price ?? 0 },
        { vehicle_size: 'MEDIUM', price: item.mediumPrice ?? item.MediumPrice ?? item.medium_price ?? 0 },
        { vehicle_size: 'LARGE', price: item.largePrice ?? item.LargePrice ?? item.large_price ?? 0 },
      ]
    })
  })

  return Object.values(grouped).map(g => ({
    category_id: g.categoryId,
    name: g.categoryName,
    is_wash_group: g.isWashGroup,
    services: g.services
  })) as any
}

/**
 * GET /api/manager/services/categories
 * Lấy toàn bộ danh mục dịch vụ (kể cả danh mục rỗng chưa có dịch vụ)
 */
export async function getAdminCategories(): Promise<{ category_id: string; name: string }[]> {
  const { data } = await apiClient.get<ApiResponse<any[]>>('/manager/services/categories')
  return (data.data || []).map((cat: any) => ({
    category_id: cat.categoryId || cat.category_id || cat.id || cat.Id,
    name: fixMojibake(cat.name || cat.Name || '')
  }))
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
  const items = data.data || []
  return items.map((item: any) => {
    const cleanCatName = fixMojibake(item.category_name || item.categoryName || item.CategoryName || '')
    return {
      ...item,
      name: fixMojibake(item.name || item.Name || ''),
      description: fixMojibake(item.description || item.Description || ''),
      category_name: cleanCatName,
      categoryName: cleanCatName,
    }
  })
}

/**
 * POST /api/manager/services/categories/:category_id
 * Thêm dịch vụ mới
 */
export async function createService(payload: {
  category_id: string
  service_code: string
  name: string
  description?: string
  estimated_duration_minutes: number
  prices: Array<{ vehicle_size: string; price: number }>
}): Promise<void> {
  const body = {
    name: payload.name,
    description: payload.description || payload.name || '',
    estimatedDurationMinutes: payload.estimated_duration_minutes,
    smallPrice: payload.prices.find((p) => p.vehicle_size === 'SMALL')?.price || 0,
    mediumPrice: payload.prices.find((p) => p.vehicle_size === 'MEDIUM')?.price || 0,
    largePrice: payload.prices.find((p) => p.vehicle_size === 'LARGE')?.price || 0,
  }
  await apiClient.post(`/manager/services/categories/${payload.category_id}`, body)
}

/**
 * PUT /api/manager/services/:service_id
 * Cập nhật dịch vụ
 */
export async function updateService(
  serviceId: string,
  payload: {
    category_id?: string
    name?: string
    description?: string
    estimated_duration_minutes?: number
    prices?: Array<{ vehicle_size: string; price: number }>
    status?: 'ACTIVE' | 'INACTIVE'
  },
): Promise<void> {
  const body: any = {}
  if (payload.category_id) {
    body.categoryId = payload.category_id
    body.category_id = payload.category_id
  }
  if (payload.name) body.name = payload.name
  if (payload.description !== undefined) body.description = payload.description
  if (payload.estimated_duration_minutes) body.estimatedDurationMinutes = payload.estimated_duration_minutes
  if (payload.prices) {
    body.smallPrice = payload.prices.find((p) => p.vehicle_size === 'SMALL')?.price || 0
    body.mediumPrice = payload.prices.find((p) => p.vehicle_size === 'MEDIUM')?.price || 0
    body.largePrice = payload.prices.find((p) => p.vehicle_size === 'LARGE')?.price || 0
  }
  if (payload.status) {
    body.isActive = payload.status === 'ACTIVE'
    body.status = payload.status
  }
  
  await apiClient.put(`/manager/services/${serviceId}`, body)
}

export async function updateServiceStatus(
  serviceId: string,
  status: 'ACTIVE' | 'INACTIVE'
): Promise<void> {
  await apiClient.patch(`/admin/services/${serviceId}/status`, { status })
}

/**
 * DELETE /api/manager/services/:service_id
 * Xóa dịch vụ
 */
export async function deleteService(serviceId: string): Promise<void> {
  await apiClient.delete(`/manager/services/${serviceId}`)
}
