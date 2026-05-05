"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react"
import type { StatisticsResponse } from "@/lib/statistics-types"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface StatisticsKPICardsProps {
  data: StatisticsResponse | null
  isLoading: boolean
}

const TYPE_COLORS: Record<string, string> = {
  selfie_liveness: "#378ADD",
  document_id: "#1D9E75",
  video: "#7F77DD",
  audio: "#B4B2A9",
}

const TYPE_LABELS: Record<string, string> = {
  selfie_liveness: "Selfie Liveness",
  document_id: "Document ID",
  video: "Video",
  audio: "Audio",
}

export function StatisticsKPICards({ data, isLoading }: StatisticsKPICardsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const typeData = data.detection_by_type
    ? Object.entries(data.detection_by_type).map(([key, value]) => ({
        key,
        name: TYPE_LABELS[key] || key,
        value,
        color: TYPE_COLORS[key] || "#B4B2A9",
      }))
    : []

  const totalByType = typeData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Total Checks Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Checks</span>
              <span className="text-2xl font-semibold text-foreground">
                {data.total_checks.toLocaleString()}
              </span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            {data.total_checks_change_pct >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-success" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-danger" />
            )}
            <span
              className={`text-xs font-medium ${
                data.total_checks_change_pct >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {data.total_checks_change_pct >= 0 ? "+" : ""}
              {data.total_checks_change_pct}%
            </span>
            <span className="text-xs text-muted-foreground">vs previous period</span>
          </div>
        </CardContent>
      </Card>

      {/* Deepfakes Detected Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deepfakes Detected</span>
              <span className="text-2xl font-semibold text-foreground">
                {data.deepfakes_detected.toLocaleString()}
              </span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10">
              <AlertCircle className="h-4 w-4 text-danger" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-danger" />
            <span className="text-xs font-medium text-danger">{data.detection_rate_pct}%</span>
            <span className="text-xs text-muted-foreground">Detection rate</span>
          </div>
        </CardContent>
      </Card>

      {/* Detection by Type Card with Donut Chart */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Detection by Type</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Donut Chart */}
            <div className="relative h-[90px] w-[90px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={42}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {typeData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e0e0de",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} (${totalByType > 0 ? ((value / totalByType) * 100).toFixed(1) : 0}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-semibold text-foreground">{totalByType}</span>
                <span className="text-[10px] text-muted-foreground">total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-1.5 min-w-0">
              {typeData.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-xs text-muted-foreground">{item.name}</span>
                  <span className="ml-auto text-xs font-medium text-foreground">
                    {totalByType > 0 ? ((item.value / totalByType) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
