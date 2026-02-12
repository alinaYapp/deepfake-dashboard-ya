"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Zap,
  LayoutDashboard,
  ScanSearch,
  Video,
  FileText,
  AudioLines,
  Radio,
  ChevronRight,
  HelpCircle,
  BookOpen,
  ExternalLink,
} from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const analyzeSubItems = [
  { id: "video", label: "Video", icon: Video },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "audio", label: "Audio", icon: AudioLines },
  { id: "streaming", label: "Streaming", icon: Radio },
]

const ANALYZE_SUB_IDS = analyzeSubItems.map((i) => i.id)

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const isAnalyzeChild = ANALYZE_SUB_IDS.includes(activeTab)
  const [analyzeOpen, setAnalyzeOpen] = useState(isAnalyzeChild)

  const handleAnalyzeClick = () => {
    if (analyzeOpen && isAnalyzeChild) {
      // Already open and on a sub-tab, just collapse
      setAnalyzeOpen(false)
    } else if (analyzeOpen) {
      setAnalyzeOpen(false)
    } else {
      setAnalyzeOpen(true)
      if (!isAnalyzeChild) {
        onTabChange("video")
      }
    }
  }

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sidebar-foreground">Data Spike</span>
          <span className="text-xs text-muted-foreground">Detection Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="mb-2 px-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Deepfake Detection
          </span>
        </div>
        <ul className="space-y-1">
          {/* Overview */}
          <li>
            <button
              onClick={() => onTabChange("overview")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeTab === "overview"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </button>
          </li>

          {/* Analyze (collapsible) */}
          <li>
            <button
              onClick={handleAnalyzeClick}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isAnalyzeChild
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <ScanSearch className="h-4 w-4" />
              <span className="flex-1 text-left">Analyze</span>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  analyzeOpen && "rotate-90",
                )}
              />
            </button>

            {/* Sub-items */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                analyzeOpen ? "mt-1 max-h-60 opacity-100" : "max-h-0 opacity-0",
              )}
            >
              <ul className="ml-4 space-y-0.5 border-l border-sidebar-border pl-3">
                {analyzeSubItems.map((sub) => {
                  const SubIcon = sub.icon
                  const isSubActive = activeTab === sub.id
                  return (
                    <li key={sub.id}>
                      <button
                        onClick={() => {
                          setAnalyzeOpen(true)
                          onTabChange(sub.id)
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                          isSubActive
                            ? "bg-sidebar-accent/70 text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
                        )}
                      >
                        <SubIcon className="h-3.5 w-3.5" />
                        {sub.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </li>
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-3">
        <ul className="space-y-1">
          <li>
            <a
              href="https://docs.dataspike.io/deepfake-detection/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span className="flex-1">Documentation</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-50" />
            </a>
          </li>
          <li>
            <button
              onClick={() => onTabChange("help")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeTab === "help"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </button>
          </li>
        </ul>
      </div>
    </aside>
  )
}
