"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Search, Calendar, Loader2 } from "lucide-react"
import { getAdminAuditLogs } from "@/lib/api"
import { Button } from "@/components/ui/button"

type AuditObjectType = "Booking" | "User" | "Service" | "Payment" | "Reward" | "LoyaltyConfig"
type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT"

const actionColors: Record<string, string> = {
  CREATE: "bg-success/10 text-success border border-success/20",
  UPDATE: "bg-blue-50 text-blue-700 border border-blue-200",
  DELETE: "bg-rose-50 text-rose-600 border border-rose-200",
  LOGIN: "bg-primary/10 text-primary border border-primary/20",
  LOGOUT: "bg-slate-100 text-slate-600 border border-slate-200",
}

const objectTypeIcons: Record<string, string> = {
  Booking: "📅",
  User: "👤",
  Service: "🛠️",
  Payment: "💳",
  Reward: "🎁",
  LoyaltyConfig: "⚙️",
}

const formatDateTime = (isoString: string): string => {
  if (!isoString) return "N/A"
  try {
    const date = new Date(isoString)
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return isoString
  }
}

const formatTimeMonospace = (isoString: string): string => {
  if (!isoString) return "N/A"
  try {
    const date = new Date(isoString)
    const dateStr = date.toISOString().split("T")[0]
    const time = date.toISOString().split("T")[1].slice(0, 8)
    return `${dateStr} ${time}`
  } catch {
    return isoString
  }
}

