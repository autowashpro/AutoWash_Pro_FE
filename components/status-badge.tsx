import { cn } from "@/lib/utils"
import { STATUS_META, TIER_META, type BookingStatus, type MembershipTier } from "@/lib/data"

const TONE_CLASSES: Record<string, string> = {
  pending: "bg-gold/10 text-gold border border-gold/20",
  info: "bg-primary/10 text-primary border border-primary/20",
  active: "bg-primary text-primary-foreground border border-primary",
  success: "bg-success/10 text-success border border-success/20",
  danger: "bg-destructive/10 text-destructive border border-destructive/20",
}

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        TONE_CLASSES[meta.tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </span>
  )
}

export function TierBadge({ tier, className }: { tier: MembershipTier; className?: string }) {
  const meta = TIER_META[tier]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        className,
      )}
      style={{
        backgroundColor: `${meta.color}1a`,
        color: meta.color,
        border: `1px solid ${meta.color}33`,
      }}
    >
      {meta.label}
    </span>
  )
}
