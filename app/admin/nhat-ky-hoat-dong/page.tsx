"use client"

import React, { useState, useEffect } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Calendar, 
  Loader2, 
  Download, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Info, 
  AlertTriangle,
  CalendarCheck,
  User,
  Wrench,
  CreditCard,
  Gift,
  Settings,
  Camera,
  Layers,
  Shield
} from "lucide-react"
import { getAdminAuditLogs, type AuditSeverity } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"

type AuditObjectType = "Booking" | "User" | "Service" | "Payment" | "Reward" | "LoyaltyConfig" | "Inspection" | "Slot" | "Security"
type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT"

const severityBadges: Record<AuditSeverity, { label: string; className: string; icon: React.ReactNode }> = {
  INFO: { label: "INFO", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: <Info className="size-3" /> },
  WARN: { label: "WARN", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: <AlertTriangle className="size-3" /> },
  CRITICAL: { label: "CRITICAL", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20", icon: <ShieldAlert className="size-3" /> },
  SECURITY: { label: "SECURITY", className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", icon: <ShieldCheck className="size-3" /> },
}

const actionColors: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  UPDATE: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  DELETE: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  LOGIN: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  LOGOUT: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
}

const objectTypeIcons: Record<string, React.ReactNode> = {
  Booking: <CalendarCheck className="size-3.5 text-blue-500" />,
  User: <User className="size-3.5 text-emerald-500" />,
  Service: <Wrench className="size-3.5 text-amber-500" />,
  Payment: <CreditCard className="size-3.5 text-purple-500" />,
  Reward: <Gift className="size-3.5 text-rose-500" />,
  LoyaltyConfig: <Settings className="size-3.5 text-slate-500" />,
  Inspection: <Camera className="size-3.5 text-indigo-500" />,
  Slot: <Layers className="size-3.5 text-cyan-500" />,
  Security: <Shield className="size-3.5 text-rose-500" />,
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

  // Date shortcuts
  const getTodayStr = () => new Date().toISOString().split("T")[0]
  const getNDaysAgoStr = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().split("T")[0]
  }

  const [filters, setFilters] = useState({
    startDate: getNDaysAgoStr(30),
    endDate: getTodayStr(),
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

  const handleResetFilters = () => {
    setPage(1)
    setFilters({
      startDate: getNDaysAgoStr(30),
      endDate: getTodayStr(),
      objectType: "all",
      action: "all",
      search: "",
    })
  }

  const handleExportCSV = () => {
    if (logs.length === 0) return

    const headers = ["ID", "Timestamp", "UserName", "Role", "Severity", "Action", "EntityType", "IPAddress", "Details"]
    const rows = logs.map(log => [
      log.id,
      log.timestamp,
      `"${log.userName}"`,
      log.userRole,
      log.severity,
      log.action,
      log.objectType,
      log.ipAddress,
      `"${log.details.replace(/"/g, '""')}"`
    ])

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `audit_logs_${getTodayStr()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderJsonDiff = (changes: { before: Record<string, any>; after: Record<string, any> }) => {
    const before = changes?.before || {}
    const after = changes?.after || {}
    const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))

    if (keys.length === 0) {
      return <div className="text-muted-foreground italic text-xs py-2">Không có thay đổi dữ liệu chi tiết.</div>
    }

    return (
      <div className="space-y-2 bg-slate-950 dark:bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-200 border border-border/50 max-h-80 overflow-y-auto">
        {keys.map((key) => {
          const valBefore = before[key]
          const valAfter = after[key]
          const hasChanged = valBefore !== valAfter

          return (
            <div key={key} className={cn("py-0.5 border-b border-slate-800/60 last:border-0", hasChanged ? "opacity-100" : "opacity-40")}>
              <span className="text-slate-400 font-bold">"{key}":</span>
              {hasChanged && valBefore !== undefined && (
                <div className="ml-4 text-rose-400 font-semibold flex items-center gap-1">
                  <span>-</span>
                  <span>{typeof valBefore === "object" ? JSON.stringify(valBefore) : String(valBefore)}</span>
                </div>
              )}
              {hasChanged && valAfter !== undefined && (
                <div className="ml-4 text-emerald-400 font-semibold flex items-center gap-1">
                  <span>+</span>
                  <span>{typeof valAfter === "object" ? JSON.stringify(valAfter) : String(valAfter)}</span>
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
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Nhật ký hoạt động hệ thống" 
        description="Theo dõi lịch sử truy cập, thay đổi dữ liệu và nhật ký kiểm toán thực tế theo tiêu chuẩn bảo mật" 
      />

      {/* Filter Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Range Inputs & Shortcuts */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/50 text-xs">
              <Calendar className="size-3.5 text-muted-foreground" />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setPage(1)
                  setFilters({ ...filters, startDate: e.target.value })
                }}
                className="bg-transparent font-mono font-semibold focus:outline-none"
              />
              <span className="text-muted-foreground">—</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setPage(1)
                  setFilters({ ...filters, endDate: e.target.value })
                }}
                className="bg-transparent font-mono font-semibold focus:outline-none"
              />
            </div>

            {/* Quick Date Shortcuts */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilters({ ...filters, startDate: getTodayStr(), endDate: getTodayStr() })}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => setFilters({ ...filters, startDate: getNDaysAgoStr(7), endDate: getTodayStr() })}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              >
                7 ngày
              </button>
              <button
                type="button"
                onClick={() => setFilters({ ...filters, startDate: getNDaysAgoStr(30), endDate: getTodayStr() })}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              >
                30 ngày
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-colors flex items-center gap-1.5 text-muted-foreground"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5 text-xs font-semibold rounded-xl"
            >
              <Download className="size-3.5" />
              <span>Xuất CSV</span>
            </Button>
          </div>
        </div>

        {/* Filters Row 2: Dropdowns & Search */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
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
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả đối tượng</option>
            <option value="Booking">Booking (Đơn đặt)</option>
            <option value="User">User (Người dùng)</option>
            <option value="Service">Service (Dịch vụ)</option>
            <option value="Payment">Payment (Giao dịch)</option>
            <option value="Reward">Reward (Phần thưởng)</option>
            <option value="LoyaltyConfig">LoyaltyConfig (Cấu hình điểm)</option>
            <option value="Inspection">Inspection (Nghiệm thu xe)</option>
            <option value="Slot">Slot (Khóa/Mở slot)</option>
            <option value="Security">Security (Bảo mật & Auth)</option>
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
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả hành động</option>
            <option value="CREATE">CREATE (Tạo mới)</option>
            <option value="UPDATE">UPDATE (Cập nhật)</option>
            <option value="DELETE">DELETE (Xóa)</option>
            <option value="LOGIN">LOGIN (Đăng nhập)</option>
            <option value="LOGOUT">LOGOUT (Đăng xuất)</option>
          </select>

          {/* Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setPage(1)
              fetchLogs()
            }}
            className="flex-1 flex items-center gap-2 min-w-[220px]"
          >
            <div className="relative flex-1">
              <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh tên, ghi chú, ID..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button type="submit" size="sm" className="h-8 text-xs font-semibold rounded-xl px-4">Tìm</Button>
          </form>
        </div>
      </div>

      {/* Loading overlay / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 border border-border rounded-2xl bg-card gap-3 shadow-sm">
          <Loader2 className="size-9 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground font-medium animate-pulse">Đang tải nhật ký kiểm toán...</span>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground bg-muted/40 font-bold uppercase tracking-wider text-[11px]">
                  <th className="px-4 py-3.5 text-left w-36">Thời gian</th>
                  <th className="px-4 py-3.5 text-left">Tác nhân & IP</th>
                  <th className="px-4 py-3.5 text-left w-24">Mức độ</th>
                  <th className="px-4 py-3.5 text-left">Hành động</th>
                  <th className="px-4 py-3.5 text-left">Đối tượng</th>
                  <th className="px-4 py-3.5 text-left">Ghi chú chi tiết</th>
                  <th className="px-4 py-3.5 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => {
                  const isExpanded = expandedId === log.id
                  const actionN = (log.action || "UPDATE").toUpperCase()
                  const badgeClass = actionColors[actionN] || "bg-muted text-muted-foreground border border-border"
                  const severityConfig = severityBadges[log.severity as AuditSeverity] || severityBadges.INFO

                  return (
                    <React.Fragment key={log.id}>
                      <tr className={cn("hover:bg-muted/30 transition-colors cursor-pointer", isExpanded && "bg-muted/40")} onClick={() => toggleExpand(log.id)}>
                        {/* Timestamp */}
                        <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-foreground">
                          {formatTimeMonospace(log.timestamp)}
                        </td>

                        {/* Actor Name & Role & IP */}
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <div className="font-bold text-foreground flex items-center gap-1.5">
                              <span>{log.userName}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/40 font-semibold">
                                {getRoleLabel(log.userRole)}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium">
                              IP: {log.ipAddress}
                            </div>
                          </div>
                        </td>

                        {/* Severity Badge */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold border", severityConfig.className)}>
                            {severityConfig.icon}
                            <span>{severityConfig.label}</span>
                          </span>
                        </td>

                        {/* Action Badge */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[10px] font-extrabold border", badgeClass)}>
                            {log.action}
                          </span>
                        </td>

                        {/* Object Type */}
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-foreground">
                          <div className="flex items-center gap-1.5">
                            {objectTypeIcons[log.objectType] || <Layers className="size-3.5 text-muted-foreground" />}
                            <span>{log.objectType}</span>
                          </div>
                        </td>

                        {/* Details */}
                        <td className="px-4 py-3 text-muted-foreground max-w-xs truncate" title={log.details}>
                          {log.details}
                        </td>

                        {/* Expand Chevron */}
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleExpand(log.id)
                            }}
                            className="p-1 hover:bg-muted rounded-lg transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="size-4 text-primary" />
                            ) : (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* INLINE EXPANDED ROW ACCORDION */}
                      {isExpanded && (
                        <tr className="bg-muted/30 border-b border-border">
                          <td colSpan={7} className="p-4 sm:p-6 space-y-4">
                            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-4 shadow-sm">
                              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                <div>
                                  <h4 className="font-bold text-xs text-foreground flex items-center gap-2">
                                    <span>Chi tiết kiểm toán sự kiện:</span>
                                    <span className="font-mono text-[11px] text-primary">{log.objectName}</span>
                                  </h4>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{log.details}</p>
                                </div>

                                <div className="flex items-center gap-2 font-mono text-[11px]">
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
                                    Status: {log.status}
                                  </span>
                                </div>
                              </div>

                              {/* Metadata Items */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px] bg-muted/40 p-3 rounded-lg border border-border/40">
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">LOG ID:</span>
                                  <span className="font-bold text-foreground truncate block">{log.id}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">ACTOR ID:</span>
                                  <span className="font-bold text-foreground truncate block">{log.userId}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">ENTITY ID:</span>
                                  <span className="font-bold text-foreground truncate block">{log.objectId || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">DEVICE / BROWSER:</span>
                                  <span className="font-bold text-foreground truncate block">{log.userAgent}</span>
                                </div>
                              </div>

                              {/* JSON Diff Inspector */}
                              <div className="space-y-1.5">
                                <div className="text-xs font-bold text-foreground flex items-center gap-2">
                                  <span>So sánh thay đổi dữ liệu (Before ➔ After)</span>
                                </div>
                                {renderJsonDiff(log.changes)}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-card">
              <div className="text-xs text-muted-foreground font-medium">
                Trang <span className="font-mono font-bold text-foreground">{pagination.page}</span> /{" "}
                <span className="font-mono font-bold text-foreground">{pagination.totalPages}</span> (Tổng{" "}
                <span className="font-mono font-bold text-foreground">{pagination.total}</span> dòng)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 text-xs font-semibold rounded-xl"
                >
                  Trang trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="h-8 text-xs font-semibold rounded-xl"
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}

          {logs.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-xs">
              Không tìm thấy nhật ký hoạt động nào phù hợp với bộ lọc
            </div>
          )}
        </div>
      )}
    </div>
  )
}
