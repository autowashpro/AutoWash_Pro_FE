"use client"

import { useState, useRef, useEffect } from "react"
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Camera,
  X,
  ZoomIn,
  AlertTriangle,
  Fuel,
  Hash,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getWasherTaskDetail, createInspection, uploadInspectionImages } from "@/lib/api/bookings"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { BOOKINGS } from "@/lib/data"
import { PhotoUploadGrid } from "@/components/shared/photo-upload-grid"

// ─── Types ──────────────────────────────────────────────────────────────────

type InspectionMode = "before" | "after"

interface DamageEntry {
  id: string
  label: string
  checked: boolean
  detail: string
}

interface InspectionState {
  mode: InspectionMode
  damages: DamageEntry[]
  exteriorNote: string
  interiorNote: string
  fuelLevel: string
  odometer: string
  images: File[]
  customerConfirmed: boolean
}

const INITIAL_DAMAGES: DamageEntry[] = [
  { id: "scratch", label: "Vết xước ngoại thất", checked: false, detail: "" },
  { id: "dent", label: "Móp méo thân xe", checked: false, detail: "" },
  { id: "glass", label: "Vỡ / nứt kính", checked: false, detail: "" },
  { id: "interior", label: "Hư hỏng nội thất", checked: false, detail: "" },
  { id: "light", label: "Hư hỏng đèn", checked: false, detail: "" },
  { id: "other", label: "Hư hỏng khác", checked: false, detail: "" },
]

const FUEL_OPTIONS = ["Gần hết", "1/4", "1/2", "3/4", "Đầy"]
const STEPS = ["W-03 Kiểm tra", "W-04 Ảnh xe", "W-05 Xác nhận"]

// ─── Main Component ──────────────────────────────────────────────────────────

export function InspectionReport({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [state, setState] = useState<InspectionState>({
    mode: "before",
    damages: INITIAL_DAMAGES.map((d) => ({ ...d })),
    exteriorNote: "",
    interiorNote: "",
    fuelLevel: "",
    odometer: "",
    images: [],
    customerConfirmed: false,
  })
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const data = await getWasherTaskDetail(bookingId)
        setJob(data)
      } catch (error) {
        console.error("Failed to fetch task detail, using fallback", error)
        const fallback = BOOKINGS.find((b: any) => b.id === bookingId)
        if (fallback) {
          setJob({
            booking_id: fallback.id,
            customer_name: fallback.customerName,
            license_plate: fallback.vehicle.plate,
            vehicle_size: fallback.vehicle.size,
            services: [fallback.serviceName],
          })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [bookingId])

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true)

      // Format exterior condition from damages
      const checkedDamages = state.damages.filter(d => d.checked)
      let exteriorCondition = checkedDamages.map(d => `${d.label}: ${d.detail || "Có"}`).join("\n")
      if (state.exteriorNote) {
        exteriorCondition += `\n${state.exteriorNote}`
      }
      if (!exteriorCondition) {
        exteriorCondition = "Bình thường"
      }

      let interiorCondition = state.interiorNote || "Bình thường"

      const inspectionType = state.mode === "before" ? "BEFORE_SERVICE" : "AFTER_SERVICE"

      const inspectionPayload = {
        inspection_type: inspectionType as any,
        exterior_condition: exteriorCondition,
        interior_condition: interiorCondition,
        notes: `Nhiên liệu: ${state.fuelLevel}, ODO: ${state.odometer}`
      }

      // 1. Create inspection record
      const inspection = await createInspection(bookingId, inspectionPayload)

      // 2. Upload images if any
      if (state.images.length > 0) {
        const formData = new FormData()
        state.images.forEach(f => formData.append("files", f))
        await uploadInspectionImages(bookingId, inspection.inspection_id, formData)
      }

      toast.success("Biên bản kiểm tra đã được gửi thành công")
      setSubmitted(true)
    } catch (error: any) {
      console.error("createInspection error:", error)
      const beMsg = error?.response?.data?.message || error?.response?.data?.Message || "Lỗi khi gửi biên bản kiểm tra"
      toast.error(beMsg)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading || !job) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-8" />
        </span>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground">
          Biên bản kiểm tra đã gửi
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground text-pretty">
          Đơn {job.booking_id} đã được ghi nhận. Hệ thống đang chờ khách hàng xác nhận tình trạng xe.
        </p>
        <Button 
          className="mt-6" 
          onClick={() => router.push(`/washer/${bookingId}`)}
        >
          Quay lại chi tiết công việc
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Step Indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={i} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  i < step
                    ? "bg-success text-success-foreground"
                    : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <CheckCircle2 className="size-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  i === step ? "text-primary" : "text-muted-foreground",
                )}
              >
                {label.split(" ").slice(1).join(" ")}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-0.5 flex-1 transition-colors",
                  i < step ? "bg-success" : "bg-border",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 0 && (
        <StepCheckForm
          job={job}
          state={state}
          setState={setState}
          onNext={() => setStep(1)}
        />
      )}
      {step === 1 && (
        <StepPhotos
          state={state}
          setState={setState}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
          onLightbox={setLightbox}
        />
      )}
      {step === 2 && (
        <StepConfirm
          job={job}
          state={state}
          setState={setState}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
          onLightbox={setLightbox}
          loading={submitLoading}
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white"
            onClick={() => setLightbox(null)}
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
          <img
            src={lightbox}
            alt="Xem ảnh xe"
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  )
}

