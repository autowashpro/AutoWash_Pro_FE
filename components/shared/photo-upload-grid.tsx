"use client"

import * as React from "react"
import { Camera, X, UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PhotoUploadGridProps {
  images: File[]
  onImagesChange: (images: File[]) => void
  maxImages?: number
  className?: string
  labels?: string[]
}

export function PhotoUploadGrid({
  images,
  onImagesChange,
  maxImages = 4,
  className,
  labels = ["Mặt trước", "Mặt sau", "Bên trái", "Bên phải", "Khác"],
}: PhotoUploadGridProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      const combined = [...images, ...newFiles].slice(0, maxImages)
      onImagesChange(combined)
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onImagesChange(newImages)
  }

  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-4", className)}>
      {images.map((img, i) => (
        <div
          key={`${img.name}-${i}`}
          className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted/50"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={URL.createObjectURL(img)}
            alt={`Uploaded ${i + 1}`}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => removeImage(i)}
            className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-destructive"
          >
            <X className="size-3.5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-center text-[10px] font-medium text-white backdrop-blur-sm">
            {labels[i] || "Khác"}
          </div>
        </div>
      ))}

      {images.length < maxImages && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-4 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
        >
          <UploadCloud className="size-6" />
          <span className="text-center text-[11px] font-medium">
            Tải ảnh lên ({images.length}/{maxImages})
          </span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