const getRoleLabel = (role: string): string => {
  const roleLabels: Record<string, string> = {
    admin: "Admin",
    manager: "Manager",
    washer: "Nhân viên",
    customer: "Khách hàng",
    ADMIN: "Admin",
    MANAGER: "Manager",
    CAR_WASHER: "Nhân viên",
    CUSTOMER: "Khách hàng",
  }
  return roleLabels[role] || role
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })

  // Set default range to last 30 days
  const getDefaultDates = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    return {
      start: thirtyDaysAgo.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    }
  }

  const defaultDates = getDefaultDates()

  const [filters, setFilters] = useState({
    startDate: defaultDates.start,
    endDate: defaultDates.end,
    objectType: "all" as "all" | AuditObjectType,
    action: "all" as "all" | AuditAction,
    search: "",
  })

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await getAdminAuditLogs({
        from: filters.startDate ? `${filters.startDate}T00:00:00Z` : undefined,
        to: filters.endDate ? `${filters.endDate}T23:59:59Z` : undefined,
        action: filters.action !== 'all' ? filters.action : undefined,
        entityType: filters.objectType !== 'all' ? filters.objectType : undefined,
        page,
        size: 10,
      })
      if (res && res.data) {
        let items = res.data
        // Client-side search for userName or details
        if (filters.search) {
          const s = filters.search.toLowerCase()
          items = items.filter((item: any) =>
            item.userName.toLowerCase().includes(s) ||
            item.details.toLowerCase().includes(s) ||
            item.objectId.toLowerCase().includes(s)
          )
        }
        setLogs(items)
        setPagination(res.pagination)
      }
    } catch (err) {
      console.warn("Failed to fetch audit logs from API", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, filters.startDate, filters.endDate, filters.action, filters.objectType])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const renderJsonDiff = (changes: { before: Record<string, any>; after: Record<string, any> }) => {
    const before = changes?.before || {}
    const after = changes?.after || {}
    const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))

    if (keys.length === 0) {
      return <div className="text-slate-500 italic text-xs">Không có thay đổi dữ liệu chi tiết.</div>
    }

    return (
      <div className="space-y-3 bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-200 max-h-90 overflow-y-auto">
        {keys.map((key) => {
          const valBefore = before[key]
          const valAfter = after[key]
          const hasChanged = valBefore !== valAfter

          return (
            <div key={key} className={hasChanged ? "opacity-100" : "opacity-50"}>
              <div className="text-slate-400">"{key}":</div>
              {hasChanged && valBefore !== undefined && (
                <div className="ml-4 text-rose-400">
                  - {typeof valBefore === "object" ? JSON.stringify(valBefore) : String(valBefore)}
                </div>
              )}
              {hasChanged && valAfter !== undefined && (
                <div className="ml-4 text-success">
                  + {typeof valAfter === "object" ? JSON.stringify(valAfter) : String(valAfter)}
                </div>
              )}
              {!hasChanged && (
                <div className="ml-4 text-slate-500">
                  {typeof valAfter === "object" ? JSON.stringify(valAfter) : String(valAfter)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Nhật ký hoạt động hệ thống</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi tất cả hoạt động và thay đổi cấu hình trong hệ thống thực tế
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 bg-card rounded-lg border border-border p-4">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setPage(1)
                setFilters({ ...filters, startDate: e.target.value })
              }}
              className="px-3 py-1 text-sm rounded border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-muted-foreground">—</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setPage(1)
                setFilters({ ...filters, endDate: e.target.value })
              }}
              className="px-3 py-1 text-sm rounded border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Object Type Dropdown */}
          <select
            value={filters.objectType}
            onChange={(e) => {
              setPage(1)
              setFilters({
                ...filters,
                objectType: e.target.value as "all" | AuditObjectType,
              })
            }}
            className="px-3 py-1 text-sm rounded border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tất cả đối tượng</option>
            <option value="Booking">Booking (Đơn đặt)</option>
            <option value="User">User (Người dùng)</option>
            <option value="Service">Service (Dịch vụ)</option>
            <option value="Payment">Payment (Giao dịch)</option>
            <option value="Reward">Reward (Phần thưởng)</option>
            <option value="LoyaltyConfig">LoyaltyConfig (Cấu hình điểm)</option>
          </select>

          {/* Action Dropdown */}
          <select
            value={filters.action}
            onChange={(e) => {
              setPage(1)
              setFilters({
                ...filters,
                action: e.target.value as "all" | AuditAction,
              })
            }}
            className="px-3 py-1 text-sm rounded border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tất cả hành động</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
          </select>

          {/* Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setPage(1)
              fetchLogs()
            }}
            className="flex-1 flex items-center gap-2 min-w-0"
          >
            <Search className="size-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh tên, ghi chú..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="flex-1 px-3 py-1 text-sm rounded border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" size="sm">Tìm</Button>
          </form>
        </div>

        {/* Loading overlay / Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] border border-border rounded-lg bg-card gap-2">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Đang tải nhật ký hoạt động...</span>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                    <th className="px-6 py-4 text-left font-semibold w-40">Thời gian</th>
                    <th className="px-6 py-4 text-left font-semibold">Người thực hiện</th>
                    <th className="px-6 py-4 text-left font-semibold w-24">Vai trò</th>
                    <th className="px-6 py-4 text-left font-semibold">Hành động</th>
                    <th className="px-6 py-4 text-left font-semibold">Đối tượng</th>
                    <th className="px-6 py-4 text-left font-semibold">Chi tiết</th>
                    <th className="px-6 py-4 text-center font-semibold w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => {
                    const isExpanded = expandedId === log.id
                    const actionN = (log.action || "").toUpperCase()
                    const badgeClass = actionColors[actionN] || "bg-muted text-muted-foreground border border-border"

                    return (
                      <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-3">
                          <code className="text-xs text-muted-foreground font-mono">
                            {formatTimeMonospace(log.timestamp)}
                          </code>
                        </td>
                        <td className="px-6 py-3 font-medium text-foreground">
                          {log.userName}
                        </td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">
                          {getRoleLabel(log.userRole)}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-foreground">
                          <span className="mr-2">{objectTypeIcons[log.objectType] || "📄"}</span>
                          {log.objectType}
                        </td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">
                          {log.details}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => toggleExpand(log.id)}
                            className="p-1 hover:bg-muted rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="size-4 text-primary" />
                            ) : (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-muted/20">
                <div className="text-sm text-muted-foreground">
                  Trang <span className="font-medium text-foreground">{pagination.page}</span> /{" "}
                  <span className="font-medium text-foreground">{pagination.totalPages}</span> (Tổng{" "}
                  <span className="font-medium text-foreground">{pagination.total}</span> dòng)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Trang trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    Trang sau
                  </Button>
                </div>
              </div>
            )}

            {/* Expanded Row Detail */}
            {expandedId && (
              <div className="border-t border-border bg-muted/20 p-6">
                {logs.map((log) => {
                  if (log.id !== expandedId) return null

                  return (
                    <div key={log.id} className="space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2">
                          Chi tiết thay đổi: {log.objectName}
                        </h3>
                        {renderJsonDiff(log.changes)}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>ID đối tượng: <code className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border">{log.objectId || "N/A"}</code></p>
                        <p>ID người thực hiện: <code className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border">{log.userId || "N/A"}</code></p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {logs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Không tìm thấy nhật ký hoạt động nào phù hợp với bộ lọc
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
