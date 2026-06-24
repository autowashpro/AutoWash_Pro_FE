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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { getMyBookings } from '@/lib/api'
import type { BookingSummary, BookingStatus } from '@/lib/types'
import { BOOKING_STATUS_CONFIG, VEHICLE_SIZE_LABELS } from '@/lib/types'

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

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
  cancelled: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_MANAGER', 'AUTO_CANCELLED', 'NO_SHOW', 'CANCELLED', 'EXPIRED'],
}

const PAGE_SIZE = 10

// ─────────────────────────────────────
// Helpers
// ─────────────────────────────────────

function formatDateVN(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function getStatusIcon(status: BookingStatus) {
  if (['COMPLETED', 'PAID', 'CLOSED'].includes(status))
    return <CheckCircle2 className="size-4 text-emerald-500" />
  if (status === 'IN_PROGRESS')
    return <Zap className="size-4 animate-pulse text-orange-500" />
  if (['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_MANAGER', 'AUTO_CANCELLED', 'NO_SHOW', 'CANCELLED', 'EXPIRED'].includes(status))
    return <XCircle className="size-4 text-rose-500" />
  return null
}

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
      return { label: 'Đánh giá', primary: true }
    case 'CLOSED':
      return { label: 'Khiếu nại', primary: false }
    default:
      return null
  }
}

// ─────────────────────────────────────
// Skeleton
// ─────────────────────────────────────

function BookingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-6 w-36 rounded bg-muted" />
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="h-6 w-24 rounded-full bg-muted" />
          <div className="mt-auto h-8 w-28 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────
// Booking Card
// ─────────────────────────────────────

function BookingCard({ booking }: { booking: BookingSummary }) {
  const router = useRouter()
  const action = getActionButton(booking.status)
  const statusIcon = getStatusIcon(booking.status)

  function handleActionClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    // Nếu có action thì xử lý; với cancel/rating/khiếu nại → navigate đến detail
    router.push(`/customer/lich-hen/${booking.booking_id}`)
  }

  // Parse slot_start_time (có thể là ISO hoặc "YYYY-MM-DD HH:mm:ss" hoặc "HH:mm")
  function parseSlotTime(slotTime: string): { date: string; time: string } {
    if (!slotTime) return { date: '', time: '' }
    // ISO format
    const d = new Date(slotTime)
    if (!isNaN(d.getTime())) {
      return {
        date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      }
    }
    // Dạng "HH:mm" thuần
    return { date: '', time: slotTime }
  }

  const { date, time } = parseSlotTime(booking.slot_start_time)

  return (
    <Link
      href={`/customer/lich-hen/${booking.booking_id}`}
      className="group block rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        {/* Left */}
        <div className="space-y-3">
          {/* Booking code */}
          <div className="flex items-center gap-3">
            <p className="font-mono text-base font-bold tracking-wide text-foreground">
              {booking.booking_id}
            </p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              booking.booking_type === 'WASH'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                : 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400'
            }`}>
              {booking.booking_type}
            </span>
          </div>

          {/* Service */}
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {booking.services_summary || 'Không có thông tin dịch vụ'}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {date && (
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                <span className="font-mono">{date}</span>
              </span>
            )}
            {time && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                <span className="font-mono">{time}</span>
              </span>
            )}
            {booking.license_plate && (
              <span className="flex items-center gap-1">
                <Car className="size-3.5" />
                <span className="font-mono">{booking.license_plate}</span>
                <span>({VEHICLE_SIZE_LABELS[booking.vehicle_size] || booking.vehicle_size})</span>
              </span>
            )}
          </div>

          {/* Washer (nếu đã phân công) */}
          {booking.assigned_washer && (
            <p className="text-xs text-muted-foreground">
              Nhân viên: <span className="font-medium text-foreground">{booking.assigned_washer}</span>
            </p>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-between">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            {statusIcon}
            <StatusBadge status={booking.status} />
          </div>

          {/* Action */}
          {action && (
            <button
              onClick={handleActionClick}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                action.primary
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border border-border text-foreground hover:bg-accent'
              }`}
            >
              {action.label}
              <ChevronRight className="size-3" />
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─────────────────────────────────────
// Helper: normalize paginated data từ BE (array thẳng, .items, hoặc .data nested)
// ─────────────────────────────────────

