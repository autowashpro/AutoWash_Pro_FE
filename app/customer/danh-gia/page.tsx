"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/star-rating"
import { BOOKINGS, formatDate, formatVND } from "@/lib/data"

const mockBooking = BOOKINGS[0]

export default function ReviewPage() {
  const [quality, setQuality] = useState(0)
  const [attitude, setAttitude] = useState(0)
  const [punctuality, setPunctuality] = useState(0)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      setQuality(0)
      setAttitude(0)
      setPunctuality(0)
      setComment("")
      setSubmitted(false)
    }, 2000)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Đánh giá dịch vụ
        </h1>
        <p className="text-sm text-muted-foreground">
          Chia sẻ trải nghiệm của bạn để giúp chúng tôi cải thiện dịch vụ
        </p>
      </div>

      {/* Booking Info Card */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wide">
              Mã đặt lịch
            </p>
            <p className="font-mono text-lg font-bold text-primary">
              {mockBooking.id.toUpperCase()}
            </p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
            Hoàn thành
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Dịch vụ</p>
            <p className="font-medium text-foreground">{mockBooking.service}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Ngày và giờ</p>
            <p className="font-medium text-foreground">
              {formatDate(mockBooking.date)} lúc {mockBooking.time}
            </p>
          </div>
        </div>
      </div>

      {/* Rating Criteria */}
      <div className="space-y-6">
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

      {/* Comment Textarea */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Nhận xét thêm (không bắt buộc)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          className="input w-full h-24 resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={quality === 0 || attitude === 0 || punctuality === 0 || submitted}
        className="w-full h-12 bg-primary text-primary-foreground font-semibold"
      >
        {submitted ? "Đã gửi!" : "Gửi đánh giá"}
      </Button>
    </div>
  )
}
