'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import dynamic from 'next/dynamic'

const Cinematic3DCanvas = dynamic(
  () => import('./cinematic-3d-canvas').then(mod => mod.Cinematic3DCanvas),
  { ssr: false }
)
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

    let rafId: number | null = null
    let lastProgress = -1

    const trigger = ScrollTrigger.create({
      trigger: el,
      pin: pinEl,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (Math.abs(self.progress - lastProgress) > 0.002) {
          lastProgress = self.progress
          if (rafId) cancelAnimationFrame(rafId)
          rafId = requestAnimationFrame(() => {
            setScrollProgress(self.progress)
            setIsScrolling(true)
          })
        }
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
        scrollTimerRef.current = setTimeout(() => {
          setIsScrolling(false)
        }, 150)
      },
    })

    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 250)

    return () => {
      trigger.kill()
      clearTimeout(timer)
      if (rafId) cancelAnimationFrame(rafId)
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
        />

        {/* HUD Telemetry Overlay with 4 Gallery Stage Zones & Prominent CTA Button */}
        <HeroHudTelemetry
          progress={scrollProgress}
          isScrolling={isScrolling}
        />

        {/* Subtle Cyber Grid Overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)',
          }}
        />
      </div>
    </section>
  )
}
