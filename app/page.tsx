"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"
import { OverviewTab } from "@/components/dashboard/tabs/overview-tab"
import { AnalyzeTabs } from "@/components/dashboard/tabs/analyze-tabs"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [environment, setEnvironment] = useState<"production" | "sandbox">("production")

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />
      case "analyze":
      case "video":
      case "documents":
      case "audio":
      case "streaming":
        return <AnalyzeTabs initialTab={activeTab === "analyze" ? "video" : activeTab} />
      default:
        return <OverviewTab />
    }
  }

  const getTabInfo = () => {
    if (activeTab === "overview") {
      return {
        title: "Overview",
        description: "Monitor deepfake detection metrics and recent checks",
      }
    }
    return {
      title: "Analyze Content",
      description: "Upload and analyze content for deepfake detection",
    }
  }

  const { title, description } = getTabInfo()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar environment={environment} onEnvironmentChange={setEnvironment} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {renderTab()}
        </main>
      </div>
    </div>
  )
}
