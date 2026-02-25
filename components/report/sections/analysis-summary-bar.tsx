import type { DeepfakeReport } from "@/lib/deepfake-report-types"

interface AnalysisSummaryBarProps {
  faceAlert: boolean
  faceValue: string
  metadataAlert: boolean
  metadataValue: string
  report: DeepfakeReport
}

function StatusIcon({ alert }: { alert: boolean }) {
  if (alert) {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
        <line x1="5.5" y1="5.5" x2="10.5" y2="10.5" stroke="#B91C1C" strokeWidth="1.5" />
        <line x1="10.5" y1="5.5" x2="5.5" y2="10.5" stroke="#B91C1C" strokeWidth="1.5" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1" />
      <path d="M5 8l2 2 4-4" stroke="#15803D" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function AnalysisSummaryBar({
  faceAlert,
  faceValue,
  metadataAlert,
  metadataValue,
  report,
}: AnalysisSummaryBarProps) {
  const cards = [
    {
      label: "Face Analysis",
      value: faceValue,
      alert: faceAlert,
      icon: (
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2.5 16c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      label: "Voice Analysis",
      value: "N/A",
      alert: false,
      icon: (
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <rect x="7" y="1.5" width="4" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3.5 8c0 3 2.5 5.5 5.5 5.5s5.5-2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="9" y1="13.5" x2="9" y2="16.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      label: "File Metadata",
      value: metadataValue,
      alert: metadataAlert,
      icon: (
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <rect x="3.5" y="1.5" width="11" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="6" y1="5.5" x2="12" y2="5.5" stroke="currentColor" strokeWidth="1" />
          <line x1="6" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1" />
          <line x1="6" y1="10.5" x2="10" y2="10.5" stroke="currentColor" strokeWidth="1" />
        </svg>
      ),
    },
  ]

  return (
    <div style={{ marginBottom: "10px" }}>
      {/* Cards */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
        {cards.map((c, i) => {
          const clr = c.alert ? "#B91C1C" : "#15803D"
          const isNA = c.value === "N/A"
          return (
            <div
              key={i}
              style={{
                flex: 1,
                padding: "7px 10px",
                background: isNA ? "#F8FAFC" : c.alert ? "#FEF2F2" : "#F0FDF4",
                border: `1px solid ${isNA ? "#E5E7EB" : c.alert ? "#FECACA" : "#BBF7D0"}`,
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ flexShrink: 0, color: isNA ? "#9CA3AF" : clr }}>{c.icon}</div>
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
                    fontSize: "13px",
                    fontWeight: 700,
                    color: isNA ? "#9CA3AF" : clr,
                    lineHeight: "1.2",
                    fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
                  }}
                >
                  {c.value}
                </div>
              </div>
              {isNA ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" />
                  <line x1="5" y1="8" x2="11" y2="8" stroke="#9CA3AF" strokeWidth="1.5" />
                </svg>
              ) : (
                <StatusIcon alert={c.alert} />
              )}
            </div>
          )
        })}
      </div>

      {/* Legend + file info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "8px",
          color: "#9ca3af",
          padding: "2px 0",
        }}
      >
        <div style={{ display: "flex", gap: "14px" }}>
          {[
            { l: "0-39% Authentic", c: "#15803D" },
            { l: "40-69% Uncertain", c: "#B45309" },
            { l: "70-100% Suspicious", c: "#B91C1C" },
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
        <div style={{ display: "flex", gap: "10px" }}>
          <span>{"video/mp4"} &middot; Engine {report.engine_version}</span>
        </div>
      </div>
    </div>
  )
}
