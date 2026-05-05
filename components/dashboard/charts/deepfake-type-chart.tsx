"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DetectionByType } from "@/lib/statistics-types"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface DeepfakeTypeChartProps {
  data: DetectionByType | null
  isLoading?: boolean
}

const COLORS = [
  "oklch(0.65 0.2 250)", // primary blue - selfie_liveness
  "oklch(0.65 0.2 145)", // success green - document_id
  "oklch(0.75 0.15 85)", // warning yellow - video
  "oklch(0.6 0.22 25)",  // danger red - audio
]

const LABELS: Record<keyof DetectionByType, string> = {
  selfie_liveness: "Selfie Liveness",
  document_id: "Document ID",
  video: "Video",
  audio: "Audio",
}

export function DeepfakeTypeChart({ data, isLoading = false }: DeepfakeTypeChartProps) {
  if (isLoading || !data) {
    return (
      <Card className="bg-card border-border h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Detection by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-48 w-48 rounded-full" />
            <div className="w-full space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const total = Object.values(data).reduce((sum, val) => sum + val, 0)
  
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: LABELS[key as keyof DetectionByType],
    key: key as keyof DetectionByType,
    value,
    percentage: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
  }))

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Detection by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
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
                formatter={(value: number, name: string) => [value, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="mt-4 space-y-2">
          {chartData.map((entry, index) => (
            <div key={entry.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-foreground">{entry.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground">{entry.value}</span>
                <span className="text-muted-foreground">({entry.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
