import { Shield, FileText, X, Check, Minus } from "lucide-react"
import type { DeepfakeReport } from "@/lib/deepfake-report-types"
import { scoreColor, scoreDarkColor } from "@/lib/deepfake-report-types"

interface AnalysisSummaryBarProps {
  overallScore: number
  metadataAlert: boolean
  report: DeepfakeReport
}

function ScoreStatusIcon({ score }: { score: number }) {
  if (score >= 0.7) {
    return (
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "#FEE2E2",
          border: "1px solid #EF4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={11} color="#B91C1C" strokeWidth={2.5} />
      </div>
    )
  }
  if (score >= 0.4) {
    return (
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "#FEF3C7",
          border: "1px solid #F59E0B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Minus size={11} color="#B45309" strokeWidth={2.5} />
      </div>
    )
  }
  return (
    <div
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "#DCFCE7",
        border: "1px solid #22C55E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Check size={11} color="#15803D" strokeWidth={2.5} />
    </div>
  )
}

function MetaStatusIcon({ alert }: { alert: boolean }) {
  if (alert) {
    return (
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "#FEE2E2",
          border: "1px solid #EF4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={11} color="#B91C1C" strokeWidth={2.5} />
      </div>
    )
  }
  return (
    <div
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "#DCFCE7",
        border: "1px solid #22C55E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Check size={11} color="#15803D" strokeWidth={2.5} />
    </div>
  )
}

export function AnalysisSummaryBar({
  overallScore,
  metadataAlert,
  report,
}: AnalysisSummaryBarProps) {
  const sColor = scoreColor(overallScore)
  const sDark = scoreDarkColor(overallScore)
  const scorePercent = `${(overallScore * 100).toFixed(1)}%`

  const metaClr = metadataAlert ? "#B91C1C" : "#15803D"
  const metaValue = metadataAlert ? "Suspicious" : "Consistent"

  const cards = [
    {
      label: "OVERALL SCORE",
      value: scorePercent,
      alert: overallScore >= 0.7,
      uncertain: overallScore >= 0.4 && overallScore < 0.7,
      bg: overallScore >= 0.7 ? "#FEF2F2" : overallScore >= 0.4 ? "#FFFBEB" : "#F0FDF4",
      border: overallScore >= 0.7 ? "#FECACA" : overallScore >= 0.4 ? "#FDE68A" : "#BBF7D0",
      iconColor: sDark,
      valueColor: sDark,
      icon: <Shield size={16} color={sDark} />,
      statusIcon: <ScoreStatusIcon score={overallScore} />,
    },
    {
      label: "FILE METADATA",
      value: metaValue,
      alert: metadataAlert,
      uncertain: false,
      bg: metadataAlert ? "#FEF2F2" : "#F0FDF4",
      border: metadataAlert ? "#FECACA" : "#BBF7D0",
      iconColor: metaClr,
      valueColor: metaClr,
      icon: <FileText size={16} color={metaClr} />,
      statusIcon: <MetaStatusIcon alert={metadataAlert} />,
    },
  ]

  return (
    <div style={{ marginBottom: "10px" }}>
      {/* Cards */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "5px" }}>
        {cards.map((c, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              padding: "8px 12px",
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div style={{ flexShrink: 0 }}>{c.icon}</div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "8px",
                  color: "#6b7280",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                {c.label}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: c.valueColor,
                  lineHeight: "1.2",
                  fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
                }}
              >
                {c.value}
              </div>
            </div>
            {c.statusIcon}
          </div>
        ))}
      </div>

      {/* Legend + engine info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "8px",
          color: "#9ca3af",
          padding: "2px 2px",
        }}
      >
        <div style={{ display: "flex", gap: "14px" }}>
          {[
            { l: "0\u201339% Authentic", c: "#10B981" },
            { l: "40\u201369% Uncertain", c: "#F59E0B" },
            { l: "70\u2013100% Suspicious", c: "#EF4444" },
          ].map((x) => (
            <span key={x.l} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: x.c,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {x.l}
            </span>
          ))}
        </div>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Engine {report.engine_version}
        </span>
      </div>
    </div>
  )
}
