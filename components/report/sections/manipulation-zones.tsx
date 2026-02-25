import type { HeatmapFrame } from "@/lib/deepfake-report-types"

interface ManipulationZonesProps {
  heatmapFrame: HeatmapFrame
}

function HeatmapPlaceholderSvg({ width, height }: { width: number; height: number }) {
  const vw = 200
  const vh = 150
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${vw} ${vh}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: "4px", display: "block" }}
    >
      <defs>
        <linearGradient id="hBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1f2937" />
        </linearGradient>
        <radialGradient id="heatOverlay" cx="50%" cy="40%" r="45%">
          <stop offset="0%" stopColor="rgba(220,38,38,0.5)" />
          <stop offset="40%" stopColor="rgba(234,88,12,0.25)" />
          <stop offset="80%" stopColor="rgba(250,204,21,0.08)" />
          <stop offset="100%" stopColor="rgba(250,204,21,0)" />
        </radialGradient>
      </defs>
      <rect width={vw} height={vh} fill="url(#hBg)" />
      <ellipse cx={vw / 2} cy={56} rx="28" ry="32" fill="#4b5563" />
      <ellipse cx={vw / 2} cy={135} rx="48" ry="36" fill="#4b5563" />
      <line x1="0" y1="50" x2={vw} y2="50" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1="0" y1="100" x2={vw} y2="100" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1={vw / 3} y1="0" x2={vw / 3} y2={vh} stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1={(vw * 2) / 3} y1="0" x2={(vw * 2) / 3} y2={vh} stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      {/* Heatmap overlay */}
      <ellipse cx={vw / 2} cy="60" rx="48" ry="52" fill="url(#heatOverlay)" />
    </svg>
  )
}

export function ManipulationZones({ heatmapFrame }: ManipulationZonesProps) {
  const { frame } = heatmapFrame

  return (
    <div
      style={{
        border: "1.5px solid #FECACA",
        borderRadius: "6px",
        overflow: "hidden",
        marginBottom: "10px",
        background: "#FEF2F2",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "4px 12px",
          background: "#FEE2E2",
          borderBottom: "1px solid #FECACA",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "#991B1B",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Manipulation Zones Detected
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          {[
            { label: "High", color: "#DC2626", bg: "rgba(220,38,38,0.2)" },
            { label: "Medium", color: "#EA580C", bg: "rgba(234,88,12,0.15)" },
            { label: "Low", color: "#CA8A04", bg: "rgba(202,138,4,0.15)" },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: l.bg,
                  border: `1.5px solid ${l.color}`,
                }}
              />
              <span style={{ fontSize: "7px", color: l.color, fontWeight: 600 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap image */}
      <div
        style={{
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            borderRadius: "5px",
            overflow: "hidden",
            border: "2px solid #DC2626",
          }}
        >
          {heatmapFrame.heatmap_s3_url ? (
            <img
              src={heatmapFrame.heatmap_s3_url}
              alt={`Heatmap overlay for Frame ${frame.frame_index}`}
              style={{ width: "280px", height: "210px", objectFit: "cover", display: "block" }}
              crossOrigin="anonymous"
            />
          ) : (
            <HeatmapPlaceholderSvg width={280} height={210} />
          )}
          <div
            style={{
              position: "absolute",
              top: "5px",
              left: "5px",
              background: "rgba(220,38,38,0.9)",
              color: "#fff",
              fontSize: "7px",
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: "3px",
              textTransform: "uppercase",
            }}
          >
            Frame {frame.frame_index} - Highest Score
          </div>
        </div>
        <div
          style={{
            fontSize: "8px",
            color: "#7F1D1D",
            marginTop: "6px",
            textAlign: "center",
            lineHeight: "1.4",
            maxWidth: "420px",
          }}
        >
          Analysis detected anomalies in facial regions with varying confidence levels across the
          frame
        </div>
      </div>
    </div>
  )
}
