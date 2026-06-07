import { Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrustScoreDisplayProps {
  score: number
  showIcon?: boolean
  className?: string
}

export function TrustScoreDisplay({ score, showIcon = true, className }: TrustScoreDisplayProps) {
  let colorClass = "text-destructive bg-destructive/10 border-destructive/20"
  let dotColor = "bg-destructive"
  let label = "Yếu"
  let Icon = ShieldAlert

  if (score >= 80) {
    colorClass = "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/30"
    dotColor = "bg-emerald-500"
    label = "Tốt"
    Icon = ShieldCheck
  } else if (score >= 60) {
    colorClass = "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/30"
    dotColor = "bg-amber-500"
    label = "Trung bình"
    Icon = Shield
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        colorClass,
        className
      )}
    >
      {showIcon && <Icon className="size-3.5 shrink-0" />}
      <span className="font-mono">{score}</span>
      <span className="opacity-80">({label})</span>
    </div>
  )
}
