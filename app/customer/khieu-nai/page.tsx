'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { getMyComplaints, acceptComplaintResolution, respondComplaint } from '@/lib/api'
import { formatDate } from '@/lib/data'
import { toast } from 'sonner'
import { AlertCircle, Calendar, Hash, ArrowRight, ShieldCheck, Loader2, CheckCircle2, RefreshCw, MessageSquareWarning } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

type ComplaintStatus = 'OPEN' | 'IN_REVIEW' | 'WAITING_FOR_CUSTOMER' | 'RESOLVED' | 'REJECTED' | 'CLOSED'

interface ComplaintItem {
  complaint_id: string
  booking_id: string
  title: string
  description: string
  status: ComplaintStatus
  resolution_note?: string
  images?: string[]
  created_at: string
  updated_at?: string
}

const statusMeta: Record<ComplaintStatus, { label: string; color: string }> = {
  OPEN: { label: 'Chờ xử lý', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  IN_REVIEW: { label: 'Đang xử lý', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  WAITING_FOR_CUSTOMER: { label: 'Chờ phản hồi', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' },
  RESOLVED: { label: 'Đã giải quyết', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  REJECTED: { label: 'Từ chối', color: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
  CLOSED: { label: 'Đã đóng', color: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

export default function MyComplaintsPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<ComplaintItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Respond Dialog States
  const [respondComplaintId, setRespondComplaintId] = useState<string | null>(null)
  const [respondNote, setRespondNote] = useState('')
  const [respondFiles, setRespondFiles] = useState<File[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  const handleAcceptResolution = async (complaintId: string) => {
    setActionLoading(true)
    try {
      await acceptComplaintResolution(complaintId)
      toast.success('Cảm ơn bạn đã xác nhận!', {
        description: 'Khiếu nại đã được đóng thành công.',
      })
      await loadComplaints()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xác nhận. Vui lòng thử lại.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRespondSubmit = async () => {
    if (!respondComplaintId || !respondNote.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi')
      return
    }
    setActionLoading(true)
    try {
      await respondComplaint(respondComplaintId, {
        response_note: respondNote.trim(),
        images: respondFiles.length > 0 ? respondFiles : undefined,
      })
      toast.success('Đã gửi phản hồi cho Quản lý!', {
        description: 'Khiếu nại của bạn đã được chuyển lại cho cửa hàng xem xét.',
      })
      setRespondComplaintId(null)
      setRespondNote('')
      setRespondFiles([])
      await loadComplaints()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể gửi phản hồi. Vui lòng thử lại.')
    } finally {
      setActionLoading(false)
    }
  }

  const loadComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyComplaints({
        page,
        limit: 10,
        status: filterStatus === 'all' ? undefined : filterStatus,
      })

      // Handle paginated shape or flat array
      if (Array.isArray(res)) {
        setComplaints(res)
        setTotalPages(1)
      } else if (res && Array.isArray(res.items)) {
        setComplaints(res.items)
        setTotalPages(res.pagination?.totalPages || 1)
      } else {
        setComplaints([])
      }
    } catch (err) {
      console.error('loadComplaints error:', err)
      toast.error('Không tải được danh sách khiếu nại')
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus])

  useEffect(() => {
    loadComplaints()
  }, [loadComplaints])

  return (
    <div className="space-y-6 p-4 md:p-8">
      <PageHeader
        title="Khiếu nại của tôi"
        description="Theo dõi tiến độ xử lý và phản hồi khiếu nại từ quản lý cửa hàng."
      />

      {/* Tab filters */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {[
          { value: 'all', label: 'Tất cả' },
          { value: 'OPEN', label: 'Chờ xử lý' },
          { value: 'IN_REVIEW', label: 'Đang xử lý' },
          { value: 'RESOLVED', label: 'Đã giải quyết' },
          { value: 'REJECTED', label: 'Từ chối' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setFilterStatus(tab.value)
              setPage(1)
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
              filterStatus === tab.value
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-background border-border text-muted-foreground hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title="Không tìm thấy khiếu nại"
          description={
            filterStatus === 'all'
              ? 'Bạn chưa gửi khiếu nại nào cho dịch vụ của mình.'
              : 'Không có khiếu nại nào ở trạng thái này.'
          }
          action={{
            label: 'Xem lịch hẹn hoàn thành',
            onClick: () => router.push('/customer/lich-hen'),
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {complaints.map((item) => {
              const meta = statusMeta[item.status] || {
                label: item.status,
                color: 'bg-slate-100 text-slate-600',
              }
              const shortBId = item.booking_id.slice(0, 8).toUpperCase()
              return (
                <div
                  key={item.complaint_id}
                  className="group relative rounded-2xl border-2 border-slate-200/90 bg-card p-5 sm:p-6 transition-all duration-200 hover:border-primary hover:shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                          <Hash className="size-3 text-primary" />
                          Đơn gốc: #{shortBId}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
                          {meta.label}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                        {item.title}
                      </h3>

                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {item.description}
                      </p>

                      {/* Customer evidence images */}
                      {item.images && item.images.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-xs font-semibold text-muted-foreground">Ảnh minh chứng đã gửi:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.images.map((imgUrl, idx) => (
                              <img
                                key={idx}
                                src={imgUrl}
                                alt="Minh chứng"
                                className="size-14 object-cover rounded-lg border border-border bg-muted cursor-zoom-in hover:scale-105 transition-transform"
                                onClick={() => window.open(imgUrl, '_blank')}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {item.resolution_note && (
                        <div className="text-xs bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 mt-2 space-y-1">
                          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                            <ShieldCheck className="size-3.5 text-emerald-600" />
                            Phản hồi giải quyết từ Quản lý:
                          </p>
                          <p className="text-emerald-700 italic">"{item.resolution_note}"</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="size-3.5" />
                          <span>Gửi ngày {formatDate(item.created_at)}</span>
                        </div>

                        {item.status !== 'CLOSED' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading}
                              className="h-8 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50"
                              onClick={() => setRespondComplaintId(item.complaint_id)}
                            >
                              <RefreshCw className="size-3.5 mr-1" />
                              Chưa hài lòng / Phản hồi lại
                            </Button>

                            <Button
                              size="sm"
                              disabled={actionLoading}
                              className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleAcceptResolution(item.complaint_id)}
                            >
                              <CheckCircle2 className="size-3.5 mr-1" />
                              Hài lòng & Đóng khiếu nại
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center self-end sm:self-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group-hover:translate-x-1 transition-transform font-bold text-primary gap-1"
                        asChild
                      >
                        <Link href={`/customer/lich-hen/${item.booking_id}`}>
                          Xem đặt lịch
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </Button>
              <span className="flex items-center px-4 text-xs font-semibold">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Dialog Respond Complaint */}
      <Dialog open={!!respondComplaintId} onOpenChange={(open) => !open && setRespondComplaintId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <MessageSquareWarning className="size-5" />
              Phản hồi phương án khiếu nại
            </DialogTitle>
            <DialogDescription>
              Hãy nêu rõ lý do bạn chưa đồng ý hoặc thông tin bổ sung để Quản lý tiếp tục xem xét.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Nội dung phản hồi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={respondNote}
                onChange={(e) => setRespondNote(e.target.value)}
                placeholder="Nhập nội dung phản hồi của bạn..."
                className="w-full rounded-xl border border-border bg-input p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Ảnh minh chứng bổ sung (nếu có)
              </label>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg"
                onChange={(e) => {
                  if (e.target.files) {
                    const filesArr = Array.from(e.target.files)
                    setRespondFiles((prev) => [...prev, ...filesArr].slice(0, 5))
                  }
                }}
                className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {respondFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {respondFiles.map((file, idx) => (
                    <div key={idx} className="relative text-xs bg-muted px-2 py-1 rounded border flex items-center gap-1">
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setRespondFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-rose-500 font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setRespondComplaintId(null)} disabled={actionLoading}>
              Hủy
            </Button>
            <Button onClick={handleRespondSubmit} disabled={actionLoading || !respondNote.trim()} className="bg-primary">
              {actionLoading && <Loader2 className="size-4 animate-spin mr-1.5" />}
              Gửi phản hồi cho Quản lý
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
