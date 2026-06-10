"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MessageSquare, ChevronRight, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getManagerComplaints } from "@/lib/api"
import { SERVICE_COMPLAINTS, formatDate } from "@/lib/data"
import type { Complaint, ComplaintStatus } from "@/lib/types"

const statusMeta: Record<ComplaintStatus, { label: string; color: string }> = {
  OPEN: { label: "Chờ xử lý", color: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  IN_REVIEW: { label: "Đang xử lý", color: "bg-primary/10 text-primary border-primary/30" },
  WAITING_FOR_CUSTOMER: { label: "Chờ khách phản hồi", color: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  RESOLVED: { label: "Đã giải quyết", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  REJECTED: { label: "Từ chối", color: "bg-rose-100 text-rose-700 border-rose-300" },
  CLOSED: { label: "Đã đóng", color: "bg-slate-100 text-slate-700 border-slate-300" },
}

export default function ComplaintListPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | "all">("all")

  useEffect(() => {
    async function fetchComplaints() {
      try {
        setLoading(true)
        const response = await getManagerComplaints()
        setComplaints(response.data)
      } catch (err: any) {
        console.error("Failed to load complaints from backend. Using fallback data.", err)
        // Fallback to mock data from lib/data.ts mapped to Complaint type
        const fallbackList: Complaint[] = SERVICE_COMPLAINTS.map((c) => ({
          complaint_id: c.id,
          booking_id: c.bookingId,
          title: c.title,
          description: c.description,
          status: (c.status === "pending"
            ? "OPEN"
            : c.status === "in_review"
            ? "IN_REVIEW"
            : "RESOLVED") as ComplaintStatus,
          images: c.images || [],
          resolution_note: c.resolution?.response || "",
          created_at: c.createdAt,
          updated_at: c.resolvedAt || c.createdAt,
        }))
        setComplaints(fallbackList)
      } finally {
        setLoading(false)
      }
    }
    fetchComplaints()
  }, [])

  const filteredComplaints =
    filterStatus === "all"
      ? complaints
      : complaints.filter((c) => c.status === filterStatus)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Premium Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Quản lý khiếu nại</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-3">
            <span className="font-semibold text-foreground">{filteredComplaints.length}</span> khiếu nại — Xem và xử lý phản hồi của khách hàng
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex items-center rounded-xl border border-border bg-secondary/60 p-1 overflow-x-auto">
          {(["all", "OPEN", "IN_REVIEW", "WAITING_FOR_CUSTOMER", "RESOLVED", "REJECTED", "CLOSED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                filterStatus === status
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === "all"
                ? "Tất cả"
                : status === "OPEN"
                ? "Chờ xử lý"
                : status === "IN_REVIEW"
                ? "Đang xử lý"
                : status === "WAITING_FOR_CUSTOMER"
                ? "Chờ khách"
                : status === "RESOLVED"
                ? "Đã giải quyết"
                : status === "REJECTED"
                ? "Từ chối"
                : "Đã đóng"}
            </button>
          ))}
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang tải danh sách khiếu nại...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="size-5" />
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                    <th className="px-6 py-4 text-left font-semibold">Mã KN</th>
                    <th className="px-6 py-4 text-left font-semibold">Booking liên quan</th>
                    <th className="px-6 py-4 text-left font-semibold">Tiêu đề</th>
                    <th className="px-6 py-4 text-left font-semibold">Nội dung</th>
                    <th className="px-6 py-4 text-left font-semibold">Ngày gửi</th>
                    <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredComplaints.map((complaint) => {
                    const status = statusMeta[complaint.status] || { label: complaint.status, color: "bg-muted text-muted-foreground border-border" }

                    return (
                      <tr key={complaint.complaint_id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-muted-foreground">
                          {complaint.complaint_id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/manager/booking/${complaint.booking_id}`}>
                            <span className="font-mono text-xs font-semibold text-primary hover:underline cursor-pointer">
                              {complaint.booking_id.slice(-6).toUpperCase()}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground max-w-xs truncate">
                          {complaint.title}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground max-w-sm truncate">
                          {complaint.description}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(complaint.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link href={`/manager/khieu-nai/${complaint.complaint_id}`}>
                            <Button size="sm" variant="outline" className="gap-1">
                              <span>Chi tiết</span>
                              <ChevronRight className="size-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && filteredComplaints.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border/60 p-16 text-center">
            <MessageSquare className="size-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="font-medium text-foreground">Không tìm thấy khiếu nại nào ở bộ lọc này.</p>
            <p className="text-sm text-muted-foreground mt-1">Thử chọn bộ lọc khác</p>
          </div>
        )}
      </div>
    </div>
  )
}