function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[]
  if (val && typeof val === 'object') {
    const v = val as Record<string, unknown>
    if (Array.isArray(v['items'])) return v['items'] as T[]
    if (Array.isArray(v['data']))  return v['data'] as T[]
  }
  return []
}

// ─────────────────────────────────────
// Main Page
// ─────────────────────────────────────

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

      // BE chỉ hỗ trợ filter đơn trị — fetch không truyền status để lấy tất cả,
      // sau đó filter client-side theo tab. Khi BE hỗ trợ multi-status, chỉ cần bỏ filter client và truyền thẳng.
      const res = await getMyBookings({
        page,
        limit: PAGE_SIZE,
        // Với tab single-status, vẫn truyền để giảm data transfer từ server
        ...(tab !== 'all' && statusFilter && statusFilter.length === 1
          ? { status: statusFilter[0] }
          : {}),
      })

      // Normalize: BE có thể trả data là array hoặc nested object
      // VÀ ẨN CÁC BOOKING ĐANG GIỮ SLOT (SLOT_HELD)
      const rawData = toArray<BookingSummary>(res.data).filter(b => b.status !== 'SLOT_HELD')

      // Filter client-side cho các tab có nhiều trạng thái (vì BE chỉ nhận đơn trị)
      const filtered =
        tab !== 'all' && statusFilter && statusFilter.length > 1
          ? rawData.filter((b) => statusFilter.includes(b.status as BookingStatus))
          : rawData

      setBookings(filtered)
      // Nếu filter client-side: tính lại total từ filtered (không còn chính xác cho pagination)
      // Nếu không filter: dùng pagination từ server
      const isClientFiltered = tab !== 'all' && statusFilter && statusFilter.length > 1
      setTotalPages(isClientFiltered ? 1 : (res.pagination?.totalPages ?? 1))
      setTotal(isClientFiltered ? filtered.length : (res.pagination?.total ?? filtered.length))
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
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Lịch hẹn của tôi
        </h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi và quản lý tất cả lịch rửa xe của bạn.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
        role="tablist"
        aria-label="Lọc lịch hẹn"
      >
        {tabEntries.map(([tabKey, label]) => (
          <button
            key={tabKey}
            role="tab"
            aria-selected={tab === tabKey}
            onClick={() => handleTabChange(tabKey)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              tab === tabKey
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-accent text-accent-foreground hover:bg-accent/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900/30 dark:bg-rose-950/20">
          <AlertCircle className="mx-auto mb-3 size-8 text-rose-500" />
          <p className="font-medium text-rose-700 dark:text-rose-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={loadBookings}
          >
            <RefreshCw className="mr-2 size-4" />
            Thử lại
          </Button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-accent">
            <CalendarDays className="size-7 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">
            {tab === 'all' ? 'Bạn chưa có lịch hẹn nào' : 'Không có lịch hẹn phù hợp'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === 'all'
              ? 'Đặt lịch ngay để bắt đầu hành trình chăm sóc xe của bạn.'
              : 'Thử chọn bộ lọc khác để xem thêm lịch hẹn.'}
          </p>
          {tab === 'all' && (
            <Button asChild className="mt-4">
              <Link href="/customer/dat-lich">Đặt lịch ngay</Link>
            </Button>
          )}
        </div>
      )}

      {/* Booking list */}
      {!loading && !error && bookings.length > 0 && (
        <>
          <div className="space-y-3">
            {/* Total count */}
            <p className="text-xs text-muted-foreground">
              Hiển thị {bookings.length} / {total} lịch hẹn
            </p>
            {bookings.map((booking) => (
              <BookingCard key={booking.booking_id} booking={booking} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </Button>
              <span className="text-sm font-medium text-foreground">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
