"use client"

import { useState } from "react"
import { DeepfakeReportPage } from "@/components/report/deepfake-report"
import {
  mockSuspiciousReport,
  mockAuthenticReport,
} from "@/lib/deepfake-report-types"
import { Button } from "@/components/ui/button"

const reports = [
  { label: "Suspicious (Deepfake)", data: mockSuspiciousReport },
  { label: "Authentic (Clean)", data: mockAuthenticReport },
]

export default function NewReportPreviewPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const currentReport = reports[activeIndex].data

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col items-center py-10 gap-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {reports.map((r, i) => (
          <Button
            key={i}
            variant={activeIndex === i ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveIndex(i)}
            className={
              activeIndex === i
                ? "bg-[#4A7BF7] text-[#ffffff] hover:bg-[#3b6ae0]"
                : "bg-[#ffffff] text-[#374151] border-[#d1d5db]"
            }
          >
            {r.label}
          </Button>
        ))}
        <span className="text-xs font-mono text-[#6b7280] ml-2">
          {currentReport.report_id}
        </span>
      </div>

      {/* Report document */}
      <div
        className="bg-[#ffffff] shadow-lg"
        style={{ width: "794px", minHeight: "1123px", position: "relative" }}
      >
        <DeepfakeReportPage report={currentReport} />
      </div>
    </div>
  )
}
