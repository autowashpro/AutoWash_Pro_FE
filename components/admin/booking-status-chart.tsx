"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { BOOKING_STATUS_CONFIG, BookingStatus } from "@/lib/types"

const COLOR_MAP: Record<string, string> = {
  slate: '#64748b',
  blue: '#3b82f6',
  amber: '#f59e0b',
  emerald: '#10b981',
  red: '#ef4444',
  orange: '#f97316',
}

const STATUS_COLORS: Partial<Record<BookingStatus, string>> = {
  EXPIRED: '#fb923c',               // orange-400
  CANCELLED_BY_CUSTOMER: '#f43f5e', // rose-500
  CANCELLED_BY_MANAGER: '#dc2626',  // red-600
  AUTO_CANCELLED: '#9f1239',        // rose-800
  NO_SHOW: '#450a0a',               // red-950
  CANCELLED: '#7f1d1d',             // red-900
}

export function BookingStatusChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data || {})
    .filter(([key, value]) => value > 0 && key !== 'SLOT_HELD')
    .map(([key, value]) => {
      const config = BOOKING_STATUS_CONFIG[key as BookingStatus]
      return {
        key,
        name: config?.label || key,
        value,
        color: STATUS_COLORS[key as BookingStatus] || COLOR_MAP[config?.color || "slate"] || "#64748b"
      }
    })

  if (chartData.length === 0) {
    return (
      <div className="flex h-[260px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">Chưa có dữ liệu</p>
        <p className="text-xs text-muted-foreground/80">Các đơn đặt lịch sẽ hiển thị tại đây.</p>
      </div>
    )
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => [`${value} đơn`, "Số lượng"]}
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid var(--border)',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              backgroundColor: 'var(--background)'
            }}
            itemStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
