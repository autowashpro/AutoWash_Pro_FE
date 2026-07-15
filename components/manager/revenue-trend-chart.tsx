"use client"

import React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatVND } from "@/lib/data"

interface ChartTrendDataItem {
  date: string
  bookings: number
  revenue: number
}

export interface RevenueTrendChartProps {
  data: ChartTrendDataItem[]
}

const RevenueTooltip = ({
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
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: p.color || p.fill || "hsl(var(--success))" }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono font-bold text-foreground">{formatVND(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export function RevenueTrendChart({ data = [] }: RevenueTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-bold text-foreground mb-4">Biểu đồ xu hướng doanh thu</h3>
        <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-border text-center">
          <p className="text-sm font-medium text-muted-foreground">Chưa có dữ liệu doanh thu</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="font-bold text-foreground mb-4">Biểu đồ xu hướng doanh thu</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
          <Tooltip content={<RevenueTooltip />} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            strokeWidth={2}
            name="Doanh thu"
            dot={{ fill: "#10b981", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
