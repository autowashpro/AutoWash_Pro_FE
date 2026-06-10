import type { MemberTier } from "@/lib/types"

interface TierBadgeProps {
  tier: MemberTier
  className?: string
}

export function TierBadge({ tier, className = "" }: TierBadgeProps) {
  const configs: Record<MemberTier, { label: string; style: string }> = {
    MEMBER: {
      label: "MEMBER",
      style: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    },
    SILVER: {
      label: "SILVER",
      style: "bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 font-semibold",
    },
    GOLD: {
      label: "GOLD",
      style: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900 font-semibold shadow-sm",
    },
    PLATINUM: {
      label: "PLATINUM",
      style: "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900 font-bold tracking-wide shadow-sm animate-pulse",
    },
  }

  const config = configs[tier] || configs.MEMBER

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs border font-mono ${config.style} ${className}`}
    >
      {config.label}
    </span>
  )
}
