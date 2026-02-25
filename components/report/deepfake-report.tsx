import {
  type DeepfakeReport,
  type TopScoreFrame,
  type ErrorCode,
  deriveVerdict,
  verdictColor,
  verdictDarkColor,
  verdictBg,
  verdictBadgeBg,
  formatTimestamp,
  formatSubmissionDate,
  scoreDarkColor,
} from "@/lib/deepfake-report-types"
import { ReportHeader } from "./sections/report-header"
import { AnalysisSummaryBar } from "./sections/analysis-summary-bar"
import { FrameByFrameAnalysis } from "./sections/frame-by-frame-analysis"
import { ManipulationZones } from "./sections/manipulation-zones"
import { ForensicFlags } from "./sections/forensic-flags"
import { ExtractedMetadata } from "./sections/extracted-metadata"
import { ReportFooter } from "./sections/report-footer"

interface DeepfakeReportPageProps {
  report: DeepfakeReport
}

export function DeepfakeReportPage({ report }: DeepfakeReportPageProps) {
  const verdict = deriveVerdict(report)
  const vColor = verdictColor(verdict)
  const vDarkColor = verdictDarkColor(verdict)
  const vBg = verdictBg(verdict)
  const vBadgeBg = verdictBadgeBg(verdict)
  const confidencePercent = (report.overall_score * 100).toFixed(1)

  const hasDeepfake = report.errors.includes("DeepfakeDetected")
  const hasMetadataErrors = report.errors.some(
    (e) =>
      e === "MetadataProfessionalSoftware" ||
      e === "MetadataAiGeneratorDetected" ||
      e === "SuspiciousMetadata"
  )

  // Face analysis: derive from overall_score for the spec
  const faceAlert = hasDeepfake
  const faceValue = faceAlert ? `${confidencePercent}%` : "N/A"

  // Metadata status
  const metadataAlert = hasMetadataErrors
  const metadataValue = metadataAlert ? "Suspicious" : "Consistent"

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        padding: "28px 40px 40px",
        position: "relative",
        background: "#ffffff",
        boxSizing: "border-box",
        fontFamily: "'IBM Plex Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#1a1a1a",
        fontSize: "11px",
        lineHeight: "1.5",
      }}
    >
      {/* 1. Header */}
      <ReportHeader
        report={report}
        verdict={verdict}
        vColor={vColor}
        vDarkColor={vDarkColor}
        vBg={vBg}
        vBadgeBg={vBadgeBg}
        confidencePercent={confidencePercent}
      />

      {/* 2. Analysis Summary Bar */}
      <AnalysisSummaryBar
        faceAlert={faceAlert}
        faceValue={faceValue}
        metadataAlert={metadataAlert}
        metadataValue={metadataValue}
        report={report}
      />

      {/* 3. Frame-by-Frame Analysis */}
      {report.top_score_frames && report.top_score_frames.length > 0 && (
        <FrameByFrameAnalysis frames={report.top_score_frames} />
      )}

      {/* 4. Manipulation Zones (Heatmap) */}
      {report.heatmap_frame && (
        <ManipulationZones heatmapFrame={report.heatmap_frame} />
      )}

      {/* 5. Forensic Flags */}
      <ForensicFlags
        errors={report.errors}
        provenance={report.video_metadata.provenance}
        container={report.video_metadata.container}
      />

      {/* 6. Extracted Metadata */}
      <ExtractedMetadata videoMetadata={report.video_metadata} />

      {/* 7. Footer */}
      <ReportFooter />
    </div>
  )
}
