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
    <div className="mb-8 space-y-6">
      <div className="bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl border border-primary/10 p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
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
