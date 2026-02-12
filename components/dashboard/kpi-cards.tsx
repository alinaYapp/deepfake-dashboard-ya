import { Card, CardContent } from "@/components/ui/card"
import type { KPIData } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, Shield, Activity, PenLine } from "lucide-react"

interface KPICardsProps {
  data: KPIData
}

export function KPICards({ data }: KPICardsProps) {
  const cards = [
    {
      label: "Total Checks",
      value: data.totalChecks.toLocaleString(),
      change: "+12.5%",
      trend: "up" as const,
      icon: Activity,
      description: "vs previous period",
    },
    {
      label: "Deepfakes Detected",
      value: data.deepfakeCount.toLocaleString(),
      change: `${data.deepfakeRate}%`,
      trend: "up" as const,
      icon: Shield,
      description: "Detection rate",
    },
    {
      label: "Corrected Verdicts",
      value: data.correctedVerdicts.toLocaleString(),
      change: `${data.correctionRate}%`,
      trend: "neutral" as const,
      icon: PenLine,
      description: "Correction rate",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        const isPositiveTrend = card.trend === "up" && card.label === "Total Checks"

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
                {card.trend === "neutral" ? (
                  <PenLine className="h-4 w-4 text-muted-foreground" />
                ) : isPositiveTrend ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-danger" />
                )}
                <span
                  className={`text-sm font-medium ${
                    card.trend === "neutral"
                      ? "text-muted-foreground"
                      : isPositiveTrend
                        ? "text-success"
                        : "text-danger"
                  }`}
                >
                  {card.change}
                </span>
                <span className="text-sm text-muted-foreground">{card.description}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
