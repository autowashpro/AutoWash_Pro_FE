'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

export default function BookingSuccessPage() {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
  }, [])

  const bookingCode = 'AW-2026-001234'
  const service = 'AW Ultimate Wash'
  const date = '6 tháng 6, 2026'
  const time = '09:00 – 09:40'
  const vehicle = 'Toyota Camry (Sedan)'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      {/* Checkmark icon */}
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-success">
        {isAnimating && (
          <Check className="animate-checkmark h-12 w-12 text-success-foreground" strokeWidth={3} />
        )}
      </div>

      {/* Title */}
      <h1 className="mb-2 text-center text-3xl font-bold text-foreground text-balance">
        Đặt lịch thành công!
      </h1>

      {/* Booking code */}
      <div className="mb-8 rounded-lg bg-card p-4">
        <p className="mb-2 text-center text-sm text-muted-foreground">Mã đặt lịch</p>
        <p className="text-center font-mono text-2xl font-bold tracking-widest text-primary">
          {bookingCode}
        </p>
      </div>

      {/* Summary card */}
      <div className="mb-8 w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Dịch vụ</p>
            <p className="font-semibold text-foreground">{service}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ngày &amp; giờ</p>
            <p className="space-x-2">
              <span className="font-mono font-semibold text-foreground">{date}</span>
              <span className="font-mono font-semibold text-foreground">{time}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phương tiện</p>
            <p className="font-semibold text-foreground">{vehicle}</p>
          </div>
        </div>
      </div>

      {/* QR Code placeholder */}
      <div className="mb-8 w-full max-w-md">
        <div className="mb-3 flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
          <div className="text-center">
            <div className="mb-2 text-4xl text-muted-foreground">■</div>
            <p className="text-sm text-muted-foreground font-medium">QR Code Placeholder</p>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">QR thanh toán / check-in</p>
      </div>

      {/* Amber note */}
      <div className="mb-8 w-full max-w-md rounded-lg border border-gold/30 bg-gold/5 p-4">
        <p className="text-sm text-foreground leading-relaxed">
          <span className="font-semibold">📧 Lưu ý:</span>{' '}
          Chúng tôi sẽ gửi email nhắc lịch trước 2 tiếng. Vui lòng xác nhận để giữ lịch.
        </p>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-md space-y-3">
        <Link
          href="/customer"
          className="block rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Xem lịch hẹn của tôi
        </Link>
        <Link
          href="/"
          className="block rounded-lg border border-border px-6 py-3 text-center font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
