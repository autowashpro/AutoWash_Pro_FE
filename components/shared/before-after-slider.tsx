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

/**
 * Interactive before/after image comparison slider.
 * Supports mouse drag and touch drag.
 * Inspired by Ceramic Pro's service showcase.
 */
export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  alt = 'Before and after comparison',
  initialPosition = 50,
  beforeLabel = 'Trước',
  afterLabel = 'Sau',
  className = '',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
      className={`relative select-none overflow-hidden rounded-2xl ${className}`}
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
        src={afterSrc}
        alt={`${alt} - sau`}
        className="block h-full w-full object-cover"
        draggable={false}
      />

      {/* Before image (clipped, top layer) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeSrc}
          alt={`${alt} - trước`}
          className="block h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.4)]"
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
          className={`flex size-10 items-center justify-center rounded-full bg-white shadow-[0_2px_20px_rgba(0,0,0,0.25)] ring-2 ring-white/80 transition-transform duration-150 ${
            isDragging ? 'scale-110' : 'scale-100 hover:scale-105'
          }`}
        >
          {/* Double chevron icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M7 5l-4 5 4 5" stroke="#1470af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 5l4 5-4 5" stroke="#1470af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="pointer-events-none absolute bottom-3 left-3">
        <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {beforeLabel}
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3">
        <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {afterLabel}
        </span>
      </div>
    </div>
  )
}
