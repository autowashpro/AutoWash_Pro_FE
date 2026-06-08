'use client'

import { useEffect, useRef, useState } from 'react'

interface CounterAnimationProps {
  /** Target value to count up to */
  target: number
  /** Duration of the animation in milliseconds */
  duration?: number
  /** Optional suffix (e.g., "+", "%", "★") */
  suffix?: string
  /** Optional prefix (e.g., "$") */
  prefix?: string
  /** CSS class for the displayed number */
  className?: string
  /** Easing: 'easeOut' (default) or 'linear' */
  easing?: 'easeOut' | 'linear'
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Animates a number from 0 to `target` when the component enters the viewport.
 * Uses requestAnimationFrame for smooth 60fps animation.
 * Inspired by Stripe's social proof section counters.
 */
export function CounterAnimation({
  target,
  duration = 2000,
  suffix = '',
  prefix = '',
  className = '',
  easing = 'easeOut',
}: CounterAnimationProps) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing === 'easeOut' ? easeOutCubic(progress) : progress
      const current = Math.round(easedProgress * target)
      setCount(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [hasStarted, target, duration, easing])

  // Format number with locale separators
  const formattedCount = count.toLocaleString('vi-VN')

  return (
    <span ref={ref} className={className}>
      {prefix}{formattedCount}{suffix}
    </span>
  )
}
