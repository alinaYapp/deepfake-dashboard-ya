import { type Case, formatBytes, formatDate } from "@/lib/mock-data"
import { HeatMapBlock } from "./heat-map-block"

interface ReportPageOneProps {
  caseData: Case
  isEnterprise?: boolean
}

export function ReportPageOne({ caseData, isEnterprise = true }: ReportPageOneProps) {
  const reportNumber = caseData.id.replace("chk_", "").toUpperCase()
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const details = caseData.details
  const isSuspicious = caseData.verdict === "fake"
  const isUncertain = caseData.verdict === "uncertain"
  const confidencePercent = (caseData.score * 100).toFixed(1)

  const pipeline = details?.device_generation_history || []
  const lastGen = pipeline[pipeline.length - 1]
  const primaryMatch = lastGen?.brand || "Unknown"
  const primaryType = lastGen?.camera_type || "Unknown"

  const criticalCount = details?.forensic_analysis?.filter((f) => f.severity === "critical").length || 0
  const suspectCount = details?.forensic_analysis?.filter((f) => f.severity === "suspect").length || 0
  const totalFlags = criticalCount + suspectCount
  const faceResult = details?.pixel_analysis?.find((p) => p.type === "face_manipulation")
  const voiceResult = details?.voice_analysis?.[0]

  type Metric = { label: string; value: string; status: "alert" | "warn" | "ok"; icon: string }
  const metrics: Metric[] = []

  if (faceResult) {
    metrics.push({
      label: "Face Analysis",
      value: faceResult.result === "suspicious" ? `${(faceResult.confidence * 100).toFixed(0)}%` : "Clear",
      status: faceResult.result === "suspicious" ? "alert" : "ok",
      icon: "face",
    })
  }
  if (voiceResult) {
    const voiceSuspicious = voiceResult.result?.toLowerCase() === "suspicious"
    metrics.push({
      label: "Voice Analysis",
      value: voiceSuspicious ? `${(voiceResult.confidence * 100).toFixed(0)}%` : "Clear",
      status: voiceSuspicious ? "alert" : "ok",
      icon: "voice",
    })
  }
  metrics.push(totalFlags > 0
    ? { label: "Forensic Flags", value: `${totalFlags} signature${totalFlags !== 1 ? "s" : ""}`, status: criticalCount > 0 ? "alert" as const : "warn" as const, icon: "forensic" }
    : { label: "Forensic Flags", value: "None", status: "ok" as const, icon: "forensic" }
  )

  const integrityOk = details?.structural_consistency?.modification_tests === "passed" && details?.structural_consistency?.validation_tests === "passed"
  const hasIntegrityData = !!details?.structural_consistency
  const hasMetadata = !!details?.decoded_metadata

  metrics.push({
    label: "File Metadata",
    value: hasIntegrityData ? (integrityOk ? "Consistent" : "Concerns") : hasMetadata ? "Extracted" : "Limited",
    status: hasIntegrityData ? (integrityOk ? "ok" : "alert") : "ok",
    icon: "file",
  })

  const verdictColor = isSuspicious ? "#B91C1C" : isUncertain ? "#B45309" : "#15803D"
  const verdictBg = isSuspicious ? "#FEF2F2" : isUncertain ? "#FFFBEB" : "#F0FDF4"
  const verdictBorder = isSuspicious ? "#FECACA" : isUncertain ? "#FDE68A" : "#BBF7D0"
  const verdictLabel = isSuspicious ? "SUSPICIOUS" : isUncertain ? "UNCERTAIN" : "AUTHENTIC"

  const metricStatusColor = (s: "alert" | "warn" | "ok") => s === "alert" ? "#B91C1C" : s === "warn" ? "#B45309" : "#15803D"
  const metricStatusBg = (s: "alert" | "warn" | "ok") => s === "alert" ? "#FEF2F2" : s === "warn" ? "#FFFBEB" : "#F0FDF4"
  const metricBorderColor = (s: "alert" | "warn" | "ok") => s === "alert" ? "#FECACA" : s === "warn" ? "#FDE68A" : "#BBF7D0"

  // Icon SVGs
  const iconSvg = (type: string, color: string) => {
    const svgs: Record<string, string> = {
      face: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="4" stroke="${color}" stroke-width="1.5"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="${color}" stroke-width="1.5"/></svg>`,
      voice: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="6" y="1" width="4" height="8" rx="2" stroke="${color}" stroke-width="1.5"/><path d="M3 7c0 2.8 2.2 5 5 5s5-2.2 5-5" stroke="${color}" stroke-width="1.5"/><line x1="8" y1="12" x2="8" y2="15" stroke="${color}" stroke-width="1.5"/></svg>`,
      forensic: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 5v6l7 4 7-4V5L8 1z" stroke="${color}" stroke-width="1.5"/><path d="M8 8V5" stroke="${color}" stroke-width="1.5"/><circle cx="8" cy="10" r="0.8" fill="${color}"/></svg>`,
      file: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="1" stroke="${color}" stroke-width="1.5"/><line x1="5" y1="5" x2="11" y2="5" stroke="${color}" stroke-width="1"/><line x1="5" y1="7.5" x2="11" y2="7.5" stroke="${color}" stroke-width="1"/><line x1="5" y1="10" x2="9" y2="10" stroke="${color}" stroke-width="1"/></svg>`,
    }
    return svgs[type] || ""
  }

  return (
    <div
      style={{
        width: "794px",
        height: "1123px",
        padding: "36px 48px 36px",
        position: "relative",
        background: "#ffffff",
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#1a1a1a",
        fontSize: "11px",
        lineHeight: "1.5",
      }}
    >
      {/* ── 1. Header Row: logo + verdict + score ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "14px",
        borderBottom: "2px solid #e5e7eb",
        marginBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px", height: "28px", background: "#4A7BF7", borderRadius: "5px",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ffffff", fontWeight: 700, fontSize: "10px",
          }}>DS</div>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#4A7BF7" }}>DataSpike</span>
        </div>

        {/* Center: Verdict badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 14px", borderRadius: "6px",
            background: verdictColor, color: "#ffffff",
            fontWeight: 700, fontSize: "12px", letterSpacing: "0.04em",
          }}>
            {verdictLabel}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: verdictColor, lineHeight: 1 }}>
              {confidencePercent}<span style={{ fontSize: "14px", fontWeight: 600 }}>%</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "11px", color: "#1a1a1a" }}>
            #{reportNumber}
          </div>
          <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "2px" }}>{reportDate}</div>
        </div>
      </div>

      {/* ── 2. Confidence bar + case reference row ── */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{
          height: "5px", background: "rgba(0,0,0,0.05)", borderRadius: "3px", overflow: "hidden", marginBottom: "8px",
        }}>
          <div style={{ height: "100%", width: `${confidencePercent}%`, background: verdictColor, borderRadius: "3px" }} />
        </div>
        <div style={{ display: "flex", gap: "20px", fontSize: "9px", color: "#6b7280" }}>
          <span>Case <span style={{ fontFamily: "monospace", color: "#374151" }}>{details?.project_info?.case_id ? details.project_info.case_id.split("-")[0] : caseData.id}</span></span>
          <span>{caseData.content_type} &middot; {formatBytes(caseData.file_size_bytes)}</span>
          <span>Submitted {formatDate(caseData.created_at)}</span>
          <span>Engine v{details?.project_info?.verify_version || "2.374"}</span>
        </div>
      </div>

      {/* ── 3. Summary Cards (compact) ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        {metrics.slice(0, 4).map((m, i) => (
          <div key={i} style={{
            flex: 1, padding: "10px 12px",
            background: metricStatusBg(m.status),
            border: `1px solid ${metricBorderColor(m.status)}`,
            borderRadius: "8px",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div
              dangerouslySetInnerHTML={{ __html: iconSvg(m.icon, metricStatusColor(m.status)) }}
              style={{ flexShrink: 0 }}
            />
            <div>
              <div style={{ fontSize: "9px", color: "#6b7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                {m.label}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: metricStatusColor(m.status), lineHeight: "1.2" }}>
                {m.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 4. HERO: Frame-by-Frame Analysis (takes most space) ── */}
      <HeatMapBlock
        isSuspicious={isSuspicious}
        isEnterprise={isEnterprise}
        pixelAnalysis={details?.pixel_analysis}
        confidencePercent={confidencePercent}
        jobType={caseData.job_type}
        contentType={caseData.content_type}
        details={caseData.details}
        overallScore={caseData.score}
      />

      {/* ── 5. Attribution (compact single row) ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", background: "#f8fafc",
        border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "9px", color: "#6b7280", fontWeight: 500 }}>Closest Match</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a1a" }}>{primaryMatch}</div>
          </div>
          <div style={{ width: "1px", height: "28px", background: "#e5e7eb" }} />
          <div>
            <div style={{ fontSize: "9px", color: "#6b7280", fontWeight: 500 }}>Type</div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#374151" }}>{primaryType}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "9px" }}>
          <span style={{ color: "#6b7280" }}>Metadata: <span style={{ color: "#374151", fontWeight: 500 }}>{hasMetadata ? "Analyzed" : "Limited"}</span></span>
          <span style={{ color: "#6b7280" }}>Encoding: <span style={{ color: "#374151", fontWeight: 500 }}>{details?.decoded_metadata?.general?.writing_application || "Standard"}</span></span>
          <span style={{ color: "#6b7280" }}>Integrity: <span style={{ color: integrityOk ? "#15803D" : hasIntegrityData ? "#B91C1C" : "#6b7280", fontWeight: 500 }}>{hasIntegrityData ? (integrityOk ? "Passed" : "Concerns") : "N/A"}</span></span>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div style={{
        fontSize: "8.5px", color: "#9ca3af", lineHeight: "1.5",
        paddingTop: "8px", borderTop: "1px solid #f3f4f6",
      }}>
        This report was generated by automated analysis (DataSpike v{details?.project_info?.verify_version || "2.374"}).
        Findings are probabilistic in nature and should be evaluated in conjunction with independent investigative context.
        This document does not constitute legal advice or a conclusive determination of authenticity.
      </div>

      {/* ── Footer ── */}
      <div style={{
        position: "absolute", bottom: "28px", left: "48px", right: "48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: "9px", color: "#9ca3af",
        paddingTop: "10px", borderTop: "1px solid #e5e7eb",
      }}>
        <span>DataSpike Deepfake Detection Report</span>
        <span style={{ letterSpacing: "1px", fontWeight: 600 }}>CONFIDENTIAL</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  )
}
