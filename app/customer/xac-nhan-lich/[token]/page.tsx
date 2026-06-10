'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, CalendarDays, Clock, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { confirmAttendance } from '@/lib/api'

type PageState = 'loading' | 'success' | 'error'

interface ConfirmResult {
  booking_id: string
  status: string
  message: string
}

export default function ConfirmAttendancePage() {
  const params = useParams()
  const token = params?.token as string

  const [state, setState] = useState<PageState>('loading')
  const [result, setResult] = useState<ConfirmResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setState('error')
      setErrorMessage('Link xác nhận không hợp lệ. Vui lòng kiểm tra email của bạn.')
      return
    }

    async function doConfirm() {
      try {
        // Token format: "bookingId:confirmToken" hoặc chỉ là token raw
        // API: confirmAttendance(bookingId, confirmToken?)
        // Nếu token chứa ":" thì tách, không thì dùng token làm bookingId
        let bookingId = token
        let confirmToken: string | undefined

        if (token.includes(':')) {
          const idx = token.indexOf(':')
          bookingId = token.slice(0, idx)
          confirmToken = token.slice(idx + 1)
        }

        const data = await confirmAttendance(bookingId, confirmToken)
        setResult(data)
        setState('success')
      } catch (err: unknown) {
        const errMsg = (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message
        setErrorMessage(errMsg || 'Link xác nhận đã hết hạn hoặc không hợp lệ.')
        setState('error')
      }
    }

    doConfirm()
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Loading */}
        {state === 'loading' && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-lg">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="size-10 text-primary animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Đang xác nhận lịch hẹn...</h1>
            <p className="mt-2 text-sm text-muted-foreground">Vui lòng chờ trong giây lát.</p>
          </div>
        )}

        {/* Success */}
        {state === 'success' && (
          <div className="rounded-2xl border border-emerald-200 bg-card p-10 text-center shadow-lg dark:border-emerald-900/30">
            {/* Animated checkmark */}
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30">
              <CheckCircle2
                className="size-12 text-emerald-500 animate-in zoom-in-0 fade-in duration-500"
              />
            </div>

            <h1 className="text-2xl font-bold text-foreground">Xác nhận thành công!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Cảm ơn bạn đã xác nhận. Chúng tôi đang chờ đón bạn.
            </p>

            {/* Booking info */}
            {result && (
              <div className="mt-6 rounded-xl border border-border bg-accent/50 p-4 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground shrink-0" />
                  <p className="text-sm">
                    <span className="text-muted-foreground">Mã lịch hẹn: </span>
                    <span className="font-mono font-bold text-foreground">{result.booking_id}</span>
                  </p>
                </div>
                {result.message && (
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                )}
              </div>
            )}

            {/* Reminder box */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-900/30 dark:bg-amber-950/20">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wide mb-1.5">
                📋 Nhắc nhở
              </p>
              <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-500">
                <li>• Vui lòng đến đúng giờ đã đặt.</li>
                <li>• Mang theo thông tin xe để đối chiếu.</li>
                <li>• Liên hệ <span className="font-semibold">AutoWash Pro</span> nếu cần thay đổi.</li>
              </ul>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild>
                <Link href="/customer/lich-hen">
                  <CalendarDays className="mr-2 size-4" />
                  Xem lịch hẹn của tôi
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/customer">Về trang chủ</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="rounded-2xl border border-rose-200 bg-card p-10 text-center shadow-lg dark:border-rose-900/30">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/30">
              <XCircle className="size-12 text-rose-500" />
            </div>

            <h1 className="text-2xl font-bold text-foreground">Xác nhận thất bại</h1>
            <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>

            <div className="mt-6 rounded-xl border border-border bg-accent/50 p-4 text-sm text-muted-foreground text-left space-y-1">
              <p>Điều này có thể xảy ra do:</p>
              <ul className="mt-1 space-y-0.5 list-disc list-inside">
                <li>Link xác nhận đã hết hạn (quá 2 giờ)</li>
                <li>Lịch hẹn đã bị hủy trước đó</li>
                <li>Link được sử dụng nhiều lần</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Button asChild>
                <Link href="/customer/lich-hen">
                  <CalendarDays className="mr-2 size-4" />
                  Xem lịch hẹn của tôi
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/customer/dat-lich">Đặt lịch mới</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Brand footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2026 AutoWash Pro · Chăm sóc xe chuyên nghiệp
        </p>
      </div>
    </div>
  )
}
