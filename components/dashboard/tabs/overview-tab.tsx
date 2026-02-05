"use client"

import { useState } from "react"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { DeepfakeTrendChart } from "@/components/dashboard/charts/deepfake-trend-chart"
import { DeepfakeTypeChart } from "@/components/dashboard/charts/deepfake-type-chart"
import { CasesTable } from "@/components/dashboard/cases-table"
import { CaseDrawer } from "@/components/dashboard/case-drawer"
import { mockKPIs, mockTrends, mockDistribution, mockCases, type Case } from "@/lib/mock-data"

export function OverviewTab() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleViewCase = (caseData: Case) => {
    setSelectedCase(caseData)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      <KPICards data={mockKPIs} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DeepfakeTrendChart data={mockTrends} />
        </div>
        <div>
          <DeepfakeTypeChart data={mockDistribution} />
        </div>
      </div>

      <CasesTable cases={mockCases} onViewCase={handleViewCase} />

      <CaseDrawer caseData={selectedCase} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
