import { type Case, formatBytes, formatDate } from "@/lib/mock-data"

interface ReportPageOneProps {
  caseData: Case
}

export function ReportPageOne({ caseData }: ReportPageOneProps) {
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

  // Analysis results
  const analysisResults = [
    {
      check: "Face Manipulation",
      result:
        details?.pixel_analysis?.find((p) => p.type === "face_manipulation")?.result === "suspicious"
          ? "suspicious"
          : "valid",
      confidence:
        details?.pixel_analysis?.find((p) => p.type === "face_manipulation")?.confidence || 0.0,
    },
    {
      check: "AI-Generated Content",
      result:
        details?.pixel_analysis?.find((p) => p.type === "ai_generated_content")?.result === "suspicious"
          ? "suspicious"
          : "valid",
      confidence:
        details?.pixel_analysis?.find((p) => p.type === "ai_generated_content")?.confidence || 0.0,
    },
    {
      check: "Eye Gaze Analysis",
      result:
        details?.pixel_analysis?.find((p) => p.type === "eye_gaze_manipulation")?.result === "suspicious"
          ? "suspicious"
          : "valid",
      confidence:
        details?.pixel_analysis?.find((p) => p.type === "eye_gaze_manipulation")?.confidence || 0.0,
    },
    {
      check: "Voice Analysis",
      result:
        details?.voice_analysis?.[0]?.result?.toLowerCase() === "suspicious"
          ? "suspicious"
          : "valid",
      confidence: details?.voice_analysis?.[0]?.confidence || 0.0,
    },
    {
      check: "Forensic Signatures",
      result: details?.forensic_analysis?.some((f) => f.severity === "critical")
        ? "critical"
        : "valid",
      confidence: details?.forensic_analysis?.some((f) => f.severity === "critical")
        ? 0.94
        : 0.0,
    },
  ]

  const activeResults = analysisResults.filter(
    (r) => r.confidence > 0
  )

  // Key findings
  const keyFindings: string[] = []
  if (isSuspicious) {
    const faceResult = details?.pixel_analysis?.find((p) => p.type === "face_manipulation")
    if (faceResult?.result === "suspicious") {
      keyFindings.push(
        `Face manipulation detected with ${(faceResult.confidence * 100).toFixed(1)}% confidence`
      )
    }
    const eyeResult = details?.pixel_analysis?.find((p) => p.type === "eye_gaze_manipulation")
    if (eyeResult?.result === "suspicious") {
      keyFindings.push(
        `Eye gaze inconsistencies detected (${(eyeResult.confidence * 100).toFixed(1)}% confidence)`
      )
    }
    if (details?.voice_analysis?.[0]?.result?.toLowerCase() === "suspicious") {
      keyFindings.push("Voice synthesis artifacts detected in audio track")
    }
    if (details?.forensic_analysis?.some((f) => f.severity === "critical")) {
      keyFindings.push("File structure matches known AI generator signatures")
    }
  } else {
    keyFindings.push("No face manipulation detected")
    keyFindings.push("Content appears to be camera-original")
    if (details?.voice_analysis && details.voice_analysis.length > 0) {
      keyFindings.push("Voice patterns consistent with natural speech")
    }
    keyFindings.push("File structure matches authentic capture devices")
  }

  // Forensic severity summary
  const criticalCount = details?.forensic_analysis?.filter((f) => f.severity === "critical").length || 0
  const suspectCount = details?.forensic_analysis?.filter((f) => f.severity === "suspect").length || 0

  // Verdict config
  const verdictConfig = isSuspicious
    ? {
        label: "SUSPICIOUS",
        sublabel: "Potential Manipulation Detected",
        bgColor: "#FEF2F2",
        borderColor: "#FECACA",
        badgeBg: "#DC2626",
        textColor: "#DC2626",
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      }
    : isUncertain
      ? {
          label: "UNCERTAIN",
          sublabel: "Inconclusive Results",
          bgColor: "#FFFBEB",
          borderColor: "#FDE68A",
          badgeBg: "#D97706",
          textColor: "#D97706",
          icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
        }
      : {
          label: "VALID",
          sublabel: "No Manipulation Detected",
          bgColor: "#F0FDF4",
          borderColor: "#BBF7D0",
          badgeBg: "#16A34A",
          textColor: "#16A34A",
          icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        }

  return (
    <div
      style={{
        width: "794px",
        height: "1123px",
        padding: "44px 50px 40px",
        position: "relative",
        background: "white",
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#1a1a1a",
        fontSize: "11px",
        lineHeight: "1.5",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          paddingBottom: "14px",
          borderBottom: "2px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              background: "#4A7BF7",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "11px",
            }}
          >
            DS
          </div>
          <div style={{ fontSize: "17px", fontWeight: 600, color: "#4A7BF7" }}>DataSpike</div>
        </div>
        <div style={{ textAlign: "right", fontSize: "11px", color: "#6b7280" }}>
          <div style={{ fontWeight: 600, color: "#1a1a1a", fontFamily: "monospace", fontSize: "12px" }}>
            #{reportNumber}
          </div>
          <div>{reportDate}</div>
        </div>
      </div>

      {/* Page Title */}
      <div
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "#111827",
          marginBottom: "20px",
          letterSpacing: "-0.01em",
        }}
      >
        Deepfake Detection Report — Executive Summary
      </div>

      {/* Verdict + Case Info row */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "22px" }}>
        {/* Verdict Card */}
        <div
          style={{
            flex: "1",
            padding: "20px",
            borderRadius: "10px",
            background: verdictConfig.bgColor,
            border: `1px solid ${verdictConfig.borderColor}`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "6px",
              background: verdictConfig.badgeBg,
              color: "white",
              fontWeight: 600,
              fontSize: "12px",
              marginBottom: "14px",
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: verdictConfig.icon }} />
            {verdictConfig.label}
          </div>
          <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>
            {verdictConfig.sublabel}
          </div>
          <div style={{ marginTop: "14px" }}>
            <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "6px" }}>
              Confidence Score
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: verdictConfig.textColor,
                lineHeight: 1,
                marginBottom: "10px",
              }}
            >
              {confidencePercent}%
            </div>
            <div
              style={{
                height: "8px",
                background: "#e5e7eb",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${confidencePercent}%`,
                  background: verdictConfig.badgeBg,
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Case Identification */}
        <div
          style={{
            flex: "1",
            padding: "20px",
            borderRadius: "10px",
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "14px",
            }}
          >
            Case Identification
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <CaseInfoRow label="Case ID" value={details?.project_info?.case_id?.split("-")[0] + "..." || caseData.id} mono />
            <CaseInfoRow label="File Type" value={caseData.content_type} />
            <CaseInfoRow
              label="File Size"
              value={formatBytes(caseData.file_size_bytes)}
            />
            <CaseInfoRow label="Submitted" value={formatDate(caseData.created_at)} />
            <CaseInfoRow label="Job Type" value={caseData.job_type.replace("_", " ")} />
            <CaseInfoRow
              label="Engine Version"
              value={`v${details?.project_info?.verify_version || "2.374"}`}
            />
          </div>
        </div>
      </div>

      {/* Analysis Results Table */}
      <div
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#374151",
          marginBottom: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Analysis Results
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                background: "#f8fafc",
                padding: "9px 14px",
                textAlign: "left",
                fontWeight: 600,
                fontSize: "10px",
                color: "#4b5563",
                border: "1px solid #e5e7eb",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              Check
            </th>
            <th
              style={{
                background: "#f8fafc",
                padding: "9px 14px",
                textAlign: "left",
                fontWeight: 600,
                fontSize: "10px",
                color: "#4b5563",
                border: "1px solid #e5e7eb",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
                width: "110px",
              }}
            >
              Result
            </th>
            <th
              style={{
                background: "#f8fafc",
                padding: "9px 14px",
                textAlign: "right",
                fontWeight: 600,
                fontSize: "10px",
                color: "#4b5563",
                border: "1px solid #e5e7eb",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
                width: "100px",
              }}
            >
              Confidence
            </th>
          </tr>
        </thead>
        <tbody>
          {activeResults.map((r, i) => (
            <tr key={i}>
              <td
                style={{
                  padding: "9px 14px",
                  border: "1px solid #e5e7eb",
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                {r.check}
              </td>
              <td style={{ padding: "9px 14px", border: "1px solid #e5e7eb" }}>
                <ResultBadge result={r.result} />
              </td>
              <td
                style={{
                  padding: "9px 14px",
                  border: "1px solid #e5e7eb",
                  fontSize: "11px",
                  textAlign: "right",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color:
                    r.result === "suspicious" || r.result === "critical"
                      ? "#DC2626"
                      : "#16A34A",
                }}
              >
                {(r.confidence * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Two-column bottom section: Key Findings + Source Attribution */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "16px" }}>
        {/* Key Findings */}
        <div
          style={{
            flex: "1",
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px 18px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "10px",
            }}
          >
            Key Findings
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {keyFindings.map((f, i) => (
              <li
                key={i}
                style={{
                  fontSize: "11px",
                  color: "#4b5563",
                  padding: "3px 0",
                  paddingLeft: "14px",
                  position: "relative",
                  lineHeight: "1.5",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    color: isSuspicious ? "#DC2626" : "#16A34A",
                    fontWeight: 700,
                  }}
                >
                  {isSuspicious ? "!" : "-"}
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Source Attribution */}
        <div
          style={{
            flex: "1",
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px 18px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "10px",
            }}
          >
            Source Attribution
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div>
              <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "2px" }}>
                Primary Match
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: isSuspicious ? "#DC2626" : "#16A34A",
                }}
              >
                {primaryMatch}
              </div>
              <div style={{ fontSize: "10px", color: "#6b7280" }}>{primaryType}</div>
            </div>
            {(criticalCount > 0 || suspectCount > 0) && (
              <div
                style={{
                  marginTop: "4px",
                  padding: "8px 10px",
                  background: isSuspicious ? "#FEF2F2" : "#F0FDF4",
                  borderRadius: "4px",
                  border: `1px solid ${isSuspicious ? "#FECACA" : "#BBF7D0"}`,
                }}
              >
                <div style={{ fontSize: "10px", color: "#4b5563" }}>
                  {criticalCount > 0 && (
                    <span>
                      <strong style={{ color: "#DC2626" }}>{criticalCount} critical</strong>
                      {suspectCount > 0 ? ", " : " "}
                    </span>
                  )}
                  {suspectCount > 0 && (
                    <span>
                      <strong style={{ color: "#D97706" }}>{suspectCount} suspect</strong>{" "}
                    </span>
                  )}
                  <span>forensic signature{criticalCount + suspectCount !== 1 ? "s" : ""} identified</span>
                </div>
              </div>
            )}
            {pipeline.length > 1 && (
              <div style={{ marginTop: "2px" }}>
                <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "4px" }}>
                  Processing Pipeline
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  {pipeline.map((p, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          background:
                            p.camera_type === "AI Generator"
                              ? "#FEE2E2"
                              : p.camera_type === "Encoder"
                                ? "#FEF3C7"
                                : "#DCFCE7",
                          color:
                            p.camera_type === "AI Generator"
                              ? "#DC2626"
                              : p.camera_type === "Encoder"
                                ? "#D97706"
                                : "#16A34A",
                          borderRadius: "3px",
                          fontSize: "9px",
                          fontWeight: 600,
                        }}
                      >
                        {p.brand}
                      </span>
                      {i < pipeline.length - 1 && (
                        <span style={{ color: "#9ca3af", fontSize: "10px" }}>{">"}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer line */}
      <div
        style={{
          fontSize: "9px",
          color: "#9ca3af",
          lineHeight: "1.5",
          padding: "10px 0 0",
          borderTop: "1px solid #f3f4f6",
        }}
      >
        This report was generated automatically by DataSpike v{details?.project_info?.verify_version || "2.374"}.
        Results are based on analysis of the submitted media and should be interpreted alongside
        additional context. This document does not constitute legal advice.
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          left: "50px",
          right: "50px",
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
        <span>CONFIDENTIAL</span>
        <span>Page 1 of 6</span>
      </div>
    </div>
  )
}

function CaseInfoRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "10px", color: "#6b7280" }}>{label}</span>
      <span
        style={{
          fontSize: "11px",
          fontWeight: 500,
          color: "#1a1a1a",
          fontFamily: mono ? "monospace" : "inherit",
          textTransform: mono ? "none" : "capitalize",
        }}
      >
        {value}
      </span>
    </div>
  )
}

function ResultBadge({ result }: { result: string }) {
  const config =
    result === "suspicious"
      ? { bg: "#FEE2E2", color: "#DC2626", label: "Suspicious" }
      : result === "critical"
        ? { bg: "#FEE2E2", color: "#DC2626", label: "Critical" }
        : { bg: "#DCFCE7", color: "#16A34A", label: "Valid" }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: 600,
        background: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  )
}
