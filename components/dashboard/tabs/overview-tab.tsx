"use client"

import { useState, useCallback, useEffect } from "react"
import type { DateRange } from "react-day-picker"
import { StatisticsKPICards } from "@/components/dashboard/statistics-kpi-cards"
import { DeepfakeTrendChart } from "@/components/dashboard/charts/deepfake-trend-chart"
import { CasesTable } from "@/components/dashboard/cases-table"
import { CaseDrawer } from "@/components/dashboard/case-drawer"
import { DateRangePicker, type PresetKey } from "@/components/dashboard/date-range-picker"
import { mockCases, type Case } from "@/lib/mock-data"
import type { StatisticsResponse } from "@/lib/statistics-types"

export function OverviewTab() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [activePreset, setActivePreset] = useState<PresetKey>("1y")
  const [cases, setCases] = useState<Case[]>(mockCases)
  
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize date range on client only to avoid hydration mismatch
  useEffect(() => {
    const now = new Date()
    const from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    setDateRange({ from, to: now })
  }, [])

  // Fetch statistics when date range changes
  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return

    const fetchStatistics = async () => {
      setIsLoading(true)
      try {
        const from = dateRange.from!.toISOString().split("T")[0]
        const to = dateRange.to!.toISOString().split("T")[0]
        
        const response = await fetch(`/api/statistics?from=${from}&to=${to}`)
        if (response.ok) {
          const data: StatisticsResponse = await response.json()
          setStatistics(data)
        }
      } catch (error) {
        console.error("Failed to fetch statistics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatistics()
  }, [dateRange])

  const handleViewCase = (caseData: Case) => {
    setSelectedCase(caseData)
    setDrawerOpen(true)
  }

  const handleUpdateCase = useCallback((updatedCase: Case) => {
    setCases((prev) => prev.map((c) => (c.id === updatedCase.id ? updatedCase : c)))
  }, [])

  // Calculate if we're using weekly binning (period > 90 days)
  const isWeeklyBinning = (() => {
    if (!dateRange?.from || !dateRange?.to) return false
    const daysDiff = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysDiff > 90
  })()

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

      <StatisticsKPICards data={statistics} isLoading={isLoading} />

      <DeepfakeTrendChart
        data={statistics?.detection_trend || []}
        isWeeklyBinning={isWeeklyBinning}
        isLoading={isLoading}
      />

      <CasesTable cases={cases} onViewCase={handleViewCase} onUpdateCase={handleUpdateCase} />

      <CaseDrawer caseData={selectedCase} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
