"use client"

import { ReportHeader } from "@/components/report/report-header"
import { AnalysisSummaryCards } from "@/components/report/analysis-summary-cards"
import { FrameAnalysis } from "@/components/report/frame-analysis"
import type { FrameData } from "@/components/report/frame-analysis"
import { TechnicalDetails } from "@/components/report/technical-details"
import { ReportFooter } from "@/components/report/report-footer"

const reportData = {
  reportId: "#RPT-8F7A2B4C",
  date: "May 18, 2025",
  overallScore: 94.0,

  faceConfidence: 0.94,
  voiceConfidence: 0.95,
  forensicFlags: 2,
  fileStructure: "Matched",

  frames: [
    {
      id: 12,
      timestamp: "00:04.2",
      confidence: 89.3,
      imageSrc: "/report-frame-1.jpg",
      isHighest: false,
      hasHeatmap: false,
    },
    {
      id: 42,
      timestamp: "00:15.4",
      confidence: 97.4,
      imageSrc: "/report-frame-3.jpg",
      isHighest: true,
      hasHeatmap: true,
    },
    {
      id: 78,
      timestamp: "00:28.1",
      confidence: 91.8,
      imageSrc: "/report-frame-2.jpg",
      isHighest: false,
      hasHeatmap: false,
    },
  ] as FrameData[],

  anomalies: [
    {
      region: "Facial region",
      description: "Unnatural blending detected at jaw line with inconsistent skin texture transitions",
    },
    {
      region: "Eye gaze trajectory",
      description: "Inconsistent with natural movement patterns; gaze direction diverges from head orientation",
    },
    {
      region: "Audio-visual sync",
      description: "0.3s delay detected between lip movements and corresponding audio signal",
    },
    {
      region: "Lighting inconsistency",
      description: "Shadow direction mismatch between face and background environment lighting sources",
    },
  ],

  fileMetadata: [
    { label: "Duration", value: "45.02s" },
    { label: "Resolution", value: "1920 x 1080" },
    { label: "Codec", value: "H.264" },
    { label: "Frame rate", value: "30 fps" },
  ],

  integrityMarkers: [
    { label: "Creation date", value: "May 18, 09:32 PM" },
    { label: "Last modified", value: "May 18, 11:47 PM", isDiscrepancy: true },
    { label: "File size", value: "23 MB" },
    { label: "EXIF anomalies", value: "GPS data stripped", isDiscrepancy: true },
  ],
}

export function ReportView() {
  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-8">
      <ReportHeader
        reportId={reportData.reportId}
        date={reportData.date}
        score={reportData.overallScore}
      />

      <AnalysisSummaryCards
        faceConfidence={reportData.faceConfidence}
        voiceConfidence={reportData.voiceConfidence}
        forensicFlags={reportData.forensicFlags}
        fileStructure={reportData.fileStructure}
      />

      <FrameAnalysis frames={reportData.frames} />

      <TechnicalDetails
        anomalies={reportData.anomalies}
        fileMetadata={reportData.fileMetadata}
        integrityMarkers={reportData.integrityMarkers}
      />

      <ReportFooter />
    </div>
  )
}