// ─── W-03: Check Form ────────────────────────────────────────────────────────

function StepCheckForm({
  job,
  state,
  setState,
  onNext,
}: {
  job: any
  state: InspectionState
  setState: (s: InspectionState) => void
  onNext: () => void
}) {
  const toggleMode = (mode: InspectionMode) => setState({ ...state, mode })

  const toggleDamage = (id: string, checked: boolean) =>
    setState({
      ...state,
      damages: state.damages.map((d) =>
        d.id === id ? { ...d, checked, detail: checked ? d.detail : "" } : d,
      ),
    })

  const setDetail = (id: string, detail: string) =>
    setState({
      ...state,
      damages: state.damages.map((d) => (d.id === id ? { ...d, detail } : d)),
    })

  return (
    <div className="space-y-5">
      {/* Booking mini card */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
          <Camera className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-foreground">{job.license_plate}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {job.vehicle_size}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {job.customer_name} · {job.services?.[0]}
          </p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{job.booking_id}</span>
      </div>

      {/* Damage Checklist */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground flex items-center justify-between">
          <span>Ghi nhận hư hỏng</span>
          <span className="text-xs font-normal text-muted-foreground">(Không bắt buộc)</span>
        </h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
          {state.damages.map((d) => (
            <div key={d.id} className="space-y-2 p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={d.checked}
                  onChange={(e) => toggleDamage(d.id, e.target.checked)}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    d.checked ? "text-destructive" : "text-foreground",
                  )}
                >
                  {d.label}
                </span>
              </label>
              {d.checked && (
                <textarea
                  rows={2}
                  value={d.detail}
                  onChange={(e) => setDetail(d.id, e.target.value)}
                  placeholder="Mô tả vị trí chi tiết, VD: Vết xước nhỏ cạnh gương phải..."
                  className="ml-7 w-[calc(100%-1.75rem)] rounded-lg border border-border bg-rose-50 px-3 py-2 text-sm text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Ngoại thất (ghi chú)</label>
          <textarea
            rows={3}
            value={state.exteriorNote}
            onChange={(e) => setState({ ...state, exteriorNote: e.target.value })}
            placeholder="VD: Vết xước nhỏ cạnh gương chiếu hậu phải"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Nội thất (ghi chú)</label>
          <textarea
            rows={3}
            value={state.interiorNote}
            onChange={(e) => setState({ ...state, interiorNote: e.target.value })}
            placeholder="VD: Sàn xe có nhiều cát, ghế sau hơi bẩn"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
          />
        </div>
      </div>

      {/* Fuel & Odometer */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Fuel className="size-4 text-muted-foreground" />
            Mức nhiên liệu
          </label>
          <select
            value={state.fuelLevel}
            onChange={(e) => setState({ ...state, fuelLevel: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
          >
            <option value="">-- Chọn --</option>
            {FUEL_OPTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Hash className="size-4 text-muted-foreground" />
            Số km hiện tại
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={state.odometer}
            onChange={(e) => setState({ ...state, odometer: e.target.value })}
            placeholder="VD: 45.230"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-mono text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
          />
        </div>
      </div>

      <Button className="w-full" onClick={onNext}>
        Chụp ảnh xe
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}

// ─── W-04: Photo Upload ──────────────────────────────────────────────────────

function StepPhotos({
  state,
  setState,
  onBack,
  onNext,
  onLightbox,
}: {
  state: InspectionState
  setState: (s: InspectionState) => void
  onBack: () => void
  onNext: () => void
  onLightbox: (url: string) => void
}) {
  const hasMinPhoto = state.images.length > 0

  return (
    <div className="space-y-5">
      {/* Title + back */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-lg font-bold tracking-tight text-foreground">Ảnh kiểm tra xe</h2>
      </div>

      {/* Required label */}
      <p className="text-xs font-semibold text-destructive">
        * Bắt buộc ít nhất 1 ảnh kiểm tra xe (Tối đa 6 ảnh)
      </p>

      {/* PhotoUploadGrid */}
      <PhotoUploadGrid
        images={state.images}
        onImagesChange={(images) => setState({ ...state, images })}
        maxImages={6}
      />

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          <ChevronLeft className="size-4" />
          Quay lại
        </Button>
        <Button className="flex-1" disabled={!hasMinPhoto} onClick={onNext}>
          Gửi biên bản
          <ChevronRight className="size-4" />
        </Button>
      </div>
      {!hasMinPhoto && (
        <p className="text-center text-xs text-muted-foreground">
          Vui lòng chọn hoặc chụp ít nhất 1 ảnh để tiếp tục.
        </p>
      )}
    </div>
  )
}

// ─── W-05: Customer Confirmation ────────────────────────────────────────────

function StepConfirm({
  job,
  state,
  setState,
  onBack,
  onSubmit,
  onLightbox,
  loading,
}: {
  job: any
  state: InspectionState
  setState: (s: InspectionState) => void
  onBack: () => void
  onSubmit: () => void
  onLightbox: (url: string) => void
  loading: boolean
}) {
  const checkedDamages = state.damages.filter((d) => d.checked)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Xác nhận tình trạng xe</h2>
          <p className="text-xs text-muted-foreground">
            Vui lòng cho khách hàng đọc và xác nhận thông tin kiểm tra xe.
          </p>
        </div>
      </div>

      {/* Results Card */}
      <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
        {/* Booking info */}
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-foreground">{job.license_plate}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {job.vehicle_size}
              </span>
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold text-white",
                state.mode === "before" ? "bg-gold" : "bg-success",
              )}>
                {state.mode === "before" ? "TRƯỚC" : "SAU"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{job.customer_name} · {job.booking_id}</p>
          </div>
        </div>

        {/* Damage list */}
        <div className="px-5 py-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hư hỏng ghi nhận</p>
          {checkedDamages.length === 0 ? (
            <p className="text-sm text-success font-medium">Không ghi nhận hư hỏng</p>
          ) : (
            <div className="space-y-2">
              {checkedDamages.map((d) => (
                <div key={d.id} className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-2.5">
                  <p className="text-sm font-semibold text-destructive">{d.label}</p>
                  {d.detail && <p className="text-xs text-rose-700 mt-0.5">{d.detail}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        {(state.exteriorNote || state.interiorNote) && (
          <div className="px-5 py-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ghi chú</p>
            {state.exteriorNote && (
              <div>
                <p className="text-xs text-muted-foreground">Ngoại thất</p>
                <p className="text-sm text-foreground">{state.exteriorNote}</p>
              </div>
            )}
            {state.interiorNote && (
              <div>
                <p className="text-xs text-muted-foreground">Nội thất</p>
                <p className="text-sm text-foreground">{state.interiorNote}</p>
              </div>
            )}
          </div>
        )}

        {/* Fuel + Odometer */}
        {(state.fuelLevel || state.odometer) && (
          <div className="grid grid-cols-2 divide-x divide-border px-5 py-4">
            {state.fuelLevel && (
              <div className="pr-4">
                <p className="text-xs text-muted-foreground">Nhiên liệu</p>
                <p className="text-sm font-semibold text-foreground">{state.fuelLevel}</p>
              </div>
            )}
            {state.odometer && (
              <div className="pl-4">
                <p className="text-xs text-muted-foreground">Số km</p>
                <p className="font-mono text-sm font-semibold text-foreground">{state.odometer} km</p>
              </div>
            )}
          </div>
        )}

        {/* Photo Gallery */}
        {state.images.length > 0 && (
          <div className="px-5 py-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ảnh xe ({state.images.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {state.images.map((file, idx) => {
                const url = URL.createObjectURL(file)
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onLightbox(url)}
                    className="group relative size-16 overflow-hidden rounded-xl border border-border"
                    aria-label={`Xem ảnh ${idx + 1}`}
                  >
                    <img src={url} alt={`Ảnh ${idx + 1}`} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <ZoomIn className="size-4 text-white" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Customer Confirmation Checkbox */}
      <label className="flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-border bg-card p-5 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent">
        <input
          type="checkbox"
          className="mt-0.5 size-5 rounded border-border accent-primary flex-shrink-0"
          checked={state.customerConfirmed}
          onChange={(e) => setState({ ...state, customerConfirmed: e.target.checked })}
        />
        <span className="text-sm font-medium leading-relaxed text-foreground">
          Tôi xác nhận tình trạng xe như trên trước khi thực hiện dịch vụ
        </span>
      </label>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button
          className="w-full"
          disabled={!state.customerConfirmed || loading}
          onClick={onSubmit}
        >
          {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4 mr-2" />}
          Xác nhận &amp; Bắt đầu chờ duyệt
        </Button>
        <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/5">
          <AlertTriangle className="size-4 mr-2" />
          Từ chối / Báo Manager
        </Button>
      </div>
    </div>
  )
}
