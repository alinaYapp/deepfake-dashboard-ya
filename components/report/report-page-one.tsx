import { type Case, formatBytes, formatDate } from "@/lib/mock-data"
import { HeatMapBlock } from "./heat-map-block"

interface ReportPageOneProps {
  caseData: Case
  isEnterprise?: boolean
}

export function ReportPageOne({ caseData, isEnterprise = true }: ReportPageOneProps) {
  const reportNumber = caseData.id.replace("chk_", "").toUpperCase().slice(0, 12)
  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
  const details = caseData.details
  const isSuspicious = caseData.verdict === "fake"
  const isUncertain = caseData.verdict === "uncertain"
  const confidencePercent = (caseData.score * 100).toFixed(1)

  const faceResult = details?.pixel_analysis?.find((p) => p.type === "face_manipulation")
  const voiceResult = details?.voice_analysis?.[0]

  const integrityOk = details?.structural_consistency?.modification_tests === "passed" && details?.structural_consistency?.validation_tests === "passed"
  const hasIntegrityData = !!details?.structural_consistency

  const verdictColor = isSuspicious ? "#B91C1C" : isUncertain ? "#B45309" : "#15803D"
  const verdictLabel = isSuspicious ? "Suspicious" : isUncertain ? "Uncertain" : "Authentic"

  // Summary cards data (3 cards)
  type SummaryCard = { label: string; value: string; status: "alert" | "ok"; iconSvg: string }
  const faceConf = faceResult?.result === "suspicious" ? `${(faceResult.confidence * 100).toFixed(0)}%` : "Clear"
  const voiceSus = voiceResult?.result?.toLowerCase() === "suspicious"
  const voiceConf = voiceSus ? `${((voiceResult?.confidence ?? 0) * 100).toFixed(0)}%` : "Clear"

  const summaryCards: SummaryCard[] = [
    {
      label: "Face Analysis",
      value: faceConf,
      status: faceResult?.result === "suspicious" ? "alert" : "ok",
      iconSvg: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="M2.5 16c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" stroke="currentColor" stroke-width="1.5"/></svg>`,
    },
    {
      label: "Voice Analysis",
      value: voiceConf,
      status: voiceSus ? "alert" : "ok",
      iconSvg: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="7" y="1.5" width="4" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 8c0 3 2.5 5.5 5.5 5.5s5.5-2.5 5.5-5.5" stroke="currentColor" stroke-width="1.5"/><line x1="9" y1="13.5" x2="9" y2="16.5" stroke="currentColor" stroke-width="1.5"/></svg>`,
    },
    {
      label: "File Metadata",
      value: hasIntegrityData ? (integrityOk ? "Consistent" : "Concerns") : "Extracted",
      status: hasIntegrityData ? (integrityOk ? "ok" : "alert") : "ok",
      iconSvg: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3.5" y="1.5" width="11" height="15" rx="1.5" stroke="currentColor" stroke-width="1.5"/><line x1="6" y1="5.5" x2="12" y2="5.5" stroke="currentColor" stroke-width="1"/><line x1="6" y1="8" x2="12" y2="8" stroke="currentColor" stroke-width="1"/><line x1="6" y1="10.5" x2="10" y2="10.5" stroke="currentColor" stroke-width="1"/></svg>`,
    },
  ]

  return (
    <div
      style={{
        width: "794px",
        height: "1123px",
        padding: "32px 44px 32px",
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
      {/* ── HEADER: Logo + Metadata Table + Score ── */}
      <div style={{ marginBottom: "16px" }}>
        {/* Logo row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "30px", height: "30px", background: "#4A7BF7", borderRadius: "6px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#ffffff", fontWeight: 700, fontSize: "11px",
            }}>DS</div>
            <span style={{ fontSize: "17px", fontWeight: 600, color: "#4A7BF7" }}>DataSpike</span>
          </div>
          <div style={{ fontSize: "9px", color: "#9ca3af" }}>Deepfake Detection Report</div>
        </div>

        {/* Main header block: metadata table left, score right */}
        <div style={{
          display: "flex", border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden",
        }}>
          {/* Left: metadata table */}
          <div style={{ flex: 1, padding: "16px 24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
              <tbody>
                {[
                  {
                    label: "Report Status",
                    content: (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "4px 12px", borderRadius: "5px", fontWeight: 600, fontSize: "10px",
                        background: isSuspicious ? "#FEE2E2" : isUncertain ? "#FEF3C7" : "#DCFCE7",
                        color: verdictColor,
                      }}>
                        {isSuspicious && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="5" stroke={verdictColor} strokeWidth="1.5" />
                            <line x1="4" y1="4" x2="8" y2="8" stroke={verdictColor} strokeWidth="1.5" />
                            <line x1="8" y1="4" x2="4" y2="8" stroke={verdictColor} strokeWidth="1.5" />
                          </svg>
                        )}
                        {!isSuspicious && !isUncertain && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="5" stroke={verdictColor} strokeWidth="1.5" />
                            <path d="M3.5 6L5.5 8L8.5 4" stroke={verdictColor} strokeWidth="1.5" />
                          </svg>
                        )}
                        {verdictLabel}
                      </span>
                    ),
                  },
                  { label: "User Name", content: <span style={{ color: "#374151", fontWeight: 500 }}>{caseData.applicant_id || "alina.yapparova@dataspike.io"}</span> },
                  { label: "Submission Date", content: <span style={{ color: "#374151", fontWeight: 500 }}>{formatDate(caseData.created_at)}</span> },
                  { label: "Report ID", content: <span style={{ color: "#374151", fontWeight: 600, fontFamily: "monospace", fontSize: "10px" }}>#{reportNumber}</span> },
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{
                      padding: "9px 12px 9px 0", color: "#6b7280", fontWeight: 500,
                      width: "140px", borderBottom: i < 3 ? "1px solid #f3f4f6" : "none",
                      verticalAlign: "middle",
                    }}>
                      {row.label}
                    </td>
                    <td style={{
                      padding: "9px 0", borderBottom: i < 3 ? "1px solid #f3f4f6" : "none",
                      verticalAlign: "middle",
                    }}>
                      {row.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: large score */}
          <div style={{
            flex: "0 0 210px",
            background: isSuspicious ? "#FEF2F2" : isUncertain ? "#FFFBEB" : "#F0FDF4",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "28px 24px", borderLeft: "1px solid #e5e7eb",
            gap: "0px",
          }}>
            <div style={{ fontSize: "9px", color: "#6b7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", marginBottom: "12px" }}>
              Overall Confidence
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", marginBottom: "14px" }}>
              <span style={{ fontSize: "52px", fontWeight: 700, color: verdictColor, lineHeight: "1" }}>{confidencePercent}</span>
              <span style={{ fontSize: "24px", fontWeight: 600, color: verdictColor, lineHeight: "1", marginLeft: "2px" }}>%</span>
            </div>
            <div style={{
              padding: "7px 24px", borderRadius: "5px",
              background: verdictColor, color: "#ffffff",
              fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", textAlign: "center",
              lineHeight: "1",
            }}>
              {verdictLabel}
            </div>
          </div>
        </div>

        {/* Risk level legend */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "32px",
          marginTop: "10px", fontSize: "9px", color: "#6b7280",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#15803D", display: "inline-block", flexShrink: 0 }} />
            <span>0-39% Authentic</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#B45309", display: "inline-block", flexShrink: 0 }} />
            <span>40-69% Uncertain</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#B91C1C", display: "inline-block", flexShrink: 0 }} />
            <span>70-100% Suspicious</span>
          </span>
        </div>

        {/* File info bar */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "20px",
          marginTop: "10px", fontSize: "9px", color: "#6b7280",
          padding: "7px 0", borderTop: "1px solid #f3f4f6",
        }}>
          <span>Case: <span style={{ fontFamily: "monospace", color: "#374151" }}>{details?.project_info?.case_id ? details.project_info.case_id.split("-")[0] : caseData.id}</span></span>
          <span style={{ color: "#d1d5db" }}>|</span>
          <span>{caseData.content_type} - {formatBytes(caseData.file_size_bytes)}</span>
          <span style={{ color: "#d1d5db" }}>|</span>
          <span>Engine: v{details?.project_info?.verify_version || "2.374"}</span>
        </div>
      </div>

      {/* ── ANALYSIS SUMMARY (3 cards) ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
        {summaryCards.map((card, i) => {
          const cardColor = card.status === "alert" ? "#B91C1C" : "#15803D"
          const cardBg = card.status === "alert" ? "#FEF2F2" : "#F0FDF4"
          const cardBorder = card.status === "alert" ? "#FECACA" : "#BBF7D0"
          return (
            <div key={i} style={{
              flex: 1, padding: "12px 14px",
              background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "8px",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <div
                dangerouslySetInnerHTML={{ __html: card.iconSvg }}
                style={{ flexShrink: 0, color: cardColor }}
              />
              <div>
                <div style={{ fontSize: "9px", color: "#6b7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                  {card.label}
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: cardColor, lineHeight: "1.2" }}>
                  {card.value}
                </div>
              </div>
              {/* Checkmark / X indicator */}
              <div style={{ marginLeft: "auto" }}>
                {card.status === "ok" ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1" />
                    <path d="M5 8l2 2 4-4" stroke="#15803D" strokeWidth="1.5" fill="none" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
                    <line x1="5.5" y1="5.5" x2="10.5" y2="10.5" stroke="#B91C1C" strokeWidth="1.5" />
                    <line x1="10.5" y1="5.5" x2="5.5" y2="10.5" stroke="#B91C1C" strokeWidth="1.5" />
                  </svg>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── HERO: Frame-by-Frame Analysis + Manipulation Zones + Details ── */}
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

      {/* ── Footer disclaimer ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: "8px", color: "#9ca3af",
        paddingTop: "6px", borderTop: "1px solid #f3f4f6",
      }}>
        <span style={{ maxWidth: "60%", lineHeight: "1.4" }}>
          This assessment is probabilistic and should be interpreted in context. It does not constitute legal advice or a determination of authenticity.
        </span>
        <span style={{ letterSpacing: "1px", fontWeight: 600, color: "#6b7280" }}>CONFIDENTIAL</span>
      </div>

      {/* ── Absolute footer ── */}
      <div style={{
        position: "absolute", bottom: "24px", left: "44px", right: "44px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: "9px", color: "#9ca3af",
        paddingTop: "8px", borderTop: "1px solid #e5e7eb",
      }}>
        <span>DataSpike Deepfake Detection Report</span>
        <span>Page 1 of 3</span>
      </div>
    </div>
  )
}
