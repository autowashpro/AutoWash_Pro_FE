"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Search, Calendar } from "lucide-react"
import { AUDIT_LOGS, formatVND, AuditLog } from "@/lib/data"

type AuditObjectType = "Booking" | "User" | "Service" | "Payment"
type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN"

const actionColors: Record<string, string> = {
  CREATE: "bg-success/10 text-success",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-rose-50 text-rose-600",
  LOGIN: "bg-primary/10 text-primary",
}

const objectTypeIcons: Record<string, string> = {
  Booking: "📅",
  User: "👤",
  Service: "🛠️",
  Payment: "💳",
}

const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

const formatTimeMonospace = (isoString: string): string => {
  const date = new Date(isoString)
  const time = date.toISOString().split("T")[1].slice(0, 8)
  const dateStr = date.toISOString().split("T")[0]
  return `${dateStr} ${time}`
}

const getRoleLabel = (role: string): string => {
  const roleLabels: Record<string, string> = {
    admin: "Admin",
    manager: "Manager",
    washer: "Nhân viên",
    customer: "Khách hàng",
  }
  return roleLabels[role] || role
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState(AUDIT_LOGS)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    startDate: "2026-06-01",
    endDate: "2026-06-02",
    objectType: "all" as "all" | AuditObjectType,
    action: "all" as "all" | AuditAction,
    search: "",
  })

  const filteredLogs = logs.filter((log) => {
    const logDate = log.timestamp.split("T")[0]
    const inDateRange = logDate >= filters.startDate && logDate <= filters.endDate
    const matchesObjectType = filters.objectType === "all" || log.objectType === filters.objectType
    const matchesAction = filters.action === "all" || log.action === filters.action
    const matchesSearch =
      filters.search === "" ||
      log.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.objectName.toLowerCase().includes(filters.search.toLowerCase())

    return inDateRange && matchesObjectType && matchesAction && matchesSearch
  })

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const renderJsonDiff = (changes: { before: Record<string, any>; after: Record<string, any> }) => {
    return (
      <div className="space-y-3 bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-200">
        {Object.keys({ ...changes.before, ...changes.after }).map((key) => {
          const before = changes.before[key]
          const after = changes.after[key]
          const hasChanged = before !== after

          return (
            <div key={key} className={hasChanged ? "opacity-100" : "opacity-50"}>
              <div className="text-slate-400">"{key}":</div>
              {hasChanged && before !== undefined && (
                <div className="ml-4 text-rose-400">
                  - {JSON.stringify(before)}
                </div>
              )}
              {hasChanged && after !== undefined && (
                <div className="ml-4 text-success">
                  + {JSON.stringify(after)}
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
            Theo dõi tất cả hoạt động và thay đổi trong hệ thống
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
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="px-3 py-1 text-sm rounded border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-muted-foreground">—</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="px-3 py-1 text-sm rounded border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Object Type Dropdown */}
          <select
            value={filters.objectType}
            onChange={(e) =>
              setFilters({
                ...filters,
                objectType: e.target.value as "all" | AuditObjectType,
              })
            }
            className="px-3 py-1 text-sm rounded border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tất cả đối tượng</option>
            <option value="Booking">Booking</option>
            <option value="User">User</option>
            <option value="Service">Service</option>
            <option value="Payment">Payment</option>
          </select>

          {/* Action Dropdown */}
          <select
            value={filters.action}
            onChange={(e) =>
              setFilters({
                ...filters,
                action: e.target.value as "all" | AuditAction,
              })
            }
            className="px-3 py-1 text-sm rounded border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tất cả hành động</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
          </select>

          {/* Search Input */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <Search className="size-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo người dùng, đối tượng..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="flex-1 px-3 py-1 text-sm rounded border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Hiển thị {filteredLogs.length} kết quả
        </div>

        {/* Audit Log Table */}
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
                {filteredLogs.map((log) => {
                  const isExpanded = expandedId === log.id

                  return (
                    <tr key={log.id}>
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
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${actionColors[log.action]}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-foreground">
                        <span className="mr-2">{objectTypeIcons[log.objectType]}</span>
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

          {/* Expanded Row */}
          {expandedId && (
            <div className="border-t border-border bg-muted/20 p-6">
              {filteredLogs.map((log) => {
                if (log.id !== expandedId) return null

                return (
                  <div key={log.id} className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        Chi tiết thay đổi: {log.objectName}
                      </h3>
                      {renderJsonDiff(log.changes)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>ID đối tượng: <code className="font-mono bg-muted px-1 rounded">{log.objectId}</code></p>
                      <p>ID người thực hiện: <code className="font-mono bg-muted px-1 rounded">{log.userId}</code></p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Không tìm thấy nhật ký nào phù hợp với bộ lọc
          </div>
        )}
      </div>
    </div>
  )
}
