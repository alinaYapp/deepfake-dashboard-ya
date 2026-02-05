"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Video, FileText, Mic, Radio } from "lucide-react"
import { AnalyzeVideoTab } from "./analyze-video-tab"
import { AnalyzeDocumentsTab } from "./analyze-documents-tab"
import { AnalyzeAudioTab } from "./analyze-audio-tab"
import { StreamingTab } from "./streaming-tab"

const analyzeTabs = [
  { id: "video", label: "Video", icon: Video },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "audio", label: "Audio", icon: Mic },
  { id: "streaming", label: "Streaming", icon: Radio },
]

interface AnalyzeTabsProps {
  initialTab?: string
}

export function AnalyzeTabs({ initialTab = "video" }: AnalyzeTabsProps) {
  const [activeSubTab, setActiveSubTab] = useState(initialTab)

  const renderContent = () => {
    switch (activeSubTab) {
      case "video":
        return <AnalyzeVideoTab />
      case "documents":
        return <AnalyzeDocumentsTab />
      case "audio":
        return <AnalyzeAudioTab />
      case "streaming":
        return <StreamingTab />
      default:
        return <AnalyzeVideoTab />
    }
  }

  return (
    <div className="space-y-6">
      {/* Horizontal Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1" aria-label="Analyze tabs">
          {analyzeTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeSubTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{renderContent()}</div>
    </div>
  )
}
