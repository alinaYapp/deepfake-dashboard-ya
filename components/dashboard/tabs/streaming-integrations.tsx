"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Radio, ExternalLink, Video, Bot } from "lucide-react"

const integrations = [
  {
    id: "livekit",
    name: "LiveKit Integration",
    icon: Video,
    description:
      "Integrate real-time deepfake detection into your LiveKit video pipelines. Analyze participant streams on the fly with low-latency detection for face swaps, injection attacks, and liveness verification.",
    features: [
      "Real-time WebRTC stream analysis",
      "Participant-level detection events",
      "Automatic session monitoring",
    ],
    href: "https://docs.dataspike.io/deepfake-detection/livekit-integration",
  },
  {
    id: "pipecat",
    name: "Pipecat Integration",
    icon: Bot,
    description:
      "Add deepfake detection as a processing stage in your Pipecat media pipelines. Inspect audio and video frames inline with configurable confidence thresholds and event callbacks.",
    features: [
      "Pipeline-native media inspection",
      "Configurable confidence thresholds",
      "Frame-level detection callbacks",
    ],
    href: "https://docs.dataspike.io/deepfake-detection/pipecat-integration",
  },
]

export function StreamingIntegrations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Radio className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Streaming Detection</h1>
          <p className="text-sm text-muted-foreground">
            Integrate real-time deepfake detection into your video streaming pipelines
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = integration.icon
          return (
            <Card key={integration.id} className="bg-card border-border flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                </div>
                <CardDescription className="pt-2">{integration.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-5">
                <ul className="space-y-2">
                  {integration.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full gap-2">
                  <a href={integration.href} target="_blank" rel="noopener noreferrer">
                    View Documentation
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
