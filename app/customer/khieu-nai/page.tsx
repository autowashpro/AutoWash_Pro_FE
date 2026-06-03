"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Upload, X } from "lucide-react"
import { BOOKINGS } from "@/lib/data"

const mockBooking = BOOKINGS[2]

export default function ComplaintPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<(string | null)[]>(Array(4).fill(null))
  const [submitted, setSubmitted] = useState(false)

  const handleImageUpload = (index: number) => {
    const newImages = [...images]
    newImages[index] = `image-${index}-${Date.now()}`
    setImages(newImages)
  }

  const handleImageRemove = (index: number) => {
    const newImages = [...images]
    newImages[index] = null
    setImages(newImages)
  }

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      setTitle("")
      setDescription("")
      setImages(Array(4).fill(null))
      setSubmitted(false)
    }, 2000)
  }

  const hasImages = images.some((img) => img !== null)

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Gửi khiếu nại
        </h1>
        <p className="text-sm text-muted-foreground">
          Mã đặt lịch: <span className="font-mono font-semibold text-primary">{mockBooking.id.toUpperCase()}</span>
        </p>
      </div>

      {/* Amber Warning Banner */}
      <div className="flex gap-3 rounded-lg bg-gold/10 p-4 border border-gold/30">
        <AlertCircle className="size-5 text-gold flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gold-foreground">
          Bạn có thể gửi khiếu nại trong vòng 7 ngày sau khi dịch vụ hoàn thành. Vui lòng cung cấp thông tin chi tiết và hình ảnh minh chứng.
        </p>
      </div>

      {/* Title Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Tiêu đề khiếu nại <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Xe chưa được rửa sạch..."
          className="input"
        />
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Mô tả chi tiết <span className="text-destructive">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
          className="input h-32 resize-none"
        />
      </div>

      {/* Image Upload Grid */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Thêm ảnh minh chứng
        </label>
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-lg border-2 border-dashed border-border bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center cursor-pointer group"
              onClick={() => !image && handleImageUpload(idx)}
            >
              {image ? (
                <>
                  <div className="absolute inset-0 bg-slate-200 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Ảnh {idx + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleImageRemove(idx)
                    }}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="size-4" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Upload className="size-6 text-muted-foreground mx-auto mb-1" />
                  <span className="text-xs text-muted-foreground">Nhấn để upload</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Tối đa 4 ảnh, định dạng JPG/PNG
        </p>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!title.trim() || !description.trim() || !hasImages || submitted}
        className="w-full h-12 bg-primary text-primary-foreground font-semibold"
      >
        {submitted ? "Đã gửi khiếu nại!" : "Gửi khiếu nại"}
      </Button>
    </div>
  )
}
