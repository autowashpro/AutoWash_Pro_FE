'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { getMyComplaints } from '@/lib/api'
import { formatDate } from '@/lib/data'
import { toast } from 'sonner'
import { AlertCircle, Calendar, Hash, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'

type ComplaintStatus = 'OPEN' | 'IN_REVIEW' | 'WAITING_FOR_CUSTOMER' | 'RESOLVED' | 'REJECTED' | 'CLOSED'

interface ComplaintItem {
  complaint_id: string
  booking_id: string
  title: string
  description: string
  status: ComplaintStatus
  resolution_note?: string
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

                      {item.resolution_note && (
                        <div className="text-xs bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 mt-2 space-y-1">
                          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                            <ShieldCheck className="size-3.5 text-emerald-600" />
                            Phản hồi giải quyết từ Quản lý:
                          </p>
                          <p className="text-emerald-700 italic">"{item.resolution_note}"</p>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                        <Calendar className="size-3.5" />
                        <span>Gửi ngày {formatDate(item.created_at)}</span>
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
    </div>
  )
}
