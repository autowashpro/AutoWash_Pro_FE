"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  readOnly?: boolean
  label?: string
  size?: "sm" | "md" | "lg"
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  label,
  size = "md",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-6",
    lg: "size-8",
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readOnly && onChange(star)}
            disabled={readOnly}
            className={cn(
              "transition-colors",
              readOnly ? "cursor-default" : "cursor-pointer hover:opacity-75",
              star <= value ? "text-gold" : "text-muted-foreground",
            )}
            aria-label={`${star} star rating`}
          >
            <Star
              className={cn(sizeClasses[size], "fill-current")}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
