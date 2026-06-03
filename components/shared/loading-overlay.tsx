"use client"

import React from "react"

interface LoadingOverlayProps {
  isOpen: boolean
  message?: string
  fullScreen?: boolean
}

export function LoadingOverlay({
  isOpen,
  message = "Đang tải...",
  fullScreen = true,
}: LoadingOverlayProps) {
  if (!isOpen) return null

  return (
    <div
      className={`${
        fullScreen
          ? "fixed inset-0"
          : "absolute inset-0"
      } z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center`}
    >
      <div className="bg-card rounded-2xl border border-border p-8 shadow-2xl space-y-4 animate-fade-in max-w-sm">
        <div className="flex justify-center">
          <div className="relative size-12">
            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          </div>
        </div>
        <p className="text-center text-sm font-medium text-foreground">
          {message}
        </p>
      </div>
    </div>
  )
}

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`relative size-6 ${className}`}>
      <div className="absolute inset-0 rounded-full border-2 border-muted"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
    </div>
  )
}
