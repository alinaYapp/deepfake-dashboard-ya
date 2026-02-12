"use client"

import { useState, useMemo } from "react"
import type { DateRange } from "react-day-picker"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { DeepfakeTrendChart } from "@/components/dashboard/charts/deepfake-trend-chart"
import { DeepfakeTypeChart } from "@/components/dashboard/charts/deepfake-type-chart"
import { CasesTable } from "@/components/dashboard/cases-table"
import { CaseDrawer } from "@/components/dashboard/case-drawer"
import { DateRangePicker, type PresetKey } from "@/components/dashboard/date-range-picker"
import { mockKPIs, mockTrends, mockDistribution, mockCases, type Case, type KPIData } from "@/lib/mock-data"

function getDefaultRange(): DateRange {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  return { from, to: now }
}

export function OverviewTab() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultRange)
  const [activePreset, setActivePreset] = useState<PresetKey>("30d")

  const handleViewCase = (caseData: Case) => {
    setSelectedCase(caseData)
    setDrawerOpen(true)
  }

  const filteredTrends = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return mockTrends
    return mockTrends.filter((point) => {
      const d = new Date(point.date)
      return d >= dateRange.from! && d <= dateRange.to!
    })
  }, [dateRange])

  const filteredKPIs: KPIData = useMemo(() => {
    if (!filteredTrends.length) return mockKPIs
    const totalChecks = filteredTrends.reduce((sum, p) => sum + p.total, 0)
    const deepfakeCount = filteredTrends.reduce((sum, p) => sum + p.deepfakes, 0)
    const deepfakeRate = totalChecks > 0 ? Number(((deepfakeCount / totalChecks) * 100).toFixed(2)) : 0
    return {
      ...mockKPIs,
      totalChecks,
      deepfakeCount,
      deepfakeRate,
    }
  }, [filteredTrends])

  const filteredDistribution = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return mockDistribution
    const ratio = filteredTrends.length / (mockTrends.length || 1)
    return {
      selfie_liveness: Math.round(mockDistribution.selfie_liveness * ratio),
      document_id: Math.round(mockDistribution.document_id * ratio),
      video: Math.round(mockDistribution.video * ratio),
      audio: Math.round(mockDistribution.audio * ratio),
    }
  }, [dateRange, filteredTrends.length])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground">Key metrics and recent activity for deepfake detection</p>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          activePreset={activePreset}
          onPresetChange={setActivePreset}
        />
      </div>

      <KPICards data={filteredKPIs} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DeepfakeTrendChart data={filteredTrends} />
        </div>
        <div>
          <DeepfakeTypeChart data={filteredDistribution} />
        </div>
      </div>

      <CasesTable cases={mockCases} onViewCase={handleViewCase} />

      <CaseDrawer caseData={selectedCase} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
