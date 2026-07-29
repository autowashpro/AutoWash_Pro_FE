'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface BeforeAfterSliderProps {
  /** URL of the "before" image (left side) */
  beforeSrc: string
  /** URL of the "after" image (right side) */
  afterSrc: string
  /** Alt text for accessibility */
  alt?: string
  /** Initial position of the handle (0–100) */
  initialPosition?: number
  /** Label shown on the left side */
  beforeLabel?: string
  /** Label shown on the right side */
  afterLabel?: string
  className?: string
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  alt = 'Before and after comparison',
  initialPosition = 50,
  beforeLabel = 'TRƯỚC HIỆU CHỈNH',
  afterLabel = 'SAU PHỦ CERAMIC 9H',
  className = '',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const [imgBefore, setImgBefore] = useState(beforeSrc)
  const [imgAfter, setImgAfter] = useState(afterSrc)

  // Fallback high-res detailing supercar images if local paths fail
  const fallbackBefore = 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80'
  const fallbackAfter = 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80'

  const getPositionFromEvent = useCallback(
    (clientX: number): number => {
      const container = containerRef.current
      if (!container) return position
      const rect = container.getBoundingClientRect()
      const x = clientX - rect.left
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
      return pct
    },
    [position]
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleTouchStart = () => {
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition(getPositionFromEvent(e.clientX))
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) setPosition(getPositionFromEvent(e.touches[0].clientX))
    }
    const handleEnd = () => setIsDragging(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, getPositionFromEvent])

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl bg-slate-900 ${className}`}
      style={{ cursor: isDragging ? 'ew-resize' : 'col-resize' }}
      role="slider"
      aria-label={alt}
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* After image (full width, bottom layer) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgAfter}
        onError={() => setImgAfter(fallbackAfter)}
        alt={`${alt} - sau`}
        className="block h-full w-full object-cover min-h-[320px]"
        draggable={false}
      />

      {/* Before image (clipped, top layer) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgBefore}
          onError={() => setImgBefore(fallbackBefore)}
          alt={`${alt} - trước`}
          className="block h-full w-full object-cover min-h-[320px]"
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="pointer-events-none absolute inset-y-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)]"
        style={{ left: `${position}%` }}
      />

      {/* Drag handle */}
      <div
        className="absolute inset-y-0 flex items-center"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className={`flex size-11 items-center justify-center rounded-full bg-white shadow-xl ring-4 ring-[#1470af]/40 transition-transform duration-150 ${
            isDragging ? 'scale-110' : 'scale-100 hover:scale-105'
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M7 5l-4 5 4 5" stroke="#1470af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 5l4 5-4 5" stroke="#1470af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Clean Badges */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-10">
        <span className="rounded-full bg-slate-900/80 px-3.5 py-1.5 font-mono text-[11px] font-bold text-white backdrop-blur-md border border-white/20 shadow-md">
          {beforeLabel}
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 z-10">
        <span className="rounded-full bg-[#1470af] px-3.5 py-1.5 font-mono text-[11px] font-bold text-white backdrop-blur-md shadow-md">
          {afterLabel}
        </span>
      </div>
    </div>
  )
}
