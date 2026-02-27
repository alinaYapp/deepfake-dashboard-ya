"use client"

import { useState } from "react"
import { DeepfakeReportPage } from "@/components/report/deepfake-report"
import { ReportPageTwo } from "@/components/report/report-page-two"
import {
  mockSuspiciousReport,
  mockAuthenticReport,
  mockUncertainReport,
} from "@/lib/deepfake-report-types"

const reports = [
  { label: "Suspicious", data: mockSuspiciousReport },
  { label: "Authentic", data: mockAuthenticReport },
  { label: "Uncertain", data: mockUncertainReport },
]

export default function ReportPreviewPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const currentReport = reports[activeIndex].data

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f3f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 0 60px",
        gap: "24px",
      }}
    >
      {/* Toggle toolbar — hidden when printing */}
      <style>{`@media print { .report-toggle-toolbar { display: none !important; } }`}</style>
      <div
        className="report-toggle-toolbar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "4px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        {reports.map((r, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: activeIndex === i ? 600 : 400,
              fontFamily: "'IBM Plex Sans', sans-serif",
              background: activeIndex === i ? "#4A7BF7" : "transparent",
              color: activeIndex === i ? "#ffffff" : "#6b7280",
              transition: "all 0.15s ease",
            }}
          >
            {r.label}
          </button>
        ))}
        <span
          style={{
            marginLeft: "8px",
            padding: "0 12px",
            fontSize: "12px",
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#9ca3af",
            borderLeft: "1px solid #e5e7eb",
          }}
        >
          {currentReport.report_id}
        </span>
      </div>

      {/* Report Page 1 */}
      <div
        style={{
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          borderRadius: "2px",
        }}
      >
        <DeepfakeReportPage report={currentReport} />
      </div>

      {/* Report Page 2 */}
      <div
        style={{
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          borderRadius: "2px",
        }}
      >
        <ReportPageTwo />
      </div>
    </div>
  )
}
