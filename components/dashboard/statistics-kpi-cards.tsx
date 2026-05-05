import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Shield, Activity, BarChart3 } from "lucide-react"
import type { StatisticsResponse } from "@/lib/statistics-types"
import { Skeleton } from "@/components/ui/skeleton"

interface StatisticsKPICardsProps {
  data: StatisticsResponse | null
  isLoading: boolean
}

const TYPE_COLORS = [
  "oklch(0.65 0.2 250)", // primary blue - selfie_liveness
  "oklch(0.65 0.2 145)", // success green - document_id
  "oklch(0.75 0.15 85)", // warning yellow - video
  "oklch(0.6 0.22 25)",  // danger red - audio
]

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
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const typeData = data.detection_by_type
    ? Object.entries(data.detection_by_type).map(([key, value], index) => ({
        key,
        label: TYPE_LABELS[key] || key,
        value,
        color: TYPE_COLORS[index % TYPE_COLORS.length],
      }))
    : []

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Total Checks Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Total Checks</span>
              <span className="text-2xl font-semibold text-foreground">
                {data.total_checks.toLocaleString()}
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Activity className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {data.total_checks_change_pct >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger" />
            )}
            <span
              className={`text-sm font-medium ${
                data.total_checks_change_pct >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {data.total_checks_change_pct >= 0 ? "+" : ""}
              {data.total_checks_change_pct}%
            </span>
            <span className="text-sm text-muted-foreground">vs previous period</span>
          </div>
        </CardContent>
      </Card>

      {/* Deepfakes Detected Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Deepfakes Detected</span>
              <span className="text-2xl font-semibold text-foreground">
                {data.deepfakes_detected.toLocaleString()}
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Shield className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-danger" />
            <span className="text-sm font-medium text-danger">{data.detection_rate_pct}%</span>
            <span className="text-sm text-muted-foreground">Detection rate</span>
          </div>
        </CardContent>
      </Card>

      {/* Detection by Type Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Detection by Type</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {typeData.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-xs text-muted-foreground">{item.label}</span>
                <span className="ml-auto text-xs font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
