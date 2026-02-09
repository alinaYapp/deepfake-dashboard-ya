import { Card, CardContent } from "@/components/ui/card"
import { Scan, AudioLines, Fingerprint, FileCode } from "lucide-react"

interface SummaryCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sublabel?: string
}

function SummaryCard({ icon, label, value, sublabel }: SummaryCardProps) {
  return (
    <Card className="flex-1 border-border bg-card">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

interface AnalysisSummaryCardsProps {
  faceConfidence: number
  voiceConfidence: number
  forensicFlags: number
  fileStructure: string
}

export function AnalysisSummaryCards({
  faceConfidence,
  voiceConfidence,
  forensicFlags,
  fileStructure,
}: AnalysisSummaryCardsProps) {
  return (
    <div className="flex gap-4">
      <SummaryCard
        icon={<Scan className="h-5 w-5" />}
        label="Face Analysis"
        value={`${(faceConfidence * 100).toFixed(0)}%`}
        sublabel="confidence"
      />
      <SummaryCard
        icon={<AudioLines className="h-5 w-5" />}
        label="Voice Analysis"
        value={`${(voiceConfidence * 100).toFixed(0)}%`}
        sublabel="confidence"
      />
      <SummaryCard
        icon={<Fingerprint className="h-5 w-5" />}
        label="Forensic Flags"
        value={`${forensicFlags}`}
        sublabel="signatures"
      />
      <SummaryCard
        icon={<FileCode className="h-5 w-5" />}
        label="File Metadata"
        value={fileStructure}
        sublabel="structure"
      />
    </div>
  )
}
