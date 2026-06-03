"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageSquare, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SERVICE_COMPLAINTS, BOOKINGS, formatDate } from "@/lib/data"

type ComplaintStatus = "pending" | "in_review" | "resolved"

const statusMeta = {
  pending: { label: "Chờ xử lý", color: "bg-gold/10 text-gold border-gold/30" },
  in_review: { label: "Đang xử lý", color: "bg-primary/10 text-primary border-primary/30" },
  resolved: { label: "Đã giải quyết", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
}

export default function ComplaintListPage() {
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | "all">("all")

  const filteredComplaints =
    filterStatus === "all"
      ? SERVICE_COMPLAINTS
      : SERVICE_COMPLAINTS.filter((c) => c.status === filterStatus)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="size-8" />
            Quản lý khiếu nại
          </h1>
          <p className="text-sm text-muted-foreground">
            {filteredComplaints.length} khiếu nại — Xử lý và phản hồi khách hàng
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-border">
          {(["all", "pending", "in_review", "resolved"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                filterStatus === status
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {status === "all"
                ? "Tất cả"
                : status === "pending"
                  ? "Chờ xử lý"
                  : status === "in_review"
                    ? "Đang xử lý"
                    : "Đã giải quyết"}
            </button>
          ))}
        </div>

        {/* Complaints Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                  <th className="px-6 py-4 text-left font-semibold">Mã KN</th>
                  <th className="px-6 py-4 text-left font-semibold">Khách hàng</th>
                  <th className="px-6 py-4 text-left font-semibold">Tiêu đề</th>
                  <th className="px-6 py-4 text-left font-semibold">Ngày gửi</th>
                  <th className="px-6 py-4 text-left font-semibold">Booking liên quan</th>
                  <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredComplaints.map((complaint) => {
                  const booking = BOOKINGS.find((b) => b.id === complaint.bookingId)
                  const status = statusMeta[complaint.status]

                  return (
                    <tr key={complaint.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-muted-foreground">
                        {complaint.id.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{complaint.customerName}</td>
                      <td className="px-6 py-4 text-foreground max-w-xs truncate">{complaint.title}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {formatDate(complaint.createdAt.split("T")[0])}
                      </td>
                      <td className="px-6 py-4">
                        {booking ? (
                          <Link href={`/manager/booking/${booking.id}`}>
                            <span className="font-mono text-xs font-semibold text-primary hover:underline">
                              {booking.code}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/manager/khieu-nai/${complaint.id}`}>
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

        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không có khiếu nại</p>
          </div>
        )}
      </div>
    </div>
  )
}
