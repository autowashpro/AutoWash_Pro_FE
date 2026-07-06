'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CurtainCardProps {
  children: React.ReactNode
  index: number
  total: number
  className?: string
}

export function CurtainCard({ children, index, total, className }: CurtainCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start start', 'end start'],
  })

  // Scale down smoothly as next card slides over
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.45])

  return (
    <div ref={cardRef} className="sticky top-20 min-h-[82vh] w-full flex items-center justify-center pb-12">
      <motion.div
        className={cn(
          'w-full max-w-6xl rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0A0D16]/95 p-8 sm:p-14 shadow-xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden transition-colors duration-500',
          className
        )}
        style={{
          scale,
          opacity,
        }}
      >
        {/* Elegant Card Layer Indicator */}
        <div className="absolute top-6 right-8 font-mono text-xs font-semibold tracking-widest text-slate-400 dark:text-white/30">
          // CURTAIN LAYER 0{index + 1} OF 0{total}
        </div>

        {children}
      </motion.div>
    </div>
  )
}
