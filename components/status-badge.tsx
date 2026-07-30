import { cn } from "@/lib/utils"
import type { BookingStatus as ApiBookingStatus, MemberTier as ApiMemberTier } from "@/lib/types"
import { BOOKING_STATUS_CONFIG, TIER_LABELS } from "@/lib/types"

// Map legacy mock status keys to new API keys for safety
const LEGACY_STATUS_MAP: Record<string, ApiBookingStatus> = {
  PENDING: "PENDING_CONFIRMATION",
  CUSTOMER_CANCELLED: "CANCELLED_BY_CUSTOMER",
}

const TONE_CLASSES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800",
  blue: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30",
  amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30",
  orange: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/30",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30",
  red: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30",
}

export function StatusBadge({
  status,
  isAttendanceConfirmed,
  className,
}: {
  status: string
  isAttendanceConfirmed?: boolean
  className?: string
}) {
  // Convert legacy key if needed
  const normalizedKey = (LEGACY_STATUS_MAP[status] || status) as ApiBookingStatus
  const config = BOOKING_STATUS_CONFIG[normalizedKey]

  if (!config) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground", className)}>
        {status}
      </span>
    )
  }

  let label = config.label
  let color = config.color

  if (isAttendanceConfirmed && ['CONFIRMED', 'ASSIGNED'].includes(normalizedKey)) {
    label = 'Đã xác nhận đến'
    color = 'emerald'
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        TONE_CLASSES[color] || TONE_CLASSES.slate,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full bg-current")} aria-hidden="true" />
      {label}
    </span>
  )
}

export function TierBadge({ tier, className }: { tier: string; className?: string }) {
  const normalizedTier = tier as ApiMemberTier
  const label = TIER_LABELS[normalizedTier] || tier

  let color = "#1470af" // Primary blue for MEMBER
  let icon = "🌟"
  if (normalizedTier === "SILVER") {
    color = "#475569"
    icon = "🛡️"
  } else if (normalizedTier === "GOLD") {
    color = "#d97706"
    icon = "👑"
  } else if (normalizedTier === "PLATINUM") {
    color = "#7c3aed"
    icon = "👑"
  }

  const hasCustomColor = className && (className.includes("bg-") || className.includes("text-"))

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-extrabold whitespace-nowrap shrink-0 shadow-2xs transition-all",
        className
      )}
      style={
        hasCustomColor
          ? undefined
          : {
              backgroundColor: `${color}15`,
              color: color,
              borderColor: `${color}35`,
            }
      }
    >
      <span>{label}</span>
      <span className="text-[10px]">{icon}</span>
    </span>
  )
}

export function GenericBadge({
  label,
  tone = "slate",
  className,
}: {
  label: string
  tone?: keyof typeof TONE_CLASSES
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  )
}
