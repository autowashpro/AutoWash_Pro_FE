"use client"

import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface ChartTrendDataItem {
  date: string
  bookings: number
  revenue: number
}

export interface BookingsBarChartProps {
  data: ChartTrendDataItem[]
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
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
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

export function BookingsBarChart({ data = [] }: BookingsBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <h3 className="font-semibold text-foreground mb-4">Số lượng đặt lịch theo thời gian</h3>
        <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-border text-center">
          <p className="text-sm font-medium text-muted-foreground">Chưa có dữ liệu đặt lịch</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h3 className="font-semibold text-foreground mb-4">Số lượng đặt lịch theo thời gian</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="bookings" name="Số lượng đặt" fill="#1470AF" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
