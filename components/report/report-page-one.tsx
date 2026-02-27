import { type Case, formatDate } from "@/lib/mock-data"
import { HeatMapBlock } from "./heat-map-block"

interface ReportPageOneProps { caseData: Case; isEnterprise?: boolean }

export function ReportPageOne({ caseData, isEnterprise = true }: ReportPageOneProps) {
  const reportNumber = caseData.id.replace("chk_", "").toUpperCase().slice(0, 12)
  const details = caseData.details
  const isSuspicious = caseData.verdict === "fake"
  const isUncertain = caseData.verdict === "uncertain"
  const confidencePercent = (caseData.score * 100).toFixed(1)
  const verdictColor = isSuspicious ? "#B91C1C" : isUncertain ? "#B45309" : "#15803D"
  const verdictLabel = isSuspicious ? "Suspicious" : isUncertain ? "Uncertain" : "Authentic"
  const scoreAlert = caseData.score >= 0.7

  // Check metadata suspicion from structural_analysis.signature_category and decoded_metadata encoder
  const sigCategory = details?.structural_analysis?.signature_category
  const hasSuspiciousSignature = sigCategory === "AI Generator" || sigCategory === "Professional Software"
  const encoder = details?.decoded_metadata?.general?.writing_application
  const hasSuspiciousEncoder = !!(encoder && (encoder.toLowerCase().includes("ffmpeg") || encoder.toLowerCase().includes("lavf") || encoder.toLowerCase().includes("converter") || encoder.toLowerCase().includes("after effects") || encoder.toLowerCase().includes("davinci") || encoder.toLowerCase().includes("premiere")))
  const metadataAlert = hasSuspiciousSignature || hasSuspiciousEncoder
  const metadataValue = metadataAlert ? "Suspicious" : "Consistent"

  const cards = [
    { label: "Verdict", value: verdictLabel, alert: scoreAlert, isVerdict: true,
      icon: '<svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L2.5 5.5v7L9 16.5l6.5-4v-7L9 1.5z" stroke="currentColor" stroke-width="1.5"/><path d="M9 9V5.5" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="11.5" r="0.8" fill="currentColor"/></svg>' },
    { label: "File Metadata", value: metadataValue, alert: metadataAlert, isVerdict: false,
      icon: '<svg width="16" height="16" viewBox="0 0 18 18" fill="none"><rect x="3.5" y="1.5" width="11" height="15" rx="1.5" stroke="currentColor" stroke-width="1.5"/><line x1="6" y1="5.5" x2="12" y2="5.5" stroke="currentColor" stroke-width="1"/><line x1="6" y1="8" x2="12" y2="8" stroke="currentColor" stroke-width="1"/><line x1="6" y1="10.5" x2="10" y2="10.5" stroke="currentColor" stroke-width="1"/></svg>' },
  ]

  return (
    <div style={{ width: "794px", minHeight: "1123px", padding: "28px 40px 40px", position: "relative", background: "#ffffff", boxSizing: "border-box", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#1a1a1a", fontSize: "11px", lineHeight: "1.5" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "24px", height: "24px", background: "#4A7BF7", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "9px" }}>DS</div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#4A7BF7" }}>DataSpike</span>
          </div>
          <span style={{ fontSize: "8px", color: "#9ca3af" }}>Deepfake Detection Report</span>
        </div>
        <div style={{ display: "flex", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ flex: 1, padding: "8px 16px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9.5px" }}>
              <tbody>
                {([
                  { label: "Report Status", node: <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "4px", fontWeight: 600, fontSize: "9.5px", background: isSuspicious ? "#FEE2E2" : isUncertain ? "#FEF3C7" : "#DCFCE7", color: verdictColor }}>{isSuspicious && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke={verdictColor} strokeWidth="1.5" /><line x1="4" y1="4" x2="8" y2="8" stroke={verdictColor} strokeWidth="1.5" /><line x1="8" y1="4" x2="4" y2="8" stroke={verdictColor} strokeWidth="1.5" /></svg>}{!isSuspicious && !isUncertain && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke={verdictColor} strokeWidth="1.5" /><path d="M3.5 6L5.5 8L8.5 4" stroke={verdictColor} strokeWidth="1.5" /></svg>}{verdictLabel}</span> },
                  { label: "User Name", node: <span style={{ color: "#374151", fontWeight: 500 }}>{caseData.applicant_id || "alina.yapparova@dataspike.io"}</span> },
                  { label: "Submission Date", node: <span style={{ color: "#374151", fontWeight: 500 }}>{formatDate(caseData.created_at)}</span> },
                  { label: "Report ID", node: <span style={{ color: "#374151", fontWeight: 600, fontFamily: "monospace" }}>#{reportNumber}</span> },
                ] as { label: string; node: React.ReactNode }[]).map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: "5px 8px 5px 0", color: "#6b7280", fontWeight: 500, width: "120px", borderBottom: i < 3 ? "1px solid #f3f4f6" : "none", verticalAlign: "middle" }}>{r.label}</td>
                    <td style={{ padding: "5px 0", borderBottom: i < 3 ? "1px solid #f3f4f6" : "none", verticalAlign: "middle" }}>{r.node}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ flex: "0 0 180px", background: isSuspicious ? "#FEF2F2" : isUncertain ? "#FFFBEB" : "#F0FDF4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 16px", borderLeft: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "8px", color: "#6b7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Overall Score</div>
            <div style={{ fontSize: "38px", fontWeight: 700, color: verdictColor, lineHeight: "1", marginBottom: "8px" }}>{confidencePercent}<span style={{ fontSize: "20px" }}>%</span></div>
            <div style={{ height: "26px", padding: "0 16px", borderRadius: "4px", background: verdictColor, color: "#fff", fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "26px", boxSizing: "border-box" }}>{verdictLabel}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", fontSize: "8px", color: "#9ca3af", padding: "2px 0" }}>
          <div style={{ display: "flex", gap: "14px" }}>
            {[{ l: "0-39% Authentic", c: "#15803D" }, { l: "40-69% Uncertain", c: "#B45309" }, { l: "70-100% Suspicious", c: "#B91C1C" }].map((x) => (
              <span key={x.l} style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: x.c, display: "inline-block", flexShrink: 0 }} />{x.l}</span>
            ))}
          </div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Engine v{details?.project_info?.verify_version || "2.374"}</span>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        {cards.map((c, i) => {
          const clr = c.isVerdict ? verdictColor : (c.alert ? "#B91C1C" : "#15803D")
          const bg = c.isVerdict ? (isSuspicious ? "#FEF2F2" : isUncertain ? "#FFFBEB" : "#F0FDF4") : (c.alert ? "#FEF2F2" : "#F0FDF4")
          const border = c.isVerdict ? (isSuspicious ? "#FECACA" : isUncertain ? "#FDE68A" : "#BBF7D0") : (c.alert ? "#FECACA" : "#BBF7D0")
          return (
            <div key={i} style={{ flex: 1, padding: "7px 10px", background: bg, border: `1px solid ${border}`, borderRadius: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div dangerouslySetInnerHTML={{ __html: c.icon }} style={{ flexShrink: 0, color: clr }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "8px", color: "#6b7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px" }}>{c.label}</div>
                {c.isVerdict ? (
                  <div style={{ display: "inline-block", padding: "2px 10px", borderRadius: "4px", background: verdictColor, color: "#fff", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px", marginTop: "2px" }}>{c.value}</div>
                ) : (
                  <div style={{ fontSize: "13px", fontWeight: 700, color: clr, lineHeight: "1.2" }}>{c.value}</div>
                )}
              </div>
              {!c.isVerdict && (c.alert
                ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" /><line x1="5.5" y1="5.5" x2="10.5" y2="10.5" stroke="#B91C1C" strokeWidth="1.5" /><line x1="10.5" y1="5.5" x2="5.5" y2="10.5" stroke="#B91C1C" strokeWidth="1.5" /></svg>
                : <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1" /><path d="M5 8l2 2 4-4" stroke="#15803D" strokeWidth="1.5" fill="none" /></svg>
              )}
            </div>
          )
        })}
      </div>

      {/* FRAME ANALYSIS + MANIPULATION ZONES + DETAILS */}
      <HeatMapBlock isSuspicious={isSuspicious} isEnterprise={isEnterprise} pixelAnalysis={details?.pixel_analysis} confidencePercent={confidencePercent} jobType={caseData.job_type} contentType={caseData.content_type} details={caseData.details} overallScore={caseData.score} />

      {/* FOOTER DISCLAIMER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "7px", color: "#9ca3af", paddingTop: "4px", borderTop: "1px solid #f3f4f6" }}>
        <span style={{ maxWidth: "60%", lineHeight: "1.3" }}>This assessment is probabilistic and should be interpreted in context. It does not constitute legal advice or a determination of authenticity.</span>
        <span style={{ letterSpacing: "1px", fontWeight: 600, color: "#6b7280" }}>CONFIDENTIAL</span>
      </div>

      {/* ABSOLUTE PAGE FOOTER */}
      <div style={{ position: "absolute", bottom: "20px", left: "40px", right: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "8px", color: "#9ca3af", paddingTop: "6px", borderTop: "1px solid #e5e7eb" }}>
        <span>DataSpike Deepfake Detection Report</span>
        <span>Page 1 of 2</span>
      </div>
    </div>
  )
}
