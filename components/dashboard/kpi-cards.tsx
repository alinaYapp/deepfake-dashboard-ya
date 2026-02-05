import { Card, CardContent } from "@/components/ui/card"
import type { KPIData } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, Shield, AlertTriangle, Clock, Activity } from "lucide-react"

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
      description: "Last 30 days",
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
      label: "False Positive Rate",
      value: `${data.falsePositiveRate}%`,
      change: "-0.03%",
      trend: "down" as const,
      icon: AlertTriangle,
      description: "vs last month",
    },
    {
      label: "Avg Response Time",
      value: `${data.avgResponseTime}ms`,
      change: "-18ms",
      trend: "down" as const,
      icon: Clock,
      description: "P95 latency",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isPositiveTrend =
          (card.trend === "up" && card.label !== "False Positive Rate") ||
          (card.trend === "down" && card.label === "False Positive Rate") ||
          (card.trend === "down" && card.label === "Avg Response Time")

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
                {isPositiveTrend ? (
                  <TrendingDown className="h-4 w-4 text-success" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-danger" />
                )}
                <span className={`text-sm font-medium ${isPositiveTrend ? "text-success" : "text-danger"}`}>
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
