'use client'

import React, { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  strength?: number
  radius?: number
}

export function MagneticButton({
  children,
  className = '',
  strength = 0.35,
  radius = 60,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distX = e.clientX - centerX
    const distY = e.clientY - centerY
    const distance = Math.sqrt(distX * distX + distY * distY)

    if (distance < radius) {
      setOffset({
        x: distX * strength,
        y: distY * strength,
      })
    } else {
      setOffset({ x: 0, y: 0 })
    }
  }

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 })
  }

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: offset.x === 0 && offset.y === 0 ? 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' : 'transform 0.1s ease-out',
      }}
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl font-medium transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
