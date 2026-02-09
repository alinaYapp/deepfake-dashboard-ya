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

  // Build key metrics (max 4, non-technical)
  const criticalCount =
    details?.forensic_analysis?.filter((f) => f.severity === "critical").length || 0
  const suspectCount =
    details?.forensic_analysis?.filter((f) => f.severity === "suspect").length || 0
  const totalFlags = criticalCount + suspectCount

  const faceResult = details?.pixel_analysis?.find((p) => p.type === "face_manipulation")
  const voiceResult = details?.voice_analysis?.[0]

  type Metric = { label: string; value: string; status: "alert" | "warn" | "ok" }
  const metrics: Metric[] = []

  if (faceResult) {
    metrics.push({
      label: "Face Analysis",
      value:
        faceResult.result === "suspicious"
          ? `${(faceResult.confidence * 100).toFixed(0)}% suspicious`
          : "No issues found",
      status: faceResult.result === "suspicious" ? "alert" : "ok",
    })
  }

  if (voiceResult) {
    const voiceSuspicious = voiceResult.result?.toLowerCase() === "suspicious"
    metrics.push({
      label: "Voice Analysis",
      value: voiceSuspicious
        ? `${(voiceResult.confidence * 100).toFixed(0)}% suspicious`
        : "No issues found",
      status: voiceSuspicious ? "alert" : "ok",
    })
  }

  if (totalFlags > 0) {
    metrics.push({
      label: "Forensic Flags",
      value: `${totalFlags} signature${totalFlags !== 1 ? "s" : ""} flagged`,
      status: criticalCount > 0 ? "alert" : "warn",
    })
  } else {
    metrics.push({
      label: "Forensic Flags",
      value: "None identified",
      status: "ok",
    })
  }

  metrics.push({
    label: "Processing Pipeline",
    value:
      pipeline.length > 1
        ? `${pipeline.length} stages detected`
        : pipeline.length === 1
          ? `Single source: ${pipeline[0]?.brand}`
          : "Unknown",
    status: pipeline.length > 2 ? "warn" : "ok",
  })

  // Key findings (3-5 bullets, plain language, what not how)
  const keyFindings: string[] = []
  if (isSuspicious) {
    if (faceResult?.result === "suspicious") {
      keyFindings.push(
        "Facial features show signs consistent with synthetic manipulation"
      )
    }
    const eyeResult = details?.pixel_analysis?.find(
      (p) => p.type === "eye_gaze_manipulation"
    )
    if (eyeResult?.result === "suspicious") {
      keyFindings.push("Eye gaze patterns appear inconsistent with natural movement")
    }
    if (voiceResult?.result?.toLowerCase() === "suspicious") {
      keyFindings.push("Audio track contains patterns associated with voice synthesis")
    }
    if (criticalCount > 0) {
      keyFindings.push(
        "File structure matches signatures of known AI generation tools"
      )
    }
    if (pipeline.length > 2) {
      keyFindings.push("Media has passed through multiple processing stages")
    }
  } else {
    keyFindings.push("No indicators of facial manipulation were identified")
    if (voiceResult && voiceResult.result?.toLowerCase() !== "suspicious") {
      keyFindings.push("Voice patterns are consistent with natural speech")
    }
    keyFindings.push("File structure is consistent with authentic capture devices")
    if (pipeline.length <= 1) {
      keyFindings.push("Media appears to originate from a single source")
    }
  }

  // Verdict appearance
  const verdictColor = isSuspicious
    ? "#B91C1C"
    : isUncertain
      ? "#B45309"
      : "#15803D"
  const verdictBg = isSuspicious
    ? "#FEF2F2"
    : isUncertain
      ? "#FFFBEB"
      : "#F0FDF4"
  const verdictBorder = isSuspicious
    ? "#FECACA"
    : isUncertain
      ? "#FDE68A"
      : "#BBF7D0"
  const verdictLabel = isSuspicious
    ? "Suspicious"
    : isUncertain
      ? "Uncertain"
      : "Valid"
  const verdictSubtext = isSuspicious
    ? "Potential Manipulation Detected"
    : isUncertain
      ? "Inconclusive Analysis Results"
      : "No Manipulation Detected"

  const metricStatusColor = (s: "alert" | "warn" | "ok") =>
    s === "alert" ? "#B91C1C" : s === "warn" ? "#B45309" : "#15803D"
  const metricStatusBg = (s: "alert" | "warn" | "ok") =>
    s === "alert" ? "#FEF2F2" : s === "warn" ? "#FFFBEB" : "#F0FDF4"

  return (
    <div
      style={{
        width: "794px",
        height: "1123px",
        padding: "48px 56px 44px",
        position: "relative",
        background: "#ffffff",
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#1a1a1a",
        fontSize: "11px",
        lineHeight: "1.5",
      }}
    >
      {/* ── 1. Report Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "16px",
          borderBottom: "2px solid #e5e7eb",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "#4A7BF7",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "10px",
            }}
          >
            DS
          </div>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#4A7BF7" }}>
            DataSpike
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "monospace",
              fontWeight: 600,
              fontSize: "12px",
              color: "#1a1a1a",
            }}
          >
            #{reportNumber}
          </div>
          <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>
            {reportDate}
          </div>
        </div>
      </div>

      {/* ── 2. Overall Verdict Block (most prominent) ── */}
      <div
        style={{
          background: verdictBg,
          border: `1.5px solid ${verdictBorder}`,
          borderRadius: "10px",
          padding: "24px 28px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 14px",
                borderRadius: "6px",
                background: verdictColor,
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.02em",
              }}
            >
              {verdictLabel.toUpperCase()}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#4b5563",
                marginTop: "10px",
                fontWeight: 500,
              }}
            >
              {verdictSubtext}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "4px" }}>
              Confidence Score
            </div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: 700,
                color: verdictColor,
                lineHeight: 1,
              }}
            >
              {confidencePercent}
              <span style={{ fontSize: "18px", fontWeight: 600 }}>%</span>
            </div>
          </div>
        </div>
        {/* Confidence bar */}
        <div
          style={{
            marginTop: "16px",
            height: "6px",
            background: "rgba(0,0,0,0.06)",
            borderRadius: "3px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${confidencePercent}%`,
              background: verdictColor,
              borderRadius: "3px",
            }}
          />
        </div>
        {/* Inline case reference */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "14px",
            fontSize: "10px",
            color: "#6b7280",
          }}
        >
          <span>
            Case{" "}
            <span style={{ fontFamily: "monospace", color: "#374151" }}>
              {details?.project_info?.case_id
                ? details.project_info.case_id.split("-")[0]
                : caseData.id}
            </span>
          </span>
          <span>
            {caseData.content_type} &middot;{" "}
            {formatBytes(caseData.file_size_bytes)}
          </span>
          <span>Submitted {formatDate(caseData.created_at)}</span>
          <span>
            Engine v{details?.project_info?.verify_version || "2.374"}
          </span>
        </div>
      </div>

      {/* ── 3. Key Metrics Summary ── */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {metrics.slice(0, 4).map((m, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              padding: "14px 16px",
              background: metricStatusBg(m.status),
              border: `1px solid ${
                m.status === "alert"
                  ? "#FECACA"
                  : m.status === "warn"
                    ? "#FDE68A"
                    : "#BBF7D0"
              }`,
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#6b7280",
                fontWeight: 500,
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: metricStatusColor(m.status),
                lineHeight: "1.3",
              }}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── 4. Frame Analysis Heat Map ── */}
      <HeatMapBlock
        isSuspicious={isSuspicious}
        isEnterprise={isEnterprise}
        pixelAnalysis={details?.pixel_analysis}
        confidencePercent={confidencePercent}
      />

      {/* ── 5. Key Findings + 6. Attribution side-by-side ── */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        {/* Key Findings */}
        <div
          style={{
            flex: 3,
            padding: "16px 20px",
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              marginBottom: "10px",
            }}
          >
            Key Findings
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {keyFindings.slice(0, 5).map((f, i) => (
              <li
                key={i}
                style={{
                  fontSize: "11px",
                  color: "#374151",
                  padding: "4px 0",
                  paddingLeft: "16px",
                  position: "relative",
                  lineHeight: "1.6",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "4px",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: isSuspicious ? "#EF4444" : "#22C55E",
                    display: "inline-block",
                    marginTop: "5px",
                  }}
                />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Primary Match / Attribution */}
        <div
          style={{
            flex: 2,
            padding: "16px 20px",
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              marginBottom: "10px",
            }}
          >
            Attribution
          </div>
          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "2px" }}>
              Primary Match
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            >
              {primaryMatch}
            </div>
            <div style={{ fontSize: "10px", color: "#6b7280" }}>{primaryType}</div>
          </div>
          {pipeline.length > 1 && (
            <div style={{ marginTop: "10px" }}>
              <div
                style={{
                  fontSize: "10px",
                  color: "#6b7280",
                  marginBottom: "6px",
                }}
              >
                Media Pipeline
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexWrap: "wrap",
                }}
              >
                {pipeline.map((p, i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 7px",
                        borderRadius: "3px",
                        fontSize: "9px",
                        fontWeight: 600,
                        background:
                          p.camera_type === "AI Generator"
                            ? "#FEE2E2"
                            : p.camera_type === "Encoder"
                              ? "#FEF3C7"
                              : "#DCFCE7",
                        color:
                          p.camera_type === "AI Generator"
                            ? "#B91C1C"
                            : p.camera_type === "Encoder"
                              ? "#B45309"
                              : "#15803D",
                      }}
                    >
                      {p.brand}
                    </span>
                    {i < pipeline.length - 1 && (
                      <span style={{ color: "#9ca3af", fontSize: "10px" }}>
                        {"\u203A"}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div
            style={{
              marginTop: "12px",
              padding: "8px 10px",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              fontSize: "9px",
              color: "#9ca3af",
              lineHeight: "1.5",
              fontStyle: "italic",
            }}
          >
            Attribution is based on structural signature matching and does not
            constitute a definitive identification of origin.
          </div>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div
        style={{
          fontSize: "9px",
          color: "#9ca3af",
          lineHeight: "1.5",
          paddingTop: "10px",
          borderTop: "1px solid #f3f4f6",
        }}
      >
        This report was generated automatically by DataSpike v
        {details?.project_info?.verify_version || "2.374"}. Results should be
        interpreted alongside additional investigative context. This document
        does not constitute legal advice.
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          left: "56px",
          right: "56px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "9px",
          color: "#9ca3af",
          paddingTop: "12px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <span>DataSpike Deepfake Detection Report</span>
        <span style={{ letterSpacing: "1px", fontWeight: 600 }}>
          CONFIDENTIAL
        </span>
        <span>Page 1 of 6</span>
      </div>
    </div>
  )
}
