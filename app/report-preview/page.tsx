"use client"

import { mockCases } from "@/lib/mock-data"
import { ReportPageOne } from "@/components/report/report-page-one"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const casesWithDetails = mockCases.filter((c) => c.details)

export default function ReportPreviewPage() {
  const [caseIndex, setCaseIndex] = useState(0)
  const [isEnterprise, setIsEnterprise] = useState(true)
  const currentCase = casesWithDetails[caseIndex]

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col items-center py-10 gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCaseIndex((prev) => Math.max(0, prev - 1))}
          disabled={caseIndex === 0}
          className="bg-[#ffffff] text-[#1a1a1a] border-[#d1d5db]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-[#374151]">
          Case {caseIndex + 1} of {casesWithDetails.length} &mdash;{" "}
          <code className="font-mono text-xs text-[#6b7280]">{currentCase.id}</code>{" "}
          <span
            className={
              currentCase.verdict === "fake"
                ? "text-[#dc2626]"
                : currentCase.verdict === "real"
                  ? "text-[#16a34a]"
                  : "text-[#d97706]"
            }
          >
            ({currentCase.verdict})
          </span>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCaseIndex((prev) => Math.min(casesWithDetails.length - 1, prev + 1))}
          disabled={caseIndex === casesWithDetails.length - 1}
          className="bg-[#ffffff] text-[#1a1a1a] border-[#d1d5db]"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-[#d1d5db] mx-1" />

        <Button
          variant={isEnterprise ? "default" : "outline"}
          size="sm"
          onClick={() => setIsEnterprise(true)}
          className={isEnterprise ? "bg-[#4A7BF7] text-[#ffffff] hover:bg-[#3b6ae0]" : "bg-[#ffffff] text-[#374151] border-[#d1d5db]"}
        >
          Enterprise
        </Button>
        <Button
          variant={!isEnterprise ? "default" : "outline"}
          size="sm"
          onClick={() => setIsEnterprise(false)}
          className={!isEnterprise ? "bg-[#4A7BF7] text-[#ffffff] hover:bg-[#3b6ae0]" : "bg-[#ffffff] text-[#374151] border-[#d1d5db]"}
        >
          Default
        </Button>
      </div>
      <div
        className="bg-[#ffffff] shadow-lg"
        style={{
          width: "794px",
          minHeight: "1123px",
          position: "relative",
        }}
      >
        <ReportPageOne caseData={currentCase} isEnterprise={isEnterprise} />
      </div>
    </div>
  )
}
