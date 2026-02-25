import { type TopScoreFrame, formatTimestamp } from "@/lib/deepfake-report-types"

interface FrameByFrameAnalysisProps {
  frames: TopScoreFrame[]
}

function FramePlaceholder({ isHighest }: { isHighest: boolean }) {
  return (
    <svg
      width="100%"
      height="130"
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="frameBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1f2937" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill="url(#frameBg)" />
      {/* Silhouette */}
      <ellipse cx="100" cy="52" rx="24" ry="28" fill="#4b5563" />
      <ellipse cx="100" cy="120" rx="40" ry="32" fill="#4b5563" />
      {/* Grid lines */}
      <line x1="0" y1="50" x2="200" y2="50" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1="0" y1="100" x2="200" y2="100" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1="67" y1="0" x2="67" y2="150" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1="133" y1="0" x2="133" y2="150" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      {/* Scan effect overlay for highest */}
      {isHighest && (
        <rect width="200" height="150" fill="rgba(220,38,38,0.06)" />
      )}
    </svg>
  )
}

function frameScoreColor(s: number): string {
  if (s >= 0.85) return "#B91C1C"
  if (s >= 0.7) return "#EA580C"
  return "#B45309"
}

export function FrameByFrameAnalysis({ frames }: FrameByFrameAnalysisProps) {
  const maxScore = Math.max(...frames.map((f) => f.score))
  const avgScore = frames.reduce((a, f) => a + f.score, 0) / frames.length
  const highestIndex = frames.findIndex((f) => f.score === maxScore)

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "10px",
      }}
    >
      {/* Section header */}
      <div
        style={{
          padding: "6px 12px",
          background: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#374151",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Frame-by-Frame Analysis
        </span>
        <div style={{ display: "flex", gap: "12px", fontSize: "9px" }}>
          <span style={{ color: "#6b7280" }}>
            Max:{" "}
            <span
              style={{
                color: "#B91C1C",
                fontWeight: 700,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {(maxScore * 100).toFixed(1)}%
            </span>
          </span>
          <span style={{ color: "#6b7280" }}>
            Avg:{" "}
            <span
              style={{
                color: "#EA580C",
                fontWeight: 700,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {(avgScore * 100).toFixed(1)}%
            </span>
          </span>
        </div>
      </div>

      {/* Frame thumbnails */}
      <div style={{ background: "#f9fafb", padding: "10px 14px" }}>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {frames.map((frame, i) => {
            const isHighest = i === highestIndex
            return (
              <div key={i} style={{ flex: 1, maxWidth: "220px" }}>
                <div
                  style={{
                    position: "relative",
                    borderRadius: "5px",
                    overflow: "hidden",
                    border: `${isHighest ? "2px" : "1px"} solid ${isHighest ? "#DC2626" : "#d1d5db"}`,
                    boxShadow: isHighest ? "0 0 8px rgba(220,38,38,0.2)" : "none",
                  }}
                >
                  {frame.s3_url ? (
                    <img
                      src={frame.s3_url}
                      alt={`Frame ${frame.frame_index}`}
                      style={{ width: "100%", height: "130px", objectFit: "cover", display: "block" }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <FramePlaceholder isHighest={isHighest} />
                  )}
                  {/* Score badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: frameScoreColor(frame.score),
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "3px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {(frame.score * 100).toFixed(1)}%
                  </div>
                  {/* HIGHEST label */}
                  {isHighest && (
                    <div
                      style={{
                        position: "absolute",
                        top: "5px",
                        left: "5px",
                        background: "#DC2626",
                        color: "#fff",
                        fontSize: "7px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "3px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Highest
                    </div>
                  )}
                </div>
                {/* Caption */}
                <div style={{ textAlign: "center", marginTop: "4px" }}>
                  <div
                    style={{
                      fontSize: "9px",
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {"Frame "}
                    {frame.frame_index}
                    {" \u2014 "}
                    {formatTimestamp(frame.timestamp_seconds)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
