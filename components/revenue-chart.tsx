"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const data = [
  { day: "T2", revenue: 4200000 },
  { day: "T3", revenue: 3800000 },
  { day: "T4", revenue: 5100000 },
  { day: "T5", revenue: 4600000 },
  { day: "T6", revenue: 6300000 },
  { day: "T7", revenue: 8900000 },
  { day: "CN", revenue: 7400000 },
]

const config = {
  revenue: { label: "Doanh thu", color: "var(--chart-1)" },
} satisfies ChartConfig

export function RevenueChart() {
  return (
    <ChartContainer config={config} className="h-[260px] w-full">
      <BarChart data={data} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => `${v / 1000000}tr`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) =>
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(value))
              }
            />
          }
        />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
