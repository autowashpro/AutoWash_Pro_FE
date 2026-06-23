import type { MemberTier } from "@/lib/types"

interface TierBadgeProps {
  tier: MemberTier | string
  className?: string
}

const TIER_CONFIGS: Record<string, { label: string; subLabel: string; icon: string; style: string }> = {
  MEMBER: {
    label: "Thành viên",
    subLabel: "MEMBER",
    icon: "👤",
    style: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  SILVER: {
    label: "Bạc",
    subLabel: "SILVER",
    icon: "🥈",
    style: "bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 font-semibold",
  },
  GOLD: {
    label: "Vàng",
    subLabel: "GOLD",
    icon: "🥇",
    style: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900 font-semibold shadow-sm",
  },
  PLATINUM: {
    label: "Bạch Kim",
    subLabel: "PLATINUM",
    icon: "💎",
    style: "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900 font-bold tracking-wide shadow-sm",
  },
}

export function TierBadge({ tier, className = "" }: TierBadgeProps) {
  const config = TIER_CONFIGS[tier] || TIER_CONFIGS.MEMBER

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs border ${config.style} ${className}`}
      title={config.subLabel}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  )
}

/** Dùng để hiển thị label text-only (không có icon/badge) */
export function getTierLabel(tier: string): string {
  return TIER_CONFIGS[tier]?.label ?? tier
}

/** Màu cho trust score badge */
export function getTrustScoreStyle(score: number): string {
  if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20"
  if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20"
  if (score >= 40) return "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20"
  return "text-rose-600 bg-rose-50 border-rose-300 dark:text-rose-400 dark:bg-rose-950/20 font-bold"
}

/** Label tiếng Việt cho trust score */
export function getTrustScoreLabel(score: number): string {
  if (score >= 80) return "Uy tín cao"
  if (score >= 60) return "Tốt"
  if (score >= 40) return "Trung bình"
  return "Thấp ⚠️"
}
