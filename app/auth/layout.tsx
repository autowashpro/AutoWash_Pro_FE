"use client"

import Link from "next/link"
import { Droplets } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left: Brand + Illustration */}
      <div className="relative hidden bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-700" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          <Link
            href="/"
            className="flex items-center gap-3 text-primary-foreground"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Droplets className="h-8 w-8" />
            </div>
            <span className="text-3xl font-bold tracking-tight">
              AutoWash Pro
            </span>
          </Link>

          {/* Car Illustration */}
          <div className="relative mt-8">
            <svg
              viewBox="0 0 400 200"
              className="h-48 w-auto text-primary-foreground"
              fill="none"
            >
              {/* Simple car silhouette */}
              <path
                d="M60 140 L80 140 L90 100 L140 80 L260 80 L310 100 L320 140 L340 140"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
              />
              <ellipse
                cx="100"
                cy="145"
                rx="20"
                ry="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
              />
              <ellipse
                cx="300"
                cy="145"
                rx="20"
                ry="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
              />
              {/* Water drops */}
              <circle cx="180" cy="50" r="4" fill="currentColor" opacity="0.6" />
              <circle cx="200" cy="40" r="5" fill="currentColor" opacity="0.7" />
              <circle cx="220" cy="55" r="3" fill="currentColor" opacity="0.5" />
              <circle cx="160" cy="45" r="3" fill="currentColor" opacity="0.4" />
              <circle cx="240" cy="48" r="4" fill="currentColor" opacity="0.6" />
            </svg>

            {/* Sparkle effects */}
            <div className="absolute -right-4 top-0 h-3 w-3 animate-pulse rounded-full bg-white/60" />
            <div className="absolute -left-2 top-8 h-2 w-2 animate-pulse rounded-full bg-white/40 delay-150" />
            <div className="absolute bottom-4 right-8 h-2 w-2 animate-pulse rounded-full bg-white/50 delay-300" />
          </div>

          <div className="mt-4 max-w-sm">
            <p className="text-xl font-medium text-white/90">
              Rửa xe cao cấp. Đặt lịch thông minh.
            </p>
            <p className="mt-2 text-sm text-white/70">
              Trải nghiệm dịch vụ rửa xe chuyên nghiệp với hệ thống đặt lịch tiện lợi.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-center gap-2 border-b border-border bg-card p-4 lg:hidden">
          <Droplets className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">AutoWash Pro</span>
        </div>

        {/* Form container */}
        <div className="flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}
