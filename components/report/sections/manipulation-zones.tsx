import type { HeatmapFrame } from "@/lib/deepfake-report-types"

interface ManipulationZonesProps {
  heatmapFrame: HeatmapFrame
}

function HeatmapPlaceholder() {
  return (
    <svg
      width="280"
      height="210"
      viewBox="0 0 280 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="hBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1f2937" />
        </linearGradient>
        <radialGradient id="heatHigh" cx="50%" cy="35%" r="30%">
          <stop offset="0%" stopColor="rgba(220,38,38,0.55)" />
          <stop offset="100%" stopColor="rgba(220,38,38,0)" />
        </radialGradient>
        <radialGradient id="heatMed" cx="38%" cy="50%" r="22%">
          <stop offset="0%" stopColor="rgba(234,88,12,0.35)" />
          <stop offset="100%" stopColor="rgba(234,88,12,0)" />
        </radialGradient>
        <radialGradient id="heatLow" cx="62%" cy="55%" r="18%">
          <stop offset="0%" stopColor="rgba(250,204,21,0.2)" />
          <stop offset="100%" stopColor="rgba(250,204,21,0)" />
        </radialGradient>
      </defs>
      <rect width="280" height="210" fill="url(#hBg)" />
      {/* Silhouette */}
      <ellipse cx="140" cy="72" rx="36" ry="42" fill="#4b5563" />
      <ellipse cx="140" cy="175" rx="60" ry="48" fill="#4b5563" />
      {/* Grid */}
      <line x1="0" y1="70" x2="280" y2="70" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1="0" y1="140" x2="280" y2="140" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1="93" y1="0" x2="93" y2="210" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1="187" y1="0" x2="187" y2="210" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      {/* Heatmap overlays */}
      <ellipse cx="140" cy="72" rx="60" ry="56" fill="url(#heatHigh)" />
      <ellipse cx="108" cy="100" rx="40" ry="36" fill="url(#heatMed)" />
      <ellipse cx="172" cy="108" rx="32" ry="28" fill="url(#heatLow)" />
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
          padding: "5px 12px",
          background: "#FEE2E2",
          borderBottom: "1px solid #FECACA",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#991B1B",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Manipulation Zones Detected
        </span>
        <div style={{ display: "flex", gap: "12px" }}>
          {[
            { label: "High", color: "#DC2626", bg: "rgba(220,38,38,0.2)" },
            { label: "Medium", color: "#EA580C", bg: "rgba(234,88,12,0.15)" },
            { label: "Low", color: "#CA8A04", bg: "rgba(202,138,4,0.15)" },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: l.bg,
                  border: `1.5px solid ${l.color}`,
                }}
              />
              <span style={{ fontSize: "8px", color: l.color, fontWeight: 600 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap image */}
      <div
        style={{
          padding: "12px 14px",
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
            <HeatmapPlaceholder />
          )}
          <div
            style={{
              position: "absolute",
              top: "6px",
              left: "6px",
              background: "rgba(220,38,38,0.9)",
              color: "#fff",
              fontSize: "7px",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: "3px",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {"Frame "}
            {frame.frame_index}
            {" - Highest Score"}
          </div>
        </div>
        <div
          style={{
            fontSize: "8.5px",
            color: "#7F1D1D",
            marginTop: "8px",
            textAlign: "center",
            lineHeight: "1.5",
            maxWidth: "440px",
          }}
        >
          Analysis detected anomalies in facial regions with varying confidence levels across the frame
        </div>
      </div>
    </div>
  )
}
