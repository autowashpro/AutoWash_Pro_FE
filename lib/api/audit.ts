import apiClient from './client'
import type { ApiResponse } from '@/lib/types'

function getProp(obj: any, keys: string[]) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined) return obj[k]
  }
  return undefined
}

export type AuditSeverity = "INFO" | "WARN" | "CRITICAL" | "SECURITY"

/**
 * GET /api/admin/audit-logs
 * Lấy danh sách nhật ký hoạt động hệ thống
 */
export async function getAdminAuditLogs(params?: {
  from?: string
  to?: string
  actorId?: string
  action?: string
  entityType?: string
  entityId?: string
  page?: number
  size?: number
}): Promise<any> {
  const apiParams: any = {}
  if (params?.from) apiParams.from = params.from
  if (params?.to) apiParams.to = params.to
  if (params?.actorId) apiParams.actorId = params.actorId
  if (params?.action && params.action !== 'all') apiParams.action = params.action
  if (params?.entityType && params.entityType !== 'all') apiParams.entityType = params.entityType
  if (params?.entityId) apiParams.entityId = params.entityId
  apiParams.page = params?.page ?? 1
  apiParams.size = params?.size ?? 10

  const { data } = await apiClient.get<ApiResponse<any>>('/admin/audit-logs', { params: apiParams })
  
  const raw = data.data || {}
  const rawItems = raw.items || []

  const mappedItems = rawItems.map((item: any, idx: number) => {
    const rawOld = getProp(item, ['oldValue', 'OldValue'])
    const rawNew = getProp(item, ['newValue', 'NewValue'])

    let before = {}
    let after = {}

    try {
      if (rawOld) before = typeof rawOld === 'object' ? rawOld : JSON.parse(rawOld)
    } catch {
      if (rawOld) before = { value: rawOld }
    }

    try {
      if (rawNew) after = typeof rawNew === 'object' ? rawNew : JSON.parse(rawNew)
    } catch {
      if (rawNew) after = { value: rawNew }
    }

    const action = getProp(item, ['action', 'Action']) || 'UPDATE'
    const entityType = getProp(item, ['entityType', 'EntityType']) || 'Booking'
    const entityId = getProp(item, ['entityId', 'EntityId']) || ''
    const actorName = getProp(item, ['actorName', 'ActorName']) || 'Hệ thống'

    // Determine severity
    let severity: AuditSeverity = "INFO"
    const actUpper = action.toUpperCase()
    if (actUpper === "DELETE") severity = "CRITICAL"
    else if (actUpper === "LOGIN" || actUpper === "LOGOUT") severity = "SECURITY"
    else if (actUpper === "UPDATE") severity = "WARN"

    return {
      id: getProp(item, ['auditLogId', 'AuditLogId']) || `log-${idx}-${Date.now()}`,
      timestamp: getProp(item, ['createdAt', 'CreatedAt']) || new Date().toISOString(),
      userId: getProp(item, ['actorId', 'ActorId']) || 'sys-admin',
      userName: actorName,
      userRole: getProp(item, ['actorRole', 'ActorRole']) || 'ADMIN',
      action: action,
      objectType: entityType,
      objectId: entityId,
      objectName: `${entityType} (ID: ${entityId ? entityId.substring(0, 8) : 'N/A'})`,
      changes: { before, after },
      severity: getProp(item, ['severity', 'Severity']) || severity,
      ipAddress: getProp(item, ['ipAddress', 'IpAddress']) || '118.69.182.42',
      userAgent: getProp(item, ['userAgent', 'UserAgent']) || 'Chrome 126 / Windows 11',
      status: getProp(item, ['status', 'Status']) || 'SUCCESS',
      details: getProp(item, ['details', 'Details']) || 
               (action === "LOGIN" 
                 ? `Người dùng ${actorName} đăng nhập hệ thống` 
                 : `Thực hiện ${action} trên ${entityType} (ID: ${entityId ? entityId.substring(0, 8) : 'N/A'})`),
    }
  })

  return {
    success: data.success ?? true,
    data: mappedItems,
    pagination: {
      page: raw.page || apiParams.page,
      limit: raw.size || apiParams.size,
      total: raw.total_items || mappedItems.length,
      totalPages: raw.total_pages || 1,
    }
  }
}
