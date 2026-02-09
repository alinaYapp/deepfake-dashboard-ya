import { Badge } from "@/components/ui/badge"

interface ReportHeaderProps {
  reportId: string
  date: string
  score: number
}

function getVerdict(score: number) {
  if (score >= 70) return { label: "SUSPICIOUS", color: "bg-red-600 text-white" }
  if (score >= 40) return { label: "UNCERTAIN", color: "bg-amber-500 text-white" }
  return { label: "AUTHENTIC", color: "bg-emerald-600 text-white" }
}

function getScoreColor(score: number) {
  if (score >= 70) return "text-red-600"
  if (score >= 40) return "text-amber-500"
  return "text-emerald-600"
}

export function ReportHeader({ reportId, date, score }: ReportHeaderProps) {
  const verdict = getVerdict(score)

  return (
    <header className="flex items-center justify-between border-b-2 border-border pb-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground">
          DS
        </div>
        <span className="text-xl font-semibold tracking-tight text-primary">DataSpike</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-sm font-semibold text-foreground">{reportId}</span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>

        <Badge className={`${verdict.color} rounded-md px-4 py-1.5 text-sm font-semibold tracking-wide`}>
          {verdict.label}
        </Badge>

        <div className="flex flex-col items-center">
          <span className={`text-4xl font-bold tabular-nums ${getScoreColor(score)}`}>
            {score.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">Confidence</span>
        </div>
      </div>
    </header>
  )
}
