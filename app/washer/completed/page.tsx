"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BOOKINGS } from "@/lib/data"

const mockBooking = BOOKINGS.find(b => b.id === "b-1")!

export default function CompletedPage() {
  const [images, setImages] = useState<(string | null)[]>(Array(4).fill(null))
  const [notes, setNotes] = useState("")

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages[index] = null
    setImages(newImages)
  }

  const canSubmit = images.some(img => img !== null) && notes.trim().length > 0

  const labels = ["Mặt trước", "Mặt sau", "Bên trái", "Bên phải"]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Success Animation */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm p-6 flex justify-center">
        <div className="size-20 rounded-full bg-success/20 flex items-center justify-center">
          <Check className="size-10 text-success animate-checkmark" />
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
                {image ? (
                  <>
                    <img src={image} alt={labels[idx]} className="w-full h-full object-cover rounded-xl" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 size-8 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-4" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <Upload className="size-5 text-muted-foreground mb-1" />
                    <span className="text-xs font-medium text-muted-foreground text-center">{labels[idx]}</span>
                  </label>
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
          disabled={!canSubmit}
          className="w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 text-base font-semibold text-white shadow-[var(--shadow-glow)] transition-all duration-200 hover:shadow-[var(--shadow-glow-lg)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Bàn giao xe &amp; Kết thúc
        </button>
      </div>
    </div>
  )
}
