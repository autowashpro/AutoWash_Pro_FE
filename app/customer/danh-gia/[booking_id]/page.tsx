'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/star-rating'
import { getMyBookingDetail, rateBooking } from '@/lib/api'
import type { Booking } from '@/lib/types'
import { PageHeader } from '@/components/shared/page-header'
import { formatDate } from '@/lib/data'
import { toast } from 'sonner'

export default function ReviewPage() {
  const { booking_id } = useParams<{ booking_id: string }>()
  const router = useRouter()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loadingBooking, setLoadingBooking] = useState(true)
  const [quality, setQuality] = useState(0)      // service_quality_score
  const [attitude, setAttitude] = useState(0)    // staff_attitude_score
  const [punctuality, setPunctuality] = useState(0) // contributes to overall
  const [comment, setComment] = useState('')
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

  const handleSubmit = async () => {
    if (!booking_id) return
    setSubmitting(true)
    try {
      // Compute overall as rounded average of the 3 criteria
      const overall = Math.max(1, Math.round((quality + attitude + punctuality) / 3))
      await rateBooking(booking_id, {
        overall_score: overall,
        service_quality_score: quality,
        staff_attitude_score: attitude,
        comment: comment.trim() || undefined,
      })
      setSubmitted(true)
    } catch {
      toast.error('Không thể gửi đánh giá', { description: 'Vui lòng thử lại sau.' })
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
          <h2 className="text-2xl font-bold text-foreground">Cảm ơn bạn!</h2>
          <p className="text-muted-foreground">
            Đánh giá của bạn giúp chúng tôi cải thiện chất lượng dịch vụ tốt hơn.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row justify-center">
          <Button variant="outline" onClick={() => router.push('/customer/lich-hen')}>
            Xem lịch hẹn
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
        title="Đánh giá dịch vụ"
        description="Chia sẻ trải nghiệm để giúp chúng tôi cải thiện dịch vụ."
      />

      {/* Booking info card */}
      {loadingBooking ? (
        <div className="rounded-2xl border border-border bg-card p-4 animate-pulse h-24" />
      ) : booking ? (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wide">
                Mã đặt lịch
              </p>
              <p className="font-mono text-lg font-bold text-primary">
                {booking_id.toUpperCase()}
              </p>
            </div>
            <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
              Hoàn thành
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {booking.services && booking.services.length > 0 && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Dịch vụ</p>
                <p className="font-medium text-foreground">
                  {booking.services.map((s) => s.name).join(', ')}
                </p>
              </div>
            )}
            {booking.slot && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Ngày và giờ</p>
                <p className="font-medium text-foreground">
                  {formatDate(booking.slot.date)} lúc {booking.slot.start_time}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Rating criteria */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <h2 className="text-base font-semibold text-foreground">Đánh giá các tiêu chí</h2>
        <StarRating
          value={quality}
          onChange={setQuality}
          label="Chất lượng rửa xe"
          size="lg"
        />
        <StarRating
          value={attitude}
          onChange={setAttitude}
          label="Thái độ phục vụ"
          size="lg"
        />
        <StarRating
          value={punctuality}
          onChange={setPunctuality}
          label="Đúng giờ hẹn"
          size="lg"
        />
      </div>

      {/* Comment textarea */}
      <div className="space-y-2">
        <label htmlFor="review-comment" className="text-sm font-medium text-foreground">
          Nhận xét thêm{' '}
          <span className="text-muted-foreground font-normal">(không bắt buộc)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          rows={4}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Submit */}
      <Button
        id="submit-review-btn"
        onClick={handleSubmit}
        disabled={quality === 0 || attitude === 0 || punctuality === 0 || submitting}
        className="w-full h-12 font-semibold"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Đang gửi...
          </>
        ) : (
          'Gửi đánh giá'
        )}
      </Button>
    </div>
  )
}
