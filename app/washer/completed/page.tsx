"use client"

import { useState, useRef, Suspense } from "react"
import Link from "next/link"
import { Check, Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter } from "next/navigation"
import { completeService, createInspection, uploadInspectionImages } from "@/lib/api/bookings"
import { toast } from "sonner"

function CompletedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get("bookingId")

  const [images, setImages] = useState<{ file: File | null; preview: string | null }[]>(Array(4).fill({ file: null, preview: null }))
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleImageChange = (index: number, file: File) => {
    const newImages = [...images]
    newImages[index] = { file, preview: URL.createObjectURL(file) }
    setImages(newImages)
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages[index] = { file: null, preview: null }
    setImages(newImages)
  }

  const canSubmit = images.some(img => img.file !== null)

  const labels = ["Mặt trước", "Mặt sau", "Bên trái", "Bên phải"]

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
      images.forEach(img => {
        if (img.file) {
          formData.append("files", img.file)
          hasImages = true
        }
      })
      
      if (hasImages) {
        await uploadInspectionImages(bookingId, inspection.inspection_id, formData)
      }

      // 3. Complete service
      await completeService(bookingId, notes)

      toast.success("Đã bàn giao xe và hoàn thành dịch vụ")
      router.push("/washer")
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi hoàn thành dịch vụ")
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
          </label>
          <div className="grid grid-cols-2 gap-3">
            {images.map((image, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl border-2 border-dashed border-border bg-muted/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 group">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  ref={(el) => { fileRefs.current[idx] = el }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleImageChange(idx, e.target.files[0])
                  }}
                />
                {image.preview ? (
                  <>
                    <img src={image.preview} alt={labels[idx]} className="w-full h-full object-cover rounded-xl" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 size-8 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-4" />
                    </button>
                    <span className="absolute bottom-0 left-0 right-0 bg-black/50 py-1 text-center text-xs font-medium text-white">
                      {labels[idx]}
                    </span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRefs.current[idx]?.click()}
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="size-5 text-muted-foreground mb-1" />
                    <span className="text-xs font-medium text-muted-foreground text-center">{labels[idx]}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
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

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm p-4">
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
  )
}

export default function CompletedPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <CompletedContent />
    </Suspense>
  )
}
