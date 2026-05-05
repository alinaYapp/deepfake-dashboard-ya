import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Shield, Activity, PenLine, CheckCircle } from "lucide-react"
import type { StatisticsResponse } from "@/lib/statistics-types"
import { Skeleton } from "@/components/ui/skeleton"

interface StatisticsKPICardsProps {
  data: StatisticsResponse | null
  isLoading: boolean
}

export function StatisticsKPICards({ data, isLoading }: StatisticsKPICardsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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

  const cleanChecks = data.total_checks - data.deepfakes_detected

  const cards = [
    {
      label: "Total Checks",
      value: data.total_checks.toLocaleString(),
      change: `${data.total_checks_change_pct >= 0 ? "+" : ""}${data.total_checks_change_pct}%`,
      isPositive: data.total_checks_change_pct >= 0,
      icon: Activity,
      description: "vs previous period",
    },
    {
      label: "Deepfakes Detected",
      value: data.deepfakes_detected.toLocaleString(),
      change: `${data.detection_rate_pct}%`,
      isPositive: false,
      icon: Shield,
      description: "Detection rate",
    },
    {
      label: "Corrected Verdicts",
      value: data.corrected_verdicts.toLocaleString(),
      change: `${data.correction_rate_pct}%`,
      isPositive: null,
      icon: PenLine,
      description: "Correction rate",
    },
    {
      label: "Clean Checks",
      value: cleanChecks.toLocaleString(),
      change: null,
      isPositive: true,
      icon: CheckCircle,
      description: "No deepfake detected",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">{card.label}</span>
                  <span className="text-2xl font-semibold text-foreground">{card.value}</span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {card.change !== null && (
                  <>
                    {card.isPositive === null ? (
                      <PenLine className="h-4 w-4 text-muted-foreground" />
                    ) : card.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-danger" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        card.isPositive === null
                          ? "text-muted-foreground"
                          : card.isPositive
                            ? "text-success"
                            : "text-danger"
                      }`}
                    >
                      {card.change}
                    </span>
                  </>
                )}
                {card.change === null && <CheckCircle className="h-4 w-4 text-success" />}
                <span className="text-sm text-muted-foreground">{card.description}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
