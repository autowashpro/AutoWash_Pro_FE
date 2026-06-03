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

const data = [
  { day: "T2", revenue: 4200000 },
  { day: "T3", revenue: 3800000 },
  { day: "T4", revenue: 5100000 },
  { day: "T5", revenue: 4600000 },
  { day: "T6", revenue: 6300000 },
  { day: "T7", revenue: 8900000 },
  { day: "CN", revenue: 7400000 },
]

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)

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

export function RevenueChart() {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
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
            width={44}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickFormatter={(v) => `${v / 1000000}tr`}
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
