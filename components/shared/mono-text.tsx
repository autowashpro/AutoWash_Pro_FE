import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MonoTextProps {
  children: ReactNode
  className?: string
}

export function MonoText({ children, className }: MonoTextProps) {
  return (
    <span className={cn("font-mono tracking-tight", className)}>
      {children}
    </span>
  )
}
