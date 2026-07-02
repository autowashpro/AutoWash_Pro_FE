"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, MapPin, Clock, Loader2, Car, Wrench, CheckCircle2, Camera } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { getWasherTaskDetail, washerCheckIn, startService } from "@/lib/api/bookings"
import { BOOKINGS } from "@/lib/data"
import { toast } from "sonner"

interface InspectionImage {
  imageId?: string
  image_id?: string
  imageUrl: string
  description?: string
}

interface Inspection {
  inspectionId?: string
  inspection_id?: string
  inspectionType?: string
  inspection_type?: string
  exteriorCondition?: string
  interiorCondition?: string
  notes?: string
  customerConfirmed?: boolean
  images: InspectionImage[]
}

export default function WasherTaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  const fetchTaskDetail = async () => {
    try {
      setLoading(true)
      const data = await getWasherTaskDetail(bookingId)
      setBooking(data)
    } catch (error) {
      console.error("Failed to fetch task detail, falling back", error)
      const fallback = BOOKINGS.find((b) => b.id === bookingId)
      if (fallback) {
        setBooking({
          booking_id: fallback.id,
          customer_name: fallback.customerName,
          phone: "090xxxxxxx",
          license_plate: fallback.vehicle.plate,
          vehicle_size: fallback.vehicle.size,
          branch_name: "Chi nhánh Gò Vấp",
          slot_start_time: fallback.timeSlot,
          slot_end_time: "Unknown",
          services: [fallback.serviceName],
          booking_type: "WASH",
          status: fallback.status,
          booking_notes: "",
          inspections: []
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTaskDetail()
  }, [bookingId])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center pb-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-2xl mb-2">🔍</p>
        <p className="font-semibold text-foreground">Không tìm thấy công việc</p>
        <Link href="/washer" className="mt-4 text-sm text-primary hover:underline">← Quay lại danh sách</Link>
      </div>
    )
  }

  const phoneDisplay = booking.phone || "N/A"

  const handleCheckIn = async () => {
    try {
      setActionLoading(true)
      await washerCheckIn(bookingId)
      toast.success("Đã xác nhận khách đến")
      fetchTaskDetail()
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi xác nhận check-in")
      setBooking({ ...booking, status: "CHECKED_IN" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleStartService = async () => {
    try {
      setActionLoading(true)
      await startService(bookingId)
      toast.success("Đã bắt đầu dịch vụ")
      router.push(`/washer/executing?bookingId=${bookingId}`)
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi bắt đầu dịch vụ")
      router.push(`/washer/executing?bookingId=${bookingId}`)
    } finally {
      setActionLoading(false)
    }
  }

  // Issue 4: Parse inspection images từ BE response
  const inspections: Inspection[] = booking.inspections || []
  const beforeInspection = inspections.find(i =>
    (i.inspectionType || i.inspection_type) === "BEFORE_SERVICE"
  )
  const afterInspection = inspections.find(i =>
    (i.inspectionType || i.inspection_type) === "AFTER_SERVICE"
  )
  const hasInspectionImages =
    (beforeInspection?.images?.length || 0) > 0 ||
    (afterInspection?.images?.length || 0) > 0

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/washer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80 transition-opacity">
          <ArrowLeft className="size-4" />
          Quay lại
        </Link>
        <StatusBadge status={booking.status} />
      </div>

      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400" />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Chi tiết công việc</h1>
        </div>
        <p className="font-mono text-sm font-semibold text-muted-foreground pl-3">{booking.booking_id}</p>
      </div>

      {/* Customer Info */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
          <h2 className="text-base font-bold text-foreground">Thông tin khách hàng</h2>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-400 text-sm font-bold text-white shadow-[var(--shadow-glow)]">
              {(booking.customer_name || "KH").split(' ').map((n: string) => n[0]).slice(-2).join('')}
            </span>
            <div>
              <p className="font-semibold text-foreground">{booking.customer_name}</p>
              <p className="font-mono text-sm text-muted-foreground">{phoneDisplay}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-border/50">
            <span className="font-mono text-xl font-extrabold text-foreground tracking-wider">{booking.license_plate}</span>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">{booking.vehicle_size}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white ${booking.booking_type === "WASH" ? "bg-primary" : "bg-violet-600"}`}>
              {booking.booking_type ?? "WASH"}
            </span>
          </div>
        </div>
      </section>

      {/* Service */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
          <h2 className="text-base font-bold text-foreground">Dịch vụ cần thực hiện</h2>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] space-y-2">
          {booking.services?.map((svc: string, index: number) => (
            <p key={index} className="font-semibold text-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              {svc}
            </p>
          ))}
        </div>
      </section>

      {/* Work Details */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
          <h2 className="text-base font-bold text-foreground">Chi tiết công việc</h2>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
              <Clock className="size-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Giờ dự kiến</p>
              <p className="font-mono font-bold text-foreground">{booking.slot_start_time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-100/60 dark:from-primary/15 dark:to-sky-900/30 text-primary">
              <MapPin className="size-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{booking.bay_id ? "Cầu nâng" : "Chi nhánh"}</p>
              <p className="font-bold text-foreground">
                {booking.bay_id
                  ? (booking.bay_id.startsWith("bay-")
                      ? `Cầu #${booking.bay_id.replace("bay-", "")}`
                      : `Cầu #${booking.bay_id}`)
                  : booking.branch_name}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Issue 4: Inspection Image Gallery */}
      {hasInspectionImages && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
            <h2 className="text-base font-bold text-foreground">Ảnh kiểm tra xe</h2>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] space-y-5">
            {/* Before Service */}
            {beforeInspection && (beforeInspection.images?.length || 0) > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="size-4 text-amber-500" />
                  <p className="text-sm font-semibold text-foreground">Trước khi rửa</p>
                  <span className="text-xs text-muted-foreground">({beforeInspection.images.length} ảnh)</span>
                </div>
                {beforeInspection.exteriorCondition && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Tình trạng: <span className="text-foreground font-medium">{beforeInspection.exteriorCondition}</span>
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {beforeInspection.images.map((img: InspectionImage, idx: number) => (
                    <button key={img.imageId || img.image_id || img.imageUrl || idx} onClick={() => setLightboxImg(img.imageUrl)}
                      className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted hover:ring-2 hover:ring-primary/50 transition-all group">
                      <img src={img.imageUrl} alt={img.description || "Ảnh trước rửa"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                      {img.description && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate">
                          {img.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {(beforeInspection?.images?.length || 0) > 0 && (afterInspection?.images?.length || 0) > 0 && (
              <div className="border-t border-border/50" />
            )}

            {/* After Service */}
            {afterInspection && (afterInspection.images?.length || 0) > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="size-4 text-emerald-500" />
                  <p className="text-sm font-semibold text-foreground">Sau khi rửa</p>
                  <span className="text-xs text-muted-foreground">({afterInspection.images.length} ảnh)</span>
                </div>
                {afterInspection.exteriorCondition && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Tình trạng: <span className="text-foreground font-medium">{afterInspection.exteriorCondition}</span>
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {afterInspection.images.map((img: InspectionImage, idx: number) => (
                    <button key={img.imageId || img.image_id || img.imageUrl || idx} onClick={() => setLightboxImg(img.imageUrl)}
                      className="relative aspect-video rounded-xl overflow-hidden border border-emerald-200 bg-muted hover:ring-2 hover:ring-emerald-400/50 transition-all group">
                      <img src={img.imageUrl} alt={img.description || "Ảnh sau rửa"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                      {img.description && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate">
                          {img.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Actions */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block h-4 w-0.5 rounded-full bg-primary" />
          <h2 className="text-base font-bold text-foreground">Hành động</h2>
        </div>
        <div className="space-y-3">
          {booking.status === "ASSIGNED" && (
            <button
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5"
              onClick={handleCheckIn} disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4" />}
              Xác nhận khách đến
            </button>
          )}

          {booking.status === "CHECKED_IN" && (
            <Link href={`/washer/${bookingId}/kiem-tra`}>
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5">
                <Car className="size-4" />
                Bắt đầu kiểm tra xe
              </button>
            </Link>
          )}

          {booking.status === "VEHICLE_INSPECTED" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-amber-800 space-y-3 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400">
              <div className="flex items-center justify-center gap-2">
                <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="font-medium text-sm">Đang chờ khách hàng xác nhận tình trạng xe...</p>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500">Khách hàng sẽ xem biên bản và xác nhận trên thiết bị của họ</p>
            </div>
          )}

          {booking.status === "CUSTOMER_CONFIRMED_CONDITION" && (
            <button
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5"
              onClick={handleStartService} disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Wrench className="size-4" />}
              Bắt đầu thực hiện dịch vụ
            </button>
          )}

          {booking.status === "IN_PROGRESS" && (
            <Link href={`/washer/executing?bookingId=${bookingId}`}>
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5">
                Chuyển đến màn hình thực hiện
              </button>
            </Link>
          )}

          {(booking.status === "COMPLETED" || booking.status === "CLOSED" || booking.status === "PAID") && (
            <Link href={`/washer/completed?bookingId=${bookingId}`}>
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5">
                <CheckCircle2 className="size-4" />
                Xem chi tiết hoàn thành
              </button>
            </Link>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="Ảnh kiểm tra xe"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()} />
          <button
            className="absolute top-4 right-4 text-white text-2xl font-bold bg-black/50 rounded-full size-10 flex items-center justify-center hover:bg-black/80"
            onClick={() => setLightboxImg(null)}>×</button>
        </div>
      )}
    </div>
  )
}
