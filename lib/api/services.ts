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
  
  const rawCategories = data.data?.categories || [];
  
  // Áp dụng chuẩn hoá 5 nhóm dịch vụ giống Admin
  const standardNames = ["Rửa xe & combo", "Vệ sinh trong", "Vệ sinh ngoài", "Xử lý bề mặt", "Bảo vệ"];
  const grouped: Record<string, ServiceCategory> = {};
  
  standardNames.forEach(name => {
    grouped[name] = {
      category_id: name, // Use name as fake ID for grouping
      name: name,
      is_wash_group: name === "Rửa xe & combo",
      services: []
    }
  });

  rawCategories.forEach(cat => {
    const norm = (cat.name || "").trim().toLowerCase();
    let mappedName = "Rửa xe & combo";
    
    if (norm.includes("rửa xe") || norm.includes("combo")) mappedName = "Rửa xe & combo";
    else if (norm.includes("vệ sinh trong") || norm.includes("nội thất")) mappedName = "Vệ sinh trong";
    else if (norm.includes("vệ sinh ngoài") || norm.includes("ngoại thất")) mappedName = "Vệ sinh ngoài";
    else if (norm.includes("xử lý bề mặt") || norm.includes("sơn") || norm.includes("bề mặt") || norm.includes("detailing")) mappedName = "Xử lý bề mặt";
    else if (norm.includes("bảo vệ") || norm.includes("ceramic") || norm.includes("phủ")) mappedName = "Bảo vệ";
    
    // Gộp dịch vụ vào nhóm tương ứng
    if (cat.services && Array.isArray(cat.services)) {
      grouped[mappedName].services.push(...cat.services);
    }
  });

  // Chỉ trả về các nhóm có dịch vụ
  return standardNames.map(name => grouped[name]).filter(g => g.services.length > 0);
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
    const catName = item.category_name || item.categoryName || item.CategoryName || 'Khác'
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
      name: item.name || item.Name,
      description: item.description || item.Description || '',
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
    name?: string
    description?: string
    estimated_duration_minutes?: number
    prices?: Array<{ vehicle_size: string; price: number }>
    status?: 'ACTIVE' | 'INACTIVE'
  },
): Promise<void> {
  const body: any = {}
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

/**
 * DELETE /api/manager/services/:service_id
 * Xóa dịch vụ
 */
export async function deleteService(serviceId: string): Promise<void> {
  await apiClient.delete(`/manager/services/${serviceId}`)
}
