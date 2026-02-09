"use client"

import Image from "next/image"

interface FrameData {
  id: number
  timestamp: string
  confidence: number
  imageSrc: string
  isHighest: boolean
  hasHeatmap: boolean
}

function getConfidenceColor(score: number) {
  if (score >= 70) return "text-red-600"
  if (score >= 40) return "text-amber-500"
  return "text-emerald-600"
}

function FrameCard({ frame }: { frame: FrameData }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div
        className={`relative w-full overflow-hidden rounded-lg ${
          frame.isHighest ? "ring-[3px] ring-red-500 ring-offset-2 ring-offset-background" : "border border-border"
        }`}
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={frame.imageSrc}
            alt={`Frame ${frame.id} analysis at ${frame.timestamp}`}
            fill
            className="object-cover"
          />
          {frame.hasHeatmap && (
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/30 via-orange-400/20 to-transparent mix-blend-multiply" />
          )}
          {frame.isHighest && (
            <div className="absolute right-2 top-2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Highest
            </div>
          )}
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground">
          Frame {frame.id} &mdash; {frame.timestamp}
        </p>
        <p className={`text-xl font-bold tabular-nums ${getConfidenceColor(frame.confidence)}`}>
          {frame.confidence.toFixed(1)}%
        </p>
      </div>
    </div>
  )
}

interface FrameAnalysisProps {
  frames: FrameData[]
}

export function FrameAnalysis({ frames }: FrameAnalysisProps) {
  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Frame-by-Frame Analysis
      </h2>
      <div className="flex gap-6">
        {frames.map((frame) => (
          <FrameCard key={frame.id} frame={frame} />
        ))}
      </div>
    </section>
  )
}

export type { FrameData }
