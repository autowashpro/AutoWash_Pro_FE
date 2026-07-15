'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Clock,
  Car,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Zap,
  XCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  MapPin,
  CalendarCheck2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { getMyBookings } from '@/lib/api'
import type { BookingSummary, BookingStatus } from '@/lib/types'
import { VEHICLE_SIZE_LABELS } from '@/lib/types'
import { formatVND } from '@/lib/data'

type TabFilter = 'all' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled'

const TAB_LABELS: Record<TabFilter, string> = {
  all: 'Tất cả',
  upcoming: 'Sắp tới',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

const TAB_STATUSES: Partial<Record<TabFilter, BookingStatus[]>> = {
  upcoming: ['PENDING_CONFIRMATION', 'CONFIRMED', 'ASSIGNED', 'CHECKED_IN', 'VEHICLE_INSPECTED', 'CUSTOMER_CONFIRMED_CONDITION'],
  in_progress: ['IN_PROGRESS'],
  completed: ['COMPLETED', 'PAID', 'CLOSED'],
  cancelled: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_MANAGER', 'AUTO_CANCELLED', 'NO_SHOW', 'CANCELLED'],
}

const PAGE_SIZE = 10

function getActionButton(status: BookingStatus): { label: string; primary: boolean } | null {
  switch (status) {
    case 'PENDING_CONFIRMATION':
    case 'CONFIRMED':
    case 'ASSIGNED':
      return { label: 'Hủy lịch', primary: false }
    case 'VEHICLE_INSPECTED':
    case 'CUSTOMER_CONFIRMED_CONDITION':
      return { label: 'Xác nhận tình trạng xe', primary: true }
    case 'COMPLETED':
    case 'PAID':
      return { label: 'Đánh giá dịch vụ', primary: true }
    case 'CLOSED':
      return { label: 'Khiếu nại', primary: false }
    default:
      return null
  }
}

function BookingCardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-slate-200/80 bg-card p-5.5 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 rounded-lg bg-muted" />
        <div className="h-5 w-24 rounded bg-muted" />
      </div>
      <div className="h-6 w-64 rounded bg-muted" />
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="h-9 w-28 rounded-xl bg-muted" />
      </div>
    </div>
  )
}

function BookingCard({ booking }: { booking: BookingSummary }) {
  const router = useRouter()
  const action = getActionButton(booking.status)

  const bId = booking.booking_id || (booking as any).bookingId || ''

  function handleActionClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/customer/lich-hen/${bId}`)
  }

  function parseSlotTime(slotTime: string): { date: string; time: string } {
    if (!slotTime) return { date: '', time: '' }
    const normalized = slotTime.includes('T') ? slotTime : slotTime.replace(' ', 'T')
    const d = new Date(normalized)
    if (!isNaN(d.getTime())) {
      return {
        date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      }
    }
    return { date: '', time: slotTime }
  }

  const { date, time } = parseSlotTime(booking.slot_start_time)
  const shortId = bId.slice(0, 8).toUpperCase()

  return (
    <Link
      href={`/customer/lich-hen/${bId}`}
      className="group relative block rounded-2xl border-2 border-slate-200/90 bg-card p-5 sm:p-6 transition-all duration-200 hover:border-primary hover:shadow-md"
    >
      {/* Accent strip */}
      <div className="absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full bg-primary" />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pl-2.5">
        {/* Left Side: Vehicle, Service, Meta */}
        <div className="space-y-2.5">
          {/* Top row: License Plate & Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-900 px-2.5 py-0.5 text-white shadow-2xs">
              <span className="text-[9px] font-black text-slate-400">VN</span>
              <span className="font-mono text-sm font-black tracking-wider uppercase">
                {booking.license_plate || 'CHƯA CÓ BIỂN'}
              </span>
            </div>

            {booking.vehicle_size && (
              <span className="text-xs font-semibold text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-md">
                {VEHICLE_SIZE_LABELS[booking.vehicle_size] || booking.vehicle_size}
              </span>
            )}
          </div>

          {/* Service Title (Prominent) */}
          <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors line-clamp-2">
            {booking.services_summary || 'Dịch vụ chăm sóc xe VIP'}
          </h3>

          {/* Time & Worker Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-muted-foreground pt-0.5">
            {date && (
              <span className="flex items-center gap-1.5 text-primary">
                <CalendarDays className="size-3.5 shrink-0" />
                <span>{date} · <strong className="text-foreground">{time}</strong></span>
              </span>
            )}
            {booking.assigned_washer && (
              <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                <MapPin className="size-3.5 text-slate-500 shrink-0" />
                <span>Thợ phụ trách: <strong className="text-foreground">{booking.assigned_washer}</strong></span>
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Status, Price, ID */}
        <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-between pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase">
                Mã đơn: #{shortId}
              </span>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="flex items-center gap-3">
            {(booking as any).final_estimate !== undefined && (
              <div className="text-right hidden sm:block mr-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Chi phí</span>
                <span className="font-mono text-base font-black text-emerald-600">
                  {formatVND((booking as any).final_estimate)}
                </span>
              </div>
            )}

            {action ? (
              <button
                onClick={handleActionClick}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                  action.primary
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20'
                    : 'border-2 border-slate-200 bg-background text-foreground hover:bg-slate-100'
                }`}
              >
                {action.label}
                <ChevronRight className="size-3.5 stroke-[2.5]" />
              </button>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-primary group-hover:underline">
                Chi tiết <ChevronRight className="size-3.5 stroke-[2.5]" />
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[]
  if (val && typeof val === 'object') {
    const v = val as Record<string, unknown>
    if (Array.isArray(v['items'])) return v['items'] as T[]
    if (Array.isArray(v['data']))  return v['data'] as T[]
  }
  return []
}

