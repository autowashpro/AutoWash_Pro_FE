"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getManagerComplaintDetail, getManagerBookingDetail, resolveComplaint } from "@/lib/api"
import { SERVICE_COMPLAINTS, BOOKINGS, formatDate } from "@/lib/data"
import type { Complaint, BookingDetail, ComplaintStatus } from "@/lib/types"

const statusMeta: Record<ComplaintStatus, { label: string; color: string }> = {
  OPEN: { label: "Chờ xử lý", color: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  IN_REVIEW: { label: "Đang xử lý", color: "bg-primary/10 text-primary border-primary/30" },
  WAITING_FOR_CUSTOMER: { label: "Chờ khách", color: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  RESOLVED: { label: "Đã giải quyết", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  REJECTED: { label: "Từ chối", color: "bg-rose-100 text-rose-700 border-rose-300" },
  CLOSED: { label: "Đã đóng", color: "bg-slate-100 text-slate-700 border-slate-300" },
}

const conclusionOptions = [
  { value: "RESOLVED", label: "Đã giải quyết (Chấp nhận)" },
  { value: "REJECTED", label: "Từ chối khiếu nại" },
  { value: "IN_REVIEW", label: "Tiếp tục xem xét" },
  { value: "CLOSED", label: "Đóng khiếu nại" },
]

export default function ComplaintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const complaintId = params.id as string

  // State
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [responseMsg, setResponseMsg] = useState("")
  const [conclusion, setConclusion] = useState<string>("RESOLVED")
  const [errorMsg, setErrorMsg] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setErrorMsg("")
        const complaintData = await getManagerComplaintDetail(complaintId)
        setComplaint(complaintData)

        // Load booking details linked to the complaint
        try {
          const bookingData = await getManagerBookingDetail(complaintData.booking_id)
          setBooking(bookingData)
        } catch (bookingErr) {
          console.warn("Failed to load booking detail, using fallback booking", bookingErr)
          const fallbackBk = BOOKINGS.find(b => b.id === complaintData.booking_id)
          if (fallbackBk) {
            setBooking({
              booking_id: fallbackBk.id,
              status: fallbackBk.status as any,
              total_price: fallbackBk.price,
              license_plate: fallbackBk.vehicle?.plate,
              services: [{ name: fallbackBk.serviceName, price: fallbackBk.price }],
              customer: { full_name: fallbackBk.customerName, phone_number: "0901234567" }
            })
          }
        }
      } catch (err) {
        console.error("Failed to load complaint. Using mock fallback.", err)
        const mockC = SERVICE_COMPLAINTS.find(c => c.id === complaintId)
        if (mockC) {
          setComplaint({
            complaint_id: mockC.id,
            booking_id: mockC.bookingId,
            title: mockC.title,
            description: mockC.description,
            status: (mockC.status === "pending" ? "OPEN" : mockC.status === "in_review" ? "IN_REVIEW" : "RESOLVED") as ComplaintStatus,
            created_at: mockC.createdAt,
            updated_at: mockC.resolvedAt || mockC.createdAt,
            resolution_note: mockC.resolution?.response || ""
          })
          
          const linkedBk = BOOKINGS.find(b => b.id === mockC.bookingId)
          if (linkedBk) {
            setBooking({
              booking_id: linkedBk.id,
              status: linkedBk.status as any,
              total_price: linkedBk.price,
              license_plate: linkedBk.vehicle?.plate,
              services: [{ name: linkedBk.serviceName, price: linkedBk.price }],
              customer: { full_name: linkedBk.customerName, phone_number: "0901234567" }
            })
          }
        } else {
          setErrorMsg("Không tìm thấy khiếu nại này.")
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [complaintId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!responseMsg.trim() || !conclusion) return

    try {
      setSubmitting(true)
      setErrorMsg("")
      await resolveComplaint(complaintId, {
        status: conclusion,
        resolution_note: responseMsg.trim()
      })
      setSubmitted(true)
    } catch (err: any) {
      console.error("Failed to resolve complaint", err)
      setErrorMsg(err?.response?.data?.message || "Gặp sự cố khi xử lý khiếu nại. Vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="size-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Đang tải chi tiết khiếu nại...</p>
        </div>
      </div>
    )
  }

  if (errorMsg && !complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <AlertCircle className="size-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">{errorMsg}</h2>
          <Link href="/manager/khieu-nai">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!complaint) return null

  const status = statusMeta[complaint.status] || { label: complaint.status, color: "bg-muted text-muted-foreground border-border" }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4 shadow-sm">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-500/20 text-emerald-600">
              <CheckCircle className="size-8" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-600">Đã lưu kết quả xử lý khiếu nại</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Khiếu nại mã {complaint.complaint_id.slice(-6).toUpperCase()} đã được cập nhật trạng thái sang{" "}
              <strong>{conclusionOptions.find(o => o.value === conclusion)?.label}</strong>.
            </p>
            <div className="pt-4">
              <Link href="/manager/khieu-nai">
                <Button className="bg-primary hover:bg-primary/90">
                  Quay lại danh sách
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top sticky bar */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/manager/khieu-nai">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chi tiết khiếu nại</h1>
            <p className="text-xs text-muted-foreground">Mã: {complaint.complaint_id.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 flex items-center gap-3 text-rose-600">
            <AlertCircle className="size-5 shrink-0" />
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <h2 className="text-xl font-bold text-foreground">{complaint.title}</h2>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
              
              {complaint.images && complaint.images.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Ảnh đính kèm từ khách hàng:</p>
                  <div className="grid grid-cols-3 gap-3">
                    {complaint.images.map((img, i) => (
                      <a href={img} target="_blank" rel="noopener noreferrer" key={i} className="block aspect-square rounded-xl overflow-hidden border border-border hover:opacity-95 transition-opacity">
                        <img src={img} alt="Attached evidence" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Linked Booking */}
            {booking && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Booking liên quan</h3>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between hover:bg-primary/10 transition-colors">
                  <div className="space-y-1">
                    <p className="font-mono font-bold text-primary">{booking.booking_id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-foreground">
                      Dịch vụ: <span className="font-semibold">{booking.services?.map(s => s.name || s.service_name).join(", ") || "N/A"}</span>
                    </p>
                    {booking.license_plate && (
                      <p className="text-xs text-muted-foreground">Biển số: {booking.license_plate}</p>
                    )}
                  </div>
                  <Link href={`/manager/booking/${booking.booking_id}`}>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      Xem chi tiết booking →
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Resolution Form (only if not closed/resolved, or always available to edit note) */}
            {complaint.status !== "CLOSED" && complaint.status !== "RESOLVED" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
                  <h3 className="font-bold text-foreground">Phương án xử lý khiếu nại</h3>

                  <div className="space-y-2">
                    <label htmlFor="response" className="text-sm font-semibold text-foreground block">
                      Phản hồi / Ghi chú xử lý cho khách hàng
                    </label>
                    <textarea
                      id="response"
                      required
                      rows={5}
                      value={responseMsg}
                      onChange={(e) => setResponseMsg(e.target.value)}
                      placeholder="Điền câu trả lời chi tiết và các bước khắc phục sự cố cho khách hàng..."
                      className="w-full rounded-xl border border-border bg-input p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="conclusion" className="text-sm font-semibold text-foreground block">
                      Quyết định của quản lý
                    </label>
                    <select
                      id="conclusion"
                      value={conclusion}
                      onChange={(e) => setConclusion(e.target.value)}
                      className="w-full rounded-xl border border-border bg-input p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    >
                      {conclusionOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !responseMsg.trim()}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  <span>Cập nhật kết quả xử lý</span>
                </Button>
              </form>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
                <h3 className="font-bold text-foreground">Kết quả đã xử lý</h3>
                <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                  <div className="text-sm text-foreground/90 whitespace-pre-wrap italic">
                    &ldquo;{complaint.resolution_note || "Không có ghi chú chi tiết."}&rdquo;
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cập nhật lúc: {formatDate(complaint.updated_at)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column details */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-sm sticky top-24">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trạng thái hiện tại</p>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold border ${status.color}`}>
                  {status.label}
                </span>
              </div>

              {booking?.customer && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Khách hàng khiếu nại</p>
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">{booking.customer.full_name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{booking.customer.phone_number}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Thời gian gửi khiếu nại</p>
                <p className="text-sm text-foreground">
                  {formatDate(complaint.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
