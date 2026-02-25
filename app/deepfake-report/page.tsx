"use client"

import {
  DeepfakeReport,
  type DeepfakeReportData,
} from "@/components/report/deepfake-report"

const mockData: DeepfakeReportData = {
  report_id: "#8F7A2B4C1D3E",
  user_name: "app_usr_12345",
  submission_date: "2025-02-10T09:32:00Z",
  engine_version: "v2.374",
  errors: ["DeepfakeDetected", "SuspiciousMetadata"],
  overall_score: 0.94,
}

export default function DeepfakeReportPage() {
  return (
    <div className="min-h-screen bg-[#f1f3f5] py-10">
      <DeepfakeReport data={mockData} />
    </div>
  )
}
