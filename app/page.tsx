"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"
import { OverviewTab } from "@/components/dashboard/tabs/overview-tab"
import { AnalyzeVideoTab } from "@/components/dashboard/tabs/analyze-video-tab"
import { AnalyzeDocumentsTab } from "@/components/dashboard/tabs/analyze-documents-tab"
import { AnalyzeAudioTab } from "@/components/dashboard/tabs/analyze-audio-tab"
import { StreamingIntegrations } from "@/components/dashboard/tabs/streaming-integrations"
import { HelpTab } from "@/components/dashboard/tabs/help-tab"

const ANALYZE_TABS = ["video", "documents", "audio"]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [environment, setEnvironment] = useState<"production" | "sandbox">("production")

  const isAnalyzePage = ANALYZE_TABS.includes(activeTab)

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />
      case "video":
        return <AnalyzeVideoTab />
      case "documents":
        return <AnalyzeDocumentsTab />
      case "audio":
        return <AnalyzeAudioTab />
      case "streaming":
        return <StreamingIntegrations />
      case "help":
        return <HelpTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar environment={environment} onEnvironmentChange={setEnvironment} />
        <main className="flex-1 overflow-y-auto p-6">
          {isAnalyzePage && (
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-foreground">Content Analysis</h1>
              <p className="text-sm text-muted-foreground">Upload and analyze content for deepfake detection</p>
            </div>
          )}
          {renderTab()}
        </main>
      </div>
    </div>
  )
}
