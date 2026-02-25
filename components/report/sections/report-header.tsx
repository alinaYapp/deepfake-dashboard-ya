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

function SemiCircularGauge({
  score,
  color,
  darkColor,
}: {
  score: number
  color: string
  darkColor: string
}) {
  const radius = 52
  const strokeWidth = 8
  const cx = 60
  const cy = 60
  // Semi-circle: from 180deg to 0deg (left to right across the top)
  const circumference = Math.PI * radius
  const filled = circumference * score
  const remaining = circumference - filled

  return (
    <svg width="120" height="72" viewBox="0 0 120 72">
      {/* Background arc */}
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Filled arc */}
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 ${score > 0.5 ? 1 : 0} 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${remaining}`}
      />
      {/* Score text */}
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        fill={darkColor}
        fontFamily="'IBM Plex Mono', 'JetBrains Mono', monospace"
        fontWeight="700"
        fontSize="26"
      >
        {(score * 100).toFixed(1)}%
      </text>
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
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "26px",
              height: "26px",
              background: "#4A7BF7",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "10px",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            DS
          </div>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#4A7BF7", letterSpacing: "-0.2px" }}>
            DataSpike
          </span>
        </div>
        <span
          style={{
            fontSize: "9px",
            color: "#9ca3af",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
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
        <div style={{ flex: 1, padding: "10px 18px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <tbody>
              {([
                {
                  label: "Report Status",
                  node: (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "2px 10px",
                        borderRadius: "4px",
                        fontWeight: 600,
                        fontSize: "10px",
                        background: vBadgeBg,
                        color: vDarkColor,
                        letterSpacing: "0.3px",
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
                    <span
                      style={{
                        color: "#374151",
                        fontWeight: 500,
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "10px",
                      }}
                    >
                      {report.user_name}
                    </span>
                  ),
                },
                {
                  label: "Submission Date",
                  node: (
                    <span style={{ color: "#374151", fontWeight: 500, fontSize: "10px" }}>
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
                        fontSize: "10px",
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
                      padding: "6px 10px 6px 0",
                      color: "#6b7280",
                      fontWeight: 500,
                      width: "130px",
                      borderBottom: i < 3 ? "1px solid #f3f4f6" : "none",
                      verticalAlign: "middle",
                      fontSize: "10px",
                    }}
                  >
                    {r.label}
                  </td>
                  <td
                    style={{
                      padding: "6px 0",
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

        {/* Right: semi-circular gauge */}
        <div
          style={{
            flex: "0 0 180px",
            background: vBg,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 16px 8px",
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
              marginBottom: "2px",
            }}
          >
            Overall Confidence
          </div>
          <SemiCircularGauge
            score={report.overall_score}
            color={vColor}
            darkColor={vDarkColor}
          />
          <div
            style={{
              height: "24px",
              padding: "0 18px",
              borderRadius: "4px",
              background: vDarkColor,
              color: "#fff",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "-2px",
            }}
          >
            {verdict}
          </div>
        </div>
      </div>
    </div>
  )
}
