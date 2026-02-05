"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockStreamingEvents, mockCases, type StreamingEvent, type Case } from "@/lib/mock-data"
import { Radio, AlertTriangle, CheckCircle, XCircle, Play, Pause } from "lucide-react"
import { CasesTable } from "@/components/dashboard/cases-table"
import { CaseDrawer } from "@/components/dashboard/case-drawer"

export function StreamingTab() {
  const [isLive, setIsLive] = useState(false)
  const [events, setEvents] = useState<StreamingEvent[]>(mockStreamingEvents)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const getEventIcon = (event: StreamingEvent) => {
    switch (event.level) {
      case "error":
        return <XCircle className="h-4 w-4 text-danger" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />
      default:
        return <CheckCircle className="h-4 w-4 text-success" />
    }
  }

  const getEventBadge = (event: StreamingEvent) => {
    const variants = {
      deepfake_alert: "bg-danger/10 text-danger border-danger/20",
      injection_detected: "bg-warning/10 text-warning border-warning/20",
      liveness_check: "bg-success/10 text-success border-success/20",
      session_start: "bg-primary/10 text-primary border-primary/20",
      session_end: "bg-muted text-muted-foreground border-muted",
    }
    return variants[event.type] || variants.session_start
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const handleViewCase = (caseData: Case) => {
    setSelectedCase(caseData)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Live Stream Control */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className={`h-5 w-5 ${isLive ? "text-danger animate-pulse" : "text-muted-foreground"}`} />
              Streaming Detection
            </CardTitle>
            <CardDescription>
              Real-time deepfake detection for video streams using LiveKit/Pipecat integration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Stream Status</span>
                <Badge
                  variant="outline"
                  className={
                    isLive ? "border-success bg-success/10 text-success" : "border-muted text-muted-foreground"
                  }
                >
                  {isLive ? "Live" : "Offline"}
                </Badge>
              </div>
            </div>

            <Button
              className="w-full gap-2"
              variant={isLive ? "destructive" : "default"}
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? (
                <>
                  <Pause className="h-4 w-4" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Monitoring
                </>
              )}
            </Button>

            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="text-sm font-medium mb-2">Capabilities</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Real-time face swap detection</li>
                <li>• Live injection attack blocking</li>
                <li>• Continuous liveness verification</li>
                <li>• WebRTC stream analysis</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Event Log */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
            <CardDescription>Real-time detection events from active streams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary/70"
                >
                  <div className="mt-0.5">{getEventIcon(event)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={getEventBadge(event)}>
                        {event.type.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">{event.participant_id}</span>
                    </div>
                    <p className="mt-1 text-sm">{event.message}</p>
                    {event.details && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Confidence: {((event.details.confidence || 0) * 100).toFixed(0)}%
                        {event.details.check_type && ` • ${event.details.check_type}`}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(event.timestamp_ms)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CasesTable cases={mockCases} onViewCase={handleViewCase} filterByType="selfie_liveness" />

      <CaseDrawer caseData={selectedCase} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
