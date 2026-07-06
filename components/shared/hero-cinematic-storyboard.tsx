'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Cinematic3DCanvas } from './cinematic-3d-canvas'
import { HeroHudTelemetry } from './hero-hud-telemetry'
import { BookingWizard } from '@/components/customer/booking-wizard'
import { Sparkles, ArrowRight, X } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const MILESTONES = [
  { progress: 0.05, label: 'QUÁI THÚ LAB TỐI' },
  { progress: 0.35, label: 'QUÉT LASER LỘT XÁC' },
  { progress: 0.70, label: 'ĐIỂM NÓNG TELEMETRY' },
  { progress: 0.90, label: 'SHOWROOM IGNITION' },
]

export function HeroCinematicStoryboard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2
    const y = -(e.clientY / window.innerHeight - 0.5) * 2
    setMousePos({ x, y })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  useEffect(() => {
    const el = containerRef.current
    const pinEl = pinRef.current
    if (!el || !pinEl) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      pin: pinEl,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        setScrollProgress(self.progress)
        setIsScrolling(true)
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
        scrollTimerRef.current = setTimeout(() => {
          setIsScrolling(false)
        }, 180)
      },
    })

    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 250)

    return () => {
      trigger.kill()
      clearTimeout(timer)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    }
  }, [])

  const isClimax = scrollProgress >= 0.85

  return (
    <section
      ref={containerRef}
      className="relative bg-[#040509]"
      style={{ height: '400vh' }}
    >
      <div ref={pinRef} className="sticky top-0 h-screen w-full overflow-hidden bg-[#040509]">
        {/* 3D Showroom WebGL Canvas */}
        <Cinematic3DCanvas
          progress={scrollProgress}
          mousePos={mousePos}
          onSelectPackage={() => setIsBookingOpen(true)}
        />

        {/* HUD Telemetry Overlay with 4 Gallery Stage Zones & Prominent CTA Button */}
        <HeroHudTelemetry
          progress={scrollProgress}
          isScrolling={isScrolling}
          onOpenBooking={() => setIsBookingOpen(true)}
        />

        {/* Subtle Cyber Grid Overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)',
          }}
        />

        {/* Slide-Up VIP Booking Wizard Overlay Modal */}
        {isBookingOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col justify-end sm:justify-center items-center p-2 sm:p-6 animate-in fade-in duration-300">
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] p-4 sm:p-8">
              <button
                onClick={() => setIsBookingOpen(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="mb-4 text-center sm:text-left">
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-semibold">
                  CHUYÊN TRANG ĐẶT LỊCH VIP SHOWROOM
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                  Đăng Ký Chăm Sóc Siêu Xe Thể Thao
                </h2>
              </div>
              <div className="bg-white/95 rounded-2xl p-4 text-slate-900">
                <BookingWizard />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
