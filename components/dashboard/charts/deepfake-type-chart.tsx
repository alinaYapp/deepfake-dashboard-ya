"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DistributionData } from "@/lib/mock-data"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface DeepfakeTypeChartProps {
  data: DistributionData
}

const COLORS = [
  "oklch(0.65 0.2 250)", // primary blue
  "oklch(0.65 0.2 145)", // success green
  "oklch(0.75 0.15 85)", // warning yellow
  "oklch(0.6 0.22 25)", // danger red
]

const LABELS: Record<keyof DistributionData, string> = {
  selfie_liveness: "Selfie Liveness",
  document_id: "Document ID",
  video: "Video",
  audio: "Audio",
}

export function DeepfakeTypeChart({ data }: DeepfakeTypeChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: LABELS[key as keyof DistributionData],
    value,
  }))

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Detection by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.01 260)",
                  border: "1px solid oklch(0.28 0.01 260)",
                  borderRadius: "8px",
                  color: "oklch(0.95 0 0)",
                }}
                formatter={(value: number) => [`${value}%`, "Percentage"]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span style={{ color: "oklch(0.9 0 0)" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
