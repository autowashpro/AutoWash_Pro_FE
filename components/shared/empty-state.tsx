"use client"

import React from "react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon && (
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <div className="text-primary">{icon}</div>
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export function EmptyCard() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-12 text-center">
      <EmptyState title="Không có dữ liệu" description="Hãy thêm dữ liệu đầu tiên" />
    </div>
  )
}
