'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, CalendarDays, AlertTriangle, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { confirmAttendanceByToken, cancelAttendanceByToken } from '@/lib/api'

type PageState = 'loading' | 'success' | 'error' | 'cancel_preview' | 'cancel_loading' | 'cancel_success'

interface ActionResult {
  booking_id: string
  status: string
  message: string
  trust_score_change?: number
}

function ConfirmAttendanceContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const token = params?.token as string
  const action = searchParams?.get('action')

  const [state, setState] = useState<PageState>('loading')
  const [result, setResult] = useState<ActionResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const [bookingId, setBookingId] = useState<string>('')
  const [confirmToken, setConfirmToken] = useState<string>('')

  useEffect(() => {
    let bId = ''
    let cToken = ''
    const rawToken = token ? decodeURIComponent(token) : ''

    if (rawToken && (rawToken.includes(':') || rawToken.includes('%3A'))) {
      const decoded = rawToken.includes('%3A') ? decodeURIComponent(rawToken) : rawToken
      const idx = decoded.indexOf(':')
      if (idx !== -1) {
        bId = decoded.slice(0, idx)
        cToken = decoded.slice(idx + 1)
      }
    } else {
      bId = rawToken || ''
      cToken = searchParams?.get('tok_t2h') || ''
    }

    if (!bId || !cToken) {
      setState('error')
      setErrorMessage('Link xác nhận không hợp lệ. Vui lòng kiểm tra email của bạn.')
      return
    }

    setBookingId(bId)
    setConfirmToken(cToken)

    if (action === 'cancel') {
      // Nếu khách bấm nút Hủy từ email -> chuyển sang màn hình Preview (không gọi API hủy ngay để chống Bot scanner)
      setState('cancel_preview')
    } else {
      // Luồng xác nhận đến -> tự động chạy ngay khi mở trang
      doConfirm(bId, cToken)
    }
  }, [token, action, searchParams])

  async function doConfirm(bId: string, cToken: string) {
    setState('loading')
    try {
      const data = await confirmAttendanceByToken(bId, cToken)
      setResult(data)
      setState('success')
    } catch (err: unknown) {
      const errObj = err as { response?: { status?: number; data?: { code?: string; data?: { code?: string }; message?: string; error?: { message?: string } } } }
      const status = errObj?.response?.status
      const code = errObj?.response?.data?.code || errObj?.response?.data?.data?.code
      const errMsg = errObj?.response?.data?.message || errObj?.response?.data?.error?.message

      // Nếu lịch hẹn đã xác nhận trước đó -> Chuyển sang màn hình Thành công kèm thông báo tự hào
      if (status === 409 || code === 'ALREADY_CONFIRMED_ATTENDANCE' || (errMsg && errMsg.toLowerCase().includes('đã xác nhận'))) {
        setResult({
          booking_id: bId,
          status: 'CONFIRMED',
          message: 'Lịch hẹn của bạn đã được xác nhận thành công trước đó. Hẹn gặp quý khách tại xưởng AutoWash Pro!',
        } as any)
        setState('success')
        return
      }

      setErrorMessage(errMsg || 'Link xác nhận đã hết hạn hoặc không hợp lệ.')
      setState('error')
    }
  }

  async function doCancel() {
    if (!bookingId || !confirmToken) return
    setState('cancel_loading')
    try {
      const data = await cancelAttendanceByToken(bookingId, confirmToken, 'Khách yêu cầu hủy qua link email T-2h')
      setResult(data)
      setState('cancel_success')
    } catch (err: unknown) {
      const errObj = err as { response?: { status?: number; data?: { code?: string; data?: { code?: string }; message?: string; error?: { message?: string } } } }
      const status = errObj?.response?.status
      const code = errObj?.response?.data?.code || errObj?.response?.data?.data?.code
      const errMsg = errObj?.response?.data?.message || errObj?.response?.data?.error?.message

      // Nếu không được hủy do đã xác nhận sẽ đến trước đó
      if (status === 422 || code === 'CANCEL_NOT_ALLOWED' || (errMsg && errMsg.toLowerCase().includes('xác nhận sẽ đến'))) {
        setErrorMessage('Không thể hủy vì bạn đã bấm xác nhận sẽ tham dự dịch vụ trước đó. Hệ thống đã khóa vị trí cầu nâng cho xe bạn. Nếu gặp tình huống khẩn cấp, vui lòng gọi Hotline xưởng: 1900 8888 để Quản lý hỗ trợ.')
        setState('error')
        return
      }

      setErrorMessage(errMsg || 'Không thể hủy lịch hẹn (có thể lịch đã bị hủy hoặc quá thời hạn cho phép).')
      setState('error')
    }
  }

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

        {/* Cancel Loading */}
        {state === 'cancel_loading' && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-lg">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-rose-500/10">
              <Loader2 className="size-10 text-rose-500 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Đang xử lý hủy lịch hẹn...</h1>
            <p className="mt-2 text-sm text-muted-foreground">Vui lòng chờ trong giây lát.</p>
          </div>
        )}

        {/* Cancel Preview (Double check before cancel - Bot Proof) */}
        {state === 'cancel_preview' && (
          <div className="rounded-2xl border border-rose-200 bg-card p-8 text-center shadow-lg dark:border-rose-900/30 animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/40">
              <AlertTriangle className="size-8 text-rose-600 dark:text-rose-400" />
            </div>

            <h1 className="text-2xl font-bold text-foreground">Yêu cầu hủy lịch hẹn</h1>
            <p className="mt-1 font-mono text-sm font-semibold text-primary">#{bookingId}</p>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400 space-y-2">
              <div className="flex items-start gap-2 font-semibold">
                <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600" />
                <span>Lưu ý quy định T-2h của xưởng:</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Hủy lịch trong vòng 2 tiếng trước giờ hẹn sẽ bị trừ <b>-20 điểm uy tín (Trust Score)</b> do xưởng đã giữ chỗ cầu nâng và bố trí nhân sự.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="destructive"
                className="w-full font-semibold shadow-md shadow-rose-500/20"
                onClick={doCancel}
              >
                Đồng ý Hủy lịch hẹn
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => doConfirm(bookingId, confirmToken)}
              >
                Giữ lại lịch hẹn (Xác nhận sẽ đến)
              </Button>
            </div>
          </div>
        )}

        {/* Cancel Success */}
        {state === 'cancel_success' && (
          <div className="rounded-2xl border border-rose-200 bg-card p-10 text-center shadow-lg dark:border-rose-900/30 animate-in fade-in duration-300">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/30">
              <XCircle className="size-12 text-rose-500" />
            </div>

            <h1 className="text-2xl font-bold text-foreground">Đã hủy lịch hẹn</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Lịch hẹn <span className="font-mono font-bold text-foreground">#{result?.booking_id || bookingId}</span> đã được hủy thành công.
            </p>

            {typeof result?.trust_score_change === 'number' && result.trust_score_change < 0 && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
                Điểm uy tín thay đổi: <b>{result.trust_score_change} điểm</b>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <Button asChild>
                <Link href="/customer/dat-lich">
                  <CalendarDays className="mr-2 size-4" />
                  Đặt lại lịch mới
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/customer">Về trang chủ</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Success (Confirm Attendance) */}
        {state === 'success' && (
          <div className="rounded-2xl border border-emerald-200 bg-card p-10 text-center shadow-lg dark:border-emerald-900/30 animate-in fade-in duration-300">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30">
              <CheckCircle2 className="size-12 text-emerald-500 animate-in zoom-in-0 fade-in duration-500" />
            </div>

            <h1 className="text-2xl font-bold text-foreground">Xác nhận thành công!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Cảm ơn bạn đã xác nhận. Chúng tôi đang chờ đón bạn.
            </p>

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

            <div className="mt-4 pt-3 border-t border-border text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bạn đã xác nhận tham dự. Nếu có thay đổi khẩn cấp vào phút chót, vui lòng gọi Hotline <span className="font-semibold text-foreground">1900 8888 (Quản lý xưởng)</span> để được hỗ trợ.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="rounded-2xl border border-rose-200 bg-card p-10 text-center shadow-lg dark:border-rose-900/30">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/30">
              <XCircle className="size-12 text-rose-500" />
            </div>

            <h1 className="text-2xl font-bold text-foreground">Thao tác thất bại</h1>
            <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>

            <div className="mt-6 rounded-xl border border-border bg-accent/50 p-4 text-sm text-muted-foreground text-left space-y-1">
              <p>Điều này có thể xảy ra do:</p>
              <ul className="mt-1 space-y-0.5 list-disc list-inside">
                <li>Link xác nhận đã hết hạn (quá 30 phút)</li>
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

export default function ConfirmAttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
          <Loader2 className="size-10 text-primary animate-spin" />
        </div>
      }
    >
      <ConfirmAttendanceContent />
    </Suspense>
  )
}

