"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export interface RevenueChartItem {
  day: string
  revenue: number
}

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)

const formatYAxis = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}Tỷ`
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}Tr`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">{formatVND(payload[0].value)}</p>
    </div>
  )
}

export function RevenueChart({ data: chartData }: { data?: RevenueChartItem[] } = {}) {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex h-[260px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">Chưa có dữ liệu biểu đồ từ máy chủ</p>
        <p className="text-xs text-muted-foreground/80">Biểu đồ doanh thu thực tế sẽ hiển thị sau khi Backend cập nhật API Analytics.</p>
      </div>
    )
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ left: 4, right: 4, top: 8 }}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="var(--border)"
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            stroke="var(--muted-foreground)"
            fontSize={12}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={65}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            cursor={{ fill: "var(--accent)" }}
            content={<CustomTooltip />}
          />
          <Bar dataKey="revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
