"use client"

import React from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface ServiceTypeDataItem {
  name: string
  value: number
  color: string
}

export interface ServicesPieChartProps {
  data: ServiceTypeDataItem[]
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string; fill?: string }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border/60 bg-background/95 p-3 text-sm shadow-lg backdrop-blur-md">
      <p className="mb-1.5 font-semibold text-foreground">{label || payload[0]?.name}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: p.color || p.fill || "hsl(var(--primary))" }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono font-bold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function ServicesPieChart({ data = [] }: ServicesPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold text-foreground mb-4">Cơ cấu loại dịch vụ</h3>
        <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-border text-center">
          <p className="text-sm font-medium text-muted-foreground">Chưa có dữ liệu dịch vụ</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h3 className="font-semibold text-foreground mb-4">Cơ cấu loại dịch vụ</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} ${value}`}
            outerRadius={80}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
