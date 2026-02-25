import {
  type DeepfakeReport,
  type Verdict,
  formatSubmissionDate,
} from "@/lib/deepfake-report-types"

interface ReportHeaderProps {
  report: DeepfakeReport
  verdict: Verdict
  vColor: string
  vDarkColor: string
  vBg: string
  vBadgeBg: string
  confidencePercent: string
}

function VerdictIcon({ verdict, color }: { verdict: Verdict; color: string }) {
  if (verdict === "SUSPICIOUS") {
    return (
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke={color} strokeWidth="1.5" />
        <line x1="4" y1="4" x2="8" y2="8" stroke={color} strokeWidth="1.5" />
        <line x1="8" y1="4" x2="4" y2="8" stroke={color} strokeWidth="1.5" />
      </svg>
    )
  }
  if (verdict === "UNCERTAIN") {
    return (
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke={color} strokeWidth="1.5" />
        <line x1="6" y1="3.5" x2="6" y2="6.5" stroke={color} strokeWidth="1.5" />
        <circle cx="6" cy="8.5" r="0.7" fill={color} />
      </svg>
    )
  }
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke={color} strokeWidth="1.5" />
      <path d="M3.5 6L5.5 8L8.5 4" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

export function ReportHeader({
  report,
  verdict,
  vColor,
  vDarkColor,
  vBg,
  vBadgeBg,
  confidencePercent,
}: ReportHeaderProps) {
  return (
    <div style={{ marginBottom: "10px" }}>
      {/* Top bar: logo + label */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              background: "#4A7BF7",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "9px",
            }}
          >
            DS
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#4A7BF7" }}>
            DataSpike
          </span>
        </div>
        <span style={{ fontSize: "8px", color: "#9ca3af", letterSpacing: "0.5px" }}>
          Deepfake Detection Report
        </span>
      </div>

      {/* Main info card */}
      <div
        style={{
          display: "flex",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Left: metadata table */}
        <div style={{ flex: 1, padding: "8px 16px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9.5px" }}>
            <tbody>
              {([
                {
                  label: "Report Status",
                  node: (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: 600,
                        fontSize: "9.5px",
                        background: vBadgeBg,
                        color: vDarkColor,
                      }}
                    >
                      <VerdictIcon verdict={verdict} color={vDarkColor} />
                      {verdict}
                    </span>
                  ),
                },
                {
                  label: "User Name",
                  node: (
                    <span style={{ color: "#374151", fontWeight: 500 }}>
                      {report.user_name}
                    </span>
                  ),
                },
                {
                  label: "Submission Date",
                  node: (
                    <span style={{ color: "#374151", fontWeight: 500 }}>
                      {formatSubmissionDate(report.submission_date)}
                    </span>
                  ),
                },
                {
                  label: "Report ID",
                  node: (
                    <span
                      style={{
                        color: "#374151",
                        fontWeight: 600,
                        fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
                      }}
                    >
                      {report.report_id}
                    </span>
                  ),
                },
              ] as { label: string; node: React.ReactNode }[]).map((r, i) => (
                <tr key={i}>
                  <td
                    style={{
                      padding: "5px 8px 5px 0",
                      color: "#6b7280",
                      fontWeight: 500,
                      width: "120px",
                      borderBottom: i < 3 ? "1px solid #f3f4f6" : "none",
                      verticalAlign: "middle",
                    }}
                  >
                    {r.label}
                  </td>
                  <td
                    style={{
                      padding: "5px 0",
                      borderBottom: i < 3 ? "1px solid #f3f4f6" : "none",
                      verticalAlign: "middle",
                    }}
                  >
                    {r.node}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: score gauge */}
        <div
          style={{
            flex: "0 0 180px",
            background: vBg,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 16px",
            borderLeft: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              fontSize: "8px",
              color: "#6b7280",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: "6px",
            }}
          >
            Overall Confidence
          </div>
          <div
            style={{
              fontSize: "38px",
              fontWeight: 700,
              color: vDarkColor,
              lineHeight: "1",
              marginBottom: "8px",
              fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
            }}
          >
            {confidencePercent}
            <span style={{ fontSize: "20px" }}>%</span>
          </div>
          <div
            style={{
              height: "26px",
              padding: "0 16px",
              borderRadius: "4px",
              background: vDarkColor,
              color: "#fff",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: "26px",
              boxSizing: "border-box",
            }}
          >
            {verdict}
          </div>
        </div>
      </div>
    </div>
  )
}
