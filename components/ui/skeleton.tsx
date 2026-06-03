import { cn } from '@/lib/utils'

interface SkeletonProps extends React.ComponentProps<'div'> {
  variant?: "text" | "circular" | "rectangular" | "rounded"
  width?: string | number
  height?: string | number
  count?: number
}

function Skeleton({
  variant = "rectangular",
  width = "100%",
  height = "auto",
  count = 1,
  className,
  ...props
}: SkeletonProps) {
  const skeletons = Array.from({ length: count })

  const baseClasses =
    "animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg"

  const variantClasses = {
    text: "h-4 rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    rounded: "rounded-xl",
  }

  const sizeStyle = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  }

  if (count > 1) {
    return (
      <div className="space-y-3">
        {skeletons.map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, variantClasses[variant], className)}
            style={sizeStyle}
            {...props}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={sizeStyle}
      {...props}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="card space-y-4">
      <Skeleton height={24} width="60%" variant="text" />
      <Skeleton height={16} width="100%" variant="text" />
      <Skeleton height={16} width="90%" variant="text" />
      <div className="flex gap-3 pt-2">
        <Skeleton height={10} width="30%" variant="rounded" />
        <Skeleton height={10} width="40%" variant="rounded" />
      </div>
    </div>
  )
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="table-container">
      <div className="table-header">
        <div className="flex gap-6 px-6 py-4">
          <Skeleton width="15%" height={16} variant="text" />
          <Skeleton width="25%" height={16} variant="text" />
          <Skeleton width="30%" height={16} variant="text" />
          <Skeleton width="20%" height={16} variant="text" />
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-6 px-6 py-4">
            <Skeleton width="15%" height={16} variant="text" />
            <Skeleton width="25%" height={16} variant="text" />
            <Skeleton width="30%" height={16} variant="text" />
            <Skeleton width="20%" height={16} variant="text" />
          </div>
        ))}
      </div>
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonTable }

