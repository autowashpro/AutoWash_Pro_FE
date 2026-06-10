'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ConfirmDialogTone = 'danger' | 'warning' | 'info'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: ConfirmDialogTone
  loading?: boolean
  /** Nội dung bổ sung render bên trong dialog */
  children?: React.ReactNode
}

const TONE_CONFIG: Record<
  ConfirmDialogTone,
  { icon: React.ElementType; iconClass: string; iconBg: string; confirmClass: string }
> = {
  danger: {
    icon: AlertTriangle,
    iconClass: 'text-rose-500',
    iconBg: 'bg-rose-50 dark:bg-rose-950/30',
    confirmClass: 'bg-rose-500 hover:bg-rose-600 text-white focus-visible:ring-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
    confirmClass: 'bg-amber-500 hover:bg-amber-600 text-white focus-visible:ring-amber-500',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-500',
    iconBg: 'bg-blue-50 dark:bg-blue-950/30',
    confirmClass: '',
  },
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  tone = 'danger',
  loading = false,
  children,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const config = TONE_CONFIG[tone]
  const Icon = config.icon

  // Trap Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open && !loading) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, loading, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-dialog-title"
      onClick={(e) => {
        if (e.target === overlayRef.current && !loading) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          aria-label="Đóng"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col items-start gap-4">
          {/* Icon */}
          <div className={cn('flex size-12 items-center justify-center rounded-full', config.iconBg)}>
            <Icon className={cn('size-6', config.iconClass)} />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <h2
              id="confirm-dialog-title"
              className="text-lg font-semibold text-foreground"
            >
              {title}
            </h2>
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            )}
          </div>

          {/* Extra content */}
          {children && (
            <div className="w-full">{children}</div>
          )}

          {/* Actions */}
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                'w-full sm:w-auto',
                tone !== 'info' && config.confirmClass,
              )}
              variant={tone === 'info' ? 'default' : undefined}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