export default function BookingListPage() {
  const [tab, setTab] = useState<TabFilter>('all')
  const [page, setPage] = useState(1)
  const [bookings, setBookings] = useState<BookingSummary[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const statusFilter = TAB_STATUSES[tab]

      const res = await getMyBookings({
        page,
        limit: PAGE_SIZE,
        ...(tab !== 'all' && statusFilter && statusFilter.length === 1
          ? { status: statusFilter[0] }
          : {}),
      })

      // Loại bỏ tuyệt đối các bản ghi nháp giữ chỗ (SLOT_HELD) và giữ chỗ hết hạn (EXPIRED)
      const rawData = toArray<BookingSummary>(res.data).filter(
        (b) => b.status !== 'SLOT_HELD' && b.status !== 'EXPIRED'
      )

      const filtered =
        tab !== 'all' && statusFilter
          ? rawData.filter((b) => statusFilter.includes(b.status as BookingStatus))
          : rawData

      setBookings(filtered)
      setTotalPages(1) // Sau khi lọc rác nháp client-side, hiển thị chính xác theo trang hiện tại
      setTotal(filtered.length)
    } catch (err) {
      console.error('getMyBookings error:', err)
      setError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại.')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [tab, page])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  function handleTabChange(newTab: TabFilter) {
    setTab(newTab)
    setPage(1)
  }

  const tabEntries = Object.entries(TAB_LABELS) as Array<[TabFilter, string]>

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24 pt-2">
      {/* Header Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <span>Lịch hẹn của tôi</span>
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Theo dõi tiến độ chăm sóc xe theo thời gian thực và lịch sử đặt dịch vụ.
          </p>
        </div>
        <Button asChild className="rounded-xl font-bold px-5 shadow-md shadow-primary/20">
          <Link href="/customer/dat-lich">
            + Đặt lịch rửa xe mới
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="tablist"
        aria-label="Lọc lịch hẹn"
      >
        {tabEntries.map(([tabKey, label]) => (
          <button
            key={tabKey}
            role="tab"
            aria-selected={tab === tabKey}
            onClick={() => handleTabChange(tabKey)}
            className={`whitespace-nowrap rounded-xl px-4.5 py-2.5 text-sm font-bold transition-all duration-200 ${
              tab === tabKey
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 size-8 text-rose-500" />
          <p className="font-bold text-rose-700">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-xl font-bold"
            onClick={loadBookings}
          >
            <RefreshCw className="mr-2 size-4" />
            Thử lại ngay
          </Button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && bookings.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-card p-12 text-center space-y-3">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarCheck2 className="size-7 stroke-[2]" />
          </div>
          <div>
            <p className="text-base font-extrabold text-foreground">
              {tab === 'all' ? 'Bạn chưa có lịch hẹn chăm sóc xe nào' : 'Không tìm thấy lịch hẹn trong trạng thái này'}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground max-w-sm mx-auto">
              {tab === 'all'
                ? 'Hãy đặt lịch ngay hôm nay để trải nghiệm dịch vụ chăm sóc xe Detailing 5 sao định chuẩn.'
                : 'Vui lòng chọn bộ lọc trạng thái khác để kiểm tra danh sách.'}
            </p>
          </div>
          {tab === 'all' && (
            <Button asChild className="mt-4 rounded-xl font-bold px-6 shadow-md shadow-primary/20">
              <Link href="/customer/dat-lich">Đặt lịch chăm sóc xe ngay</Link>
            </Button>
          )}
        </div>
      )}

      {/* Booking list */}
      {!loading && !error && bookings.length > 0 && (
        <>
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
              <span>Hiển thị {bookings.length} / {total} lịch hẹn</span>
              <span>• Cập nhật thời gian thực</span>
            </div>
            {bookings.map((booking) => (
              <BookingCard key={booking.booking_id} booking={booking} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                Trang trước
              </Button>
              <span className="text-sm font-extrabold text-foreground font-mono">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Trang tiếp
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
