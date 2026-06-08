"use client"

import React from "react"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  action?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  children,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-8 space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/[0.06] via-sky-50/80 to-transparent p-7">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            {/* Gradient accent bar */}
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-primary to-sky-400 shadow-[var(--shadow-glow)]" />
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                {title}
              </h1>
            </div>
            {description && (
              <p className="mt-1 text-muted-foreground leading-relaxed max-w-2xl pl-3">
                {description}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </div>

      {children && (
        <div className="flex gap-3 flex-wrap px-1">{children}</div>
      )}
    </div>
  )
}

interface PageHeaderTabsProps {
  tabs: Array<{
    label: string
    value: string
    icon?: React.ReactNode
  }>
  value: string
  onChange: (value: string) => void
}

export function PageHeaderTabs({
  tabs,
  value,
  onChange,
}: PageHeaderTabsProps) {
  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`relative px-5 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            value === tab.value
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.icon && <span className="size-4">{tab.icon}</span>}
          {tab.label}
          {value === tab.value && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}
