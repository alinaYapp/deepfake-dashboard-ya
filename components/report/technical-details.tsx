import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Database } from "lucide-react"

interface AnomalyItem {
  region: string
  description: string
}

interface MetadataItem {
  label: string
  value: string
  isDiscrepancy?: boolean
}

interface TechnicalDetailsProps {
  anomalies: AnomalyItem[]
  fileMetadata: MetadataItem[]
  integrityMarkers: MetadataItem[]
}

export function TechnicalDetails({ anomalies, fileMetadata, integrityMarkers }: TechnicalDetailsProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column - Regions of Interest */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Regions of Interest Identified
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {anomalies.map((anomaly, idx) => (
            <div key={idx} className="rounded-md border border-border bg-secondary/30 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground">{anomaly.region}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{anomaly.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Right Column - Extracted Metadata */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Database className="h-4 w-4" />
            Extracted Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              File Specifications
            </p>
            <div className="space-y-1.5">
              {fileMetadata.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-mono font-medium ${item.isDiscrepancy ? "text-red-500" : "text-foreground"}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Integrity Markers
            </p>
            <div className="space-y-1.5">
              {integrityMarkers.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-mono font-medium ${item.isDiscrepancy ? "text-red-500" : "text-foreground"}`}>
                    {item.value}
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
