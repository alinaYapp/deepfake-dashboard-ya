"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { type Case, formatBytes, formatDate } from "@/lib/mock-data"
import { downloadReport } from "@/lib/pdf-generator"
import { CheckCircle, XCircle, AlertCircle, FileDown } from "lucide-react"

interface CaseDrawerProps {
  caseData: Case | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CaseDrawer({ caseData, open, onOpenChange }: CaseDrawerProps) {
  if (!caseData) return null

  const getVerdictIcon = (verdict: Case["verdict"]) => {
    switch (verdict) {
      case "real":
        return <CheckCircle className="h-5 w-5 text-success" />
      case "fake":
        return <XCircle className="h-5 w-5 text-danger" />
      default:
        return <AlertCircle className="h-5 w-5 text-warning" />
    }
  }

  const getVerdictColor = (verdict: Case["verdict"]) => {
    switch (verdict) {
      case "real":
        return "bg-success/10 text-success border-success/20"
      case "fake":
        return "bg-danger/10 text-danger border-danger/20"
      default:
        return "bg-warning/10 text-warning border-warning/20"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card border-border">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-3">
            {getVerdictIcon(caseData.verdict)}
            <span>Check Details</span>
          </SheetTitle>
          <SheetDescription className="font-mono">{caseData.id}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={() => void downloadReport(caseData)}>
            <FileDown className="h-4 w-4" />
            Download PDF Report
          </Button>

          {/* Overall Verdict */}
          <Card className="bg-secondary/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Verdict</span>
                <Badge variant="outline" className={getVerdictColor(caseData.verdict)}>
                  {caseData.verdict.toUpperCase()}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-4">
                <div>
                  <span className="text-3xl font-bold">{(caseData.score * 100).toFixed(0)}%</span>
                  <span className="ml-1 text-sm text-muted-foreground">confidence</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Basic Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary/50 p-3">
                <span className="text-xs text-muted-foreground">Status</span>
                <p className="mt-1 font-medium capitalize">{caseData.status}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <span className="text-xs text-muted-foreground">Job Type</span>
                <p className="mt-1 font-medium capitalize">{caseData.job_type.replace("_", " ")}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <span className="text-xs text-muted-foreground">Content Type</span>
                <p className="mt-1 font-medium">{caseData.content_type}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <span className="text-xs text-muted-foreground">File Size</span>
                <p className="mt-1 font-medium">{formatBytes(caseData.file_size_bytes)}</p>
              </div>
            </div>
          </div>

          {/* Checks (if details available) */}
          {caseData.details && (
            <>
              <Separator className="bg-border" />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Detection Checks</h4>
                <div className="space-y-2">
                  {Object.entries(caseData.details.checks).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                      <span className="text-sm capitalize">{key.replace("_", " ")}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{(value.confidence * 100).toFixed(0)}%</span>
                        {value.detected ? (
                          <XCircle className="h-4 w-4 text-danger" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-border" />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Metadata</h4>
                <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resolution</span>
                    <span>{caseData.details.metadata.resolution}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{caseData.details.metadata.duration_seconds}s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Codec</span>
                    <span>{caseData.details.metadata.codec}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processing Time</span>
                    <span>{caseData.details.processing_time_ms}ms</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Applicant Info */}
          <Separator className="bg-border" />
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Reference</h4>
            <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Applicant ID</span>
                <code className="font-mono text-xs">{caseData.applicant_id}</code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Environment</span>
                <Badge
                  variant="outline"
                  className={
                    caseData.sandbox
                      ? "border-warning bg-warning/10 text-warning"
                      : "border-success bg-success/10 text-success"
                  }
                >
                  {caseData.sandbox ? "Sandbox" : "Production"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(caseData.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
