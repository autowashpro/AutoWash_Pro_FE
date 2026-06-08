'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  /** Direction variant: up (default), left, right */
  direction?: 'up' | 'left' | 'right'
  /** Delay in seconds before animation starts */
  delay?: number
  /** How much of the element must be visible before triggering (0–1) */
  threshold?: number
}

/**
 * Wraps children in a reveal animation triggered when the element
 * enters the viewport. Uses IntersectionObserver for performance.
 * Inspired by Linear.app scroll entrances.
 */
export function ScrollReveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Apply initial hidden state
    const dirClass = direction === 'up' ? 'reveal' : direction === 'left' ? 'reveal-left' : 'reveal-right'
    el.classList.add(dirClass)
    if (delay > 0) el.style.transitionDelay = `${delay}s`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [direction, delay, threshold])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
