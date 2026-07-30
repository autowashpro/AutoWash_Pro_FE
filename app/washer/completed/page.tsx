"use client"

import { useState, useRef, Suspense } from "react"
import Link from "next/link"
import { Check, Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter } from "next/navigation"
import { completeService, createInspection, uploadInspectionImages } from "@/lib/api/bookings"
import { toast } from "sonner"

import { PhotoUploadGrid } from "@/components/shared/photo-upload-grid"

function CompletedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get("bookingId")

  const [images, setImages] = useState<File[]>([])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const canSubmit = notes.trim() !== "" && images.length > 0

  const handleSubmit = async () => {
    if (!bookingId) return
    try {
      setLoading(true)

      // 1. Create AFTER_SERVICE inspection
      const inspection = await createInspection(bookingId, {
        inspection_type: "AFTER_SERVICE",
        exterior_condition: "Hoàn thành vệ sinh, " + notes,
        interior_condition: "Bình thường",
      })

      // 2. Upload images
      const formData = new FormData()
      let hasImages = false
      images.forEach(file => {
        formData.append("files", file)
        hasImages = true
      })
      
      if (hasImages) {
        await uploadInspectionImages(bookingId, inspection.inspection_id, formData)
      }

      // 3. Complete service
      await completeService(bookingId, notes)

      toast.success("Đã bàn giao xe và hoàn thành dịch vụ")
      router.push("/washer")
    } catch (error: any) {
      console.error(error)
      const msg = error?.response?.data?.message || error?.response?.data?.Message || "Lỗi khi hoàn thành dịch vụ"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Success Animation */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm p-6 flex justify-center">
        <style>{`
          @keyframes checkmark-pop {
            0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
            60%  { transform: scale(1.2) rotate(5deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          .animate-checkmark-pop {
            animation: checkmark-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
        `}</style>
        <div className="size-20 rounded-full bg-success/20 flex items-center justify-center">
          <Check className="size-10 text-success animate-checkmark-pop" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Title & Description */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Dịch vụ hoàn thành! ✅
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload ảnh xe sau khi rửa và ghi chú trước khi bàn giao.
          </p>
        </div>

        {/* After-Service Photos */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-foreground">
            Ảnh sau khi hoàn thành
            <span className="text-rose-500 ml-1">*</span>
            <span className="text-xs font-normal text-muted-foreground ml-2">(Tối đa 6 ảnh)</span>
          </label>
          <PhotoUploadGrid images={images} onImagesChange={setImages} maxImages={6} />
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <label htmlFor="notes" className="block text-sm font-semibold text-foreground">
            Ghi chú sau dịch vụ
            <span className="text-rose-500 ml-1">*</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="VD: Xe sạch, đã wax bóng. Không phát sinh vấn đề."
            className="w-full rounded-2xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-28"
          />
        </div>
      </div>

      <div className="fixed bottom-0 right-0 left-0 md:left-20 lg:left-64 border-t border-border bg-card/95 backdrop-blur-sm p-4 z-40 flex justify-center">
        <div className="w-full max-w-2xl">
          <button
            disabled={!canSubmit || loading}
            onClick={handleSubmit}
            className="w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 text-base font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? <Loader2 className="mr-2 size-5 animate-spin" /> : null}
            Bàn giao xe &amp; Kết thúc
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CompletedPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <CompletedContent />
    </Suspense>
  )
}
