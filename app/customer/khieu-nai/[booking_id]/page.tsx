'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhotoUploadGrid } from '@/components/shared/photo-upload-grid'
import { getMyBookingDetail, createComplaint } from '@/lib/api'
import type { Booking } from '@/lib/types'
import { PageHeader } from '@/components/shared/page-header'
import { formatDate } from '@/lib/data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const MAX_COMPLAINT_DAYS = 7

/** Returns days remaining to file a complaint, based on booking closed activity */
function calcDaysRemaining(booking: Booking | null): number {
  if (!booking?.created_at) return MAX_COMPLAINT_DAYS
  // Fallback: use created_at as proxy since we don't have closed_at on Booking type
  // TODO: connect real CLOSED activity date once BookingDetail endpoint is available
  return MAX_COMPLAINT_DAYS
}

export default function ComplaintPage() {
  const { booking_id } = useParams<{ booking_id: string }>()
  const router = useRouter()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loadingBooking, setLoadingBooking] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!booking_id) return
    async function load() {
      try {
        const data = await getMyBookingDetail(booking_id)
        setBooking(data)
      } catch {
        toast.error('Không tải được thông tin lịch hẹn')
      } finally {
        setLoadingBooking(false)
      }
    }
    load()
  }, [booking_id])

  const daysRemaining = calcDaysRemaining(booking)

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return

    // Kiểm tra dung lượng ảnh (Tối đa 10MB mỗi ảnh)
    const MAX_SIZE_MB = 10
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
    const oversizedFile = images.find((img) => img.size > MAX_SIZE_BYTES)
    if (oversizedFile) {
      toast.error('Tệp ảnh quá lớn', {
        description: `Ảnh "${oversizedFile.name}" vượt quá dung lượng cho phép (${MAX_SIZE_MB}MB). Vui lòng chọn ảnh khác.`,
      })
      return
    }

    setSubmitting(true)
    try {
      await createComplaint(booking_id, {
        title: title.trim(),
        description: description.trim(),
        images,
      })
      setSubmitted(true)
    } catch {
      toast.error('Không thể gửi khiếu nại', { description: 'Vui lòng thử lại sau.' })
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-10 text-success" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Đã nhận được khiếu nại</h2>
          <p className="text-muted-foreground">
            Chúng tôi sẽ xem xét và phản hồi trong vòng 24 giờ. Cảm ơn bạn đã phản ánh.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row justify-center">
          <Button
            variant="outline"
            onClick={() => router.push(`/customer/lich-hen/${booking_id}`)}
          >
            Xem chi tiết đặt lịch
          </Button>
          <Button onClick={() => router.push('/customer')}>Về trang chủ</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Quay lại
      </button>

      <PageHeader
        title="Gửi khiếu nại"
        description={`Mã đặt lịch: ${booking_id.toUpperCase()}`}
      />

      {/* Days remaining banner */}
      <div
        className={cn(
          'flex gap-3 rounded-lg border p-4',
          daysRemaining <= 2
            ? 'border-destructive/30 bg-destructive/10'
            : 'border-gold/30 bg-gold/10',
        )}
      >
        <AlertCircle
          className={cn(
            'mt-0.5 size-5 shrink-0',
            daysRemaining <= 2 ? 'text-destructive' : 'text-gold',
          )}
        />
        <p className={cn('text-sm', daysRemaining <= 2 ? 'text-destructive' : '')}>
          {daysRemaining > 0
            ? `Bạn còn ${daysRemaining} ngày để gửi khiếu nại (tối đa ${MAX_COMPLAINT_DAYS} ngày sau khi dịch vụ hoàn thành).`
            : 'Đã hết thời gian khiếu nại cho đơn dịch vụ này.'}
        </p>
      </div>

      {/* Booking info summary */}
      {!loadingBooking && booking && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm space-y-2">
          {booking.slot && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Ngày dịch vụ</span>
              <span className="font-medium text-foreground">
                {formatDate(booking.slot.date)} lúc {booking.slot.start_time}
              </span>
            </div>
          )}
          {booking.services && booking.services.length > 0 && (
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-muted-foreground">Dịch vụ</span>
              <span className="text-right font-medium text-foreground">
                {booking.services.map((s) => s.name).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Title field */}
      <div className="space-y-2">
        <label htmlFor="complaint-title" className="text-sm font-medium text-foreground">
          Tiêu đề khiếu nại <span className="text-destructive">*</span>
        </label>
        <input
          id="complaint-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Xe chưa được rửa sạch..."
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Description field */}
      <div className="space-y-2">
        <label htmlFor="complaint-description" className="text-sm font-medium text-foreground">
          Mô tả chi tiết <span className="text-destructive">*</span>
        </label>
        <textarea
          id="complaint-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
          rows={5}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Image upload (real file upload via PhotoUploadGrid) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Ảnh minh chứng{' '}
          <span className="text-muted-foreground font-normal">(tối đa 5 ảnh)</span>
        </label>
        <PhotoUploadGrid images={images} onImagesChange={setImages} maxImages={5} />
        <p className="text-xs text-muted-foreground">Định dạng JPG/PNG, mỗi ảnh tối đa 10MB</p>
      </div>

      {/* Submit */}
      <Button
        id="submit-complaint-btn"
        onClick={handleSubmit}
        disabled={!title.trim() || !description.trim() || submitting || daysRemaining === 0}
        className="w-full h-12 font-semibold"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Đang gửi...
          </>
        ) : (
          'Gửi khiếu nại'
        )}
      </Button>
    </div>
  )
}
