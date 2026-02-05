"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TrendDataPoint } from "@/lib/mock-data"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

interface DeepfakeTrendChartProps {
  data: TrendDataPoint[]
}

export function DeepfakeTrendChart({ data }: DeepfakeTrendChartProps) {
  const formattedData = data.map((point) => ({
    ...point,
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    rate: ((point.deepfakes / point.total) * 100).toFixed(2),
  }))

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Deepfake Detection Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorDeepfakes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }}
                axisLine={{ stroke: "oklch(0.28 0.01 260)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }}
                axisLine={{ stroke: "oklch(0.28 0.01 260)" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.01 260)",
                  border: "1px solid oklch(0.28 0.01 260)",
                  borderRadius: "8px",
                  color: "oklch(0.95 0 0)",
                }}
                labelStyle={{ color: "oklch(0.6 0 0)" }}
              />
              <Area
                type="monotone"
                dataKey="deepfakes"
                stroke="oklch(0.65 0.2 250)"
                strokeWidth={2}
                fill="url(#colorDeepfakes)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
