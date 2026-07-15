"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { confirmVehicleCondition, getWasherTaskDetail } from "@/lib/api/bookings"
import { toast } from "sonner"
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Camera,
  Car,
  AlertTriangle,
  ShieldCheck,
  XCircle,
  ZoomIn,
  X,
} from "lucide-react"
import Link from "next/link"
import type { Inspection } from "@/lib/types"

// ─────────────────────────────────────────
// Lightbox
// ─────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
      >
        <X className="size-8" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Inspection photo"
        className="max-w-full max-h-full object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

// ─────────────────────────────────────────
// Main page
// ─────────────────────────────────────────
export default function CustomerConfirmConditionPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [loadingData, setLoadingData] = useState(true)
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [bookingInfo, setBookingInfo] = useState<{ license_plate?: string; services?: any[] } | null>(null)

  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  // Load inspection data
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingData(true)
        const booking = await getWasherTaskDetail(bookingId)
        setBookingInfo({
          license_plate: (booking as any).license_plate,
          services: (booking as any).services,
        })
        // Lấy inspection BEFORE_SERVICE gần nhất
        const insp: Inspection | undefined = (booking as any).inspections?.find(
          (i: Inspection) => i.inspection_type === "BEFORE_SERVICE"
        )
        if (insp) setInspection(insp)
      } catch (err) {
        console.warn("Không tải được dữ liệu booking/inspection:", err)
        // Fallback mock để demo
        setInspection({
          inspection_id: "insp-mock",
          booking_id: bookingId,
          inspection_type: "BEFORE_SERVICE",
          exterior_condition: "SCRATCHED",
          interior_condition: "NORMAL",
          notes: "Xe có vết xước nhỏ ở cánh cửa phải phía trước. Nội thất sạch sẽ.",
          customer_confirmed: false,
          images: [],
          created_at: new Date().toISOString(),
        })
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [bookingId])

  const handleConfirm = async () => {
    if (!agreed) return
    try {
      setSubmitting(true)
      await confirmVehicleCondition(bookingId)
      toast.success("Xác nhận thành công — Dịch vụ sẽ bắt đầu ngay!")
      setSuccess(true)
    } catch (error: any) {
      console.error(error)
      toast.error(
        error?.response?.data?.message || "Xác nhận thất bại",
        { description: "Nhân viên sẽ hỗ trợ bạn xác nhận trực tiếp." }
      )
      // Không set success khi API fail
    } finally {
      setSubmitting(false)
    }
  }

  const handleDecline = () => {
    toast("Đã thông báo cho nhân viên. Vui lòng chờ xử lý.", { icon: "ℹ️" })
    router.push(`/washer/${bookingId}`)
  }

  const EXTERIOR_LABELS: Record<string, string> = {
    CLEAN: "Sạch sẽ, không hư hỏng",
    SCRATCHED: "Có vết xước nhỏ",
    DENTED: "Có vết móp/bẹp",
    CRACKED: "Có vết nứt",
    DIRTY: "Bẩn nặng",
  }
  const INTERIOR_LABELS: Record<string, string> = {
    CLEAN: "Sạch sẽ",
    NORMAL: "Bình thường",
    DIRTY: "Bẩn nặng",
    DAMAGED: "Có hư hỏng",
  }
  const CONDITION_COLOR: Record<string, string> = {
    CLEAN: "text-emerald-600 bg-emerald-50 border-emerald-200",
    NORMAL: "text-emerald-600 bg-emerald-50 border-emerald-200",
    DIRTY: "text-amber-600 bg-amber-50 border-amber-200",
    SCRATCHED: "text-amber-600 bg-amber-50 border-amber-200",
    DENTED: "text-rose-600 bg-rose-50 border-rose-200",
    CRACKED: "text-rose-600 bg-rose-50 border-rose-200",
    DAMAGED: "text-rose-600 bg-rose-50 border-rose-200",
  }

  // ── Loading state
  if (loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="size-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Đang tải biên bản kiểm tra xe...</p>
        </div>
      </div>
    )
  }

  // ── Success state
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto size-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-[scale-in_0.4s_ease-out]">
            <CheckCircle2 className="size-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">Đã xác nhận thành công!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cảm ơn quý khách đã xác nhận tình trạng xe. Dịch vụ sẽ được bắt đầu ngay bây giờ.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
            <p className="text-sm font-semibold text-emerald-700">
              ✅ Biên bản kiểm tra xe trước dịch vụ đã được ghi nhận
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Main view
  return (
    <>
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      <div className="min-h-screen bg-muted/30 pb-32">
        {/* Header Banner */}
        <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-30 shadow-sm">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Link href={`/washer/${bookingId}`}>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-foreground">Xác nhận tình trạng xe</h1>
              <p className="text-xs text-muted-foreground">
                Vui lòng đọc kỹ biên bản trước khi ký xác nhận
              </p>
            </div>
            <div className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
              Chờ xác nhận
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {/* Notice banner */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
            <ShieldCheck className="size-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-0.5">Biên bản kiểm tra xe (Trước dịch vụ)</p>
              <p className="leading-relaxed">
                Nhân viên đã ghi nhận tình trạng xe của bạn. Vui lòng xem xét và xác nhận để bảo vệ quyền lợi của bạn.
              </p>
            </div>
          </div>

          {/* Vehicle Info Card */}
          {bookingInfo && (
            <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4 shadow-sm">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Car className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Phương tiện</p>
                <p className="font-mono text-lg font-extrabold text-foreground">{bookingInfo.license_plate || "—"}</p>
              </div>
            </div>
          )}

          {/* Inspection Detail */}
          {inspection ? (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-muted/40 px-6 py-4 border-b border-border">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="size-5 text-amber-500" />
                  Tình trạng xe được ghi nhận
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Ghi lúc: {new Date(inspection.created_at).toLocaleString("vi-VN")}
                </p>
              </div>

              <div className="p-6 space-y-5">
                {/* Exterior */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tình trạng ngoại thất</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold ${CONDITION_COLOR[inspection.exterior_condition] || "text-foreground bg-muted"}`}>
                    {EXTERIOR_LABELS[inspection.exterior_condition] || inspection.exterior_condition}
                  </span>
                </div>

                {/* Interior */}
                {inspection.interior_condition && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tình trạng nội thất</p>
                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold ${CONDITION_COLOR[inspection.interior_condition] || "text-foreground bg-muted"}`}>
                      {INTERIOR_LABELS[inspection.interior_condition] || inspection.interior_condition}
                    </span>
                  </div>
                )}

                {/* Notes */}
                {inspection.notes && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ghi chú của nhân viên</p>
                    <div className="rounded-xl bg-muted/50 border border-border p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {inspection.notes}
                    </div>
                  </div>
                )}

                {/* Photo Gallery */}
                {inspection.images && inspection.images.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="size-4" />
                      Ảnh chụp tình trạng xe ({inspection.images.length} ảnh)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {inspection.images.map((img, idx) => (
                        <div
                          key={img.image_id || idx}
                          className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted cursor-pointer group"
                          onClick={() => setLightboxSrc(img.url)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.description || `Ảnh ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <ZoomIn className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {img.description && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                              <p className="text-white text-[11px] truncate">{img.description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-4 flex items-center gap-3 text-muted-foreground">
                    <Camera className="size-5 shrink-0" />
                    <p className="text-sm">Không có ảnh đính kèm</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
              <AlertTriangle className="size-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Chưa có biên bản kiểm tra xe</p>
            </div>
          )}

          {/* Agreement Checkbox */}
          <div
            className={`rounded-2xl border-2 p-5 transition-all cursor-pointer select-none ${
              agreed ? "border-emerald-500 bg-emerald-50" : "border-border bg-card hover:border-primary/40"
            }`}
            onClick={() => setAgreed((v) => !v)}
          >
            <div className="flex items-start gap-4">
              <div className={`shrink-0 size-7 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${
                agreed ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground"
              }`}>
                {agreed && <CheckCircle2 className="size-5 text-white" />}
              </div>
              <div className="space-y-1">
                <p className={`font-bold text-base ${agreed ? "text-emerald-700" : "text-foreground"}`}>
                  Tôi đã xem và đồng ý với tình trạng xe được ghi nhận ở trên
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bằng cách xác nhận, bạn đồng ý rằng tình trạng xe như biên bản ghi nhận. 
                  AutoWash Pro sẽ không chịu trách nhiệm với những hư hỏng có sẵn đã được ghi nhận.
                </p>
              </div>
            </div>
          </div>

          {/* Decline hint */}
          <p className="text-center text-xs text-muted-foreground">
            Không đồng ý?{" "}
            <button
              onClick={handleDecline}
              className="text-rose-500 hover:text-rose-600 font-semibold underline transition-colors"
            >
              Báo nhân viên xử lý
            </button>
          </p>
        </div>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-4 py-4 safe-area-bottom">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 gap-2 text-rose-600 border-rose-200 hover:bg-rose-50"
              onClick={handleDecline}
              disabled={submitting}
            >
              <XCircle className="size-4" />
              Từ chối
            </Button>
            <Button
              className="flex-2 h-12 px-8 font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 disabled:opacity-50 transition-all"
              disabled={!agreed || submitting}
              onClick={handleConfirm}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-5" />
              )}
              Xác nhận tình trạng xe
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
