'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

/**
 * Light / Dark mode toggle button.
 * Hydration-safe: renders nothing until mounted to avoid SSR mismatch.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="size-9" /> // placeholder to avoid layout shift

  const isDark = theme === 'dark'

  return (
    <button
      aria-label={isDark ? 'Chuyển sang Light mode' : 'Chuyển sang Dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`group relative flex size-9 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-card text-muted-foreground shadow-sm transition-all duration-300 hover:border-primary/30 hover:text-foreground hover:shadow-[var(--shadow-glow)] ${className}`}
    >
      {/* Sun icon (shown in dark mode — click to go light) */}
      <Sun
        className={`absolute size-4 transition-all duration-500 ${
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
        }`}
      />
      {/* Moon icon (shown in light mode — click to go dark) */}
      <Moon
        className={`absolute size-4 transition-all duration-500 ${
          isDark
            ? 'rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100'
        }`}
      />
    </button>
  )
}
