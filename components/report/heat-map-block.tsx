"use client"

import type { PixelAnalysisResult } from "@/lib/mock-data"

interface HeatMapBlockProps {
  isSuspicious: boolean
  isEnterprise?: boolean
  pixelAnalysis?: PixelAnalysisResult[]
  confidencePercent: string
}

/**
 * Manipulation zone definitions.
 * Each zone represents a facial region where anomalies may be detected.
 * Positions are expressed as percentages of the frame dimensions.
 */
interface ManipulationZone {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  intensity: "high" | "medium" | "low"
}

function getManipulationZones(
  pixelAnalysis?: PixelAnalysisResult[]
): ManipulationZone[] {
  const faceResult = pixelAnalysis?.find((p) => p.type === "face_manipulation")
  const eyeResult = pixelAnalysis?.find(
    (p) => p.type === "eye_gaze_manipulation"
  )

  const zones: ManipulationZone[] = []

  if (faceResult?.result === "suspicious") {
    // Facial boundary zone (jawline / lower face)
    zones.push({
      id: "face-boundary",
      label: "Facial boundary",
      x: 25,
      y: 28,
      width: 50,
      height: 52,
      intensity:
        faceResult.confidence > 0.8
          ? "high"
          : faceResult.confidence > 0.5
            ? "medium"
            : "low",
    })
  }

  if (eyeResult?.result === "suspicious") {
    // Left eye region
    zones.push({
      id: "eye-left",
      label: "Left eye region",
      x: 30,
      y: 32,
      width: 16,
      height: 10,
      intensity:
        eyeResult.confidence > 0.7
          ? "high"
          : eyeResult.confidence > 0.4
            ? "medium"
            : "low",
    })
    // Right eye region
    zones.push({
      id: "eye-right",
      label: "Right eye region",
      x: 54,
      y: 32,
      width: 16,
      height: 10,
      intensity:
        eyeResult.confidence > 0.7
          ? "high"
          : eyeResult.confidence > 0.4
            ? "medium"
            : "low",
    })
  }

  return zones
}

function intensityColor(intensity: "high" | "medium" | "low") {
  switch (intensity) {
    case "high":
      return { fill: "rgba(220, 38, 38, 0.35)", stroke: "rgba(220, 38, 38, 0.6)" }
    case "medium":
      return { fill: "rgba(234, 88, 12, 0.25)", stroke: "rgba(234, 88, 12, 0.5)" }
    case "low":
      return { fill: "rgba(250, 204, 21, 0.2)", stroke: "rgba(250, 204, 21, 0.45)" }
  }
}

export function HeatMapBlock({
  isSuspicious,
  isEnterprise = true,
  pixelAnalysis,
  confidencePercent,
}: HeatMapBlockProps) {
  const zones = getManipulationZones(pixelAnalysis)
  const showFullHeatMap = isEnterprise && isSuspicious && zones.length > 0
  const showAbstracted = !isEnterprise && isSuspicious && zones.length > 0

  return (
    <div
      style={{
        marginBottom: "24px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <div
        style={{
          padding: "8px 16px",
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
            fontWeight: 600,
            color: "#374151",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}
        >
          Frame Analysis
        </span>
        {isSuspicious && (
          <span
            style={{
              fontSize: "9px",
              fontWeight: 500,
              color: "#B91C1C",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              padding: "2px 8px",
              borderRadius: "3px",
            }}
          >
            {zones.length} region{zones.length !== 1 ? "s" : ""} of interest
          </span>
        )}
        {!isSuspicious && (
          <span
            style={{
              fontSize: "9px",
              fontWeight: 500,
              color: "#15803D",
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              padding: "2px 8px",
              borderRadius: "3px",
            }}
          >
            No regions of concern
          </span>
        )}
      </div>

      {/* Visualization body */}
      <div
        style={{
          display: "flex",
          gap: "0",
          background: "#f9fafb",
        }}
      >
        {/* Original frame */}
        <div
          style={{
            flex: "1",
            borderRight: "1px solid #e5e7eb",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "160px",
              height: "120px",
              background: "#1a1a1a",
              borderRadius: "4px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Simulated frame content -- silhouette placeholder */}
            <svg
              width="160"
              height="120"
              viewBox="0 0 160 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background gradient */}
              <defs>
                <linearGradient id="frameBg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#374151" />
                  <stop offset="100%" stopColor="#1f2937" />
                </linearGradient>
              </defs>
              <rect width="160" height="120" fill="url(#frameBg)" />
              {/* Head/shoulders silhouette */}
              <ellipse cx="80" cy="46" rx="22" ry="26" fill="#4b5563" />
              <ellipse cx="80" cy="110" rx="40" ry="30" fill="#4b5563" />
              {/* Subtle grid overlay for "video frame" feel */}
              <line x1="0" y1="40" x2="160" y2="40" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
              <line x1="0" y1="80" x2="160" y2="80" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
              <line x1="53" y1="0" x2="53" y2="120" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
              <line x1="107" y1="0" x2="107" y2="120" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
            </svg>
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "#6b7280",
              marginTop: "8px",
              fontWeight: 500,
            }}
          >
            Source Frame
          </div>
        </div>

        {/* Heat map overlay frame */}
        <div
          style={{
            flex: "1",
            borderRight: "1px solid #e5e7eb",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "160px",
              height: "120px",
              background: "#1a1a1a",
              borderRadius: "4px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <svg
              width="160"
              height="120"
              viewBox="0 0 160 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="heatBg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#374151" />
                  <stop offset="100%" stopColor="#1f2937" />
                </linearGradient>
                {/* Radial gradients for heat zones */}
                <radialGradient id="zoneHigh" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(220, 38, 38, 0.55)" />
                  <stop offset="50%" stopColor="rgba(234, 88, 12, 0.3)" />
                  <stop offset="100%" stopColor="rgba(250, 204, 21, 0.05)" />
                </radialGradient>
                <radialGradient id="zoneMedium" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(234, 88, 12, 0.4)" />
                  <stop offset="50%" stopColor="rgba(250, 204, 21, 0.2)" />
                  <stop offset="100%" stopColor="rgba(250, 204, 21, 0.02)" />
                </radialGradient>
                <radialGradient id="zoneLow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(250, 204, 21, 0.3)" />
                  <stop offset="60%" stopColor="rgba(250, 204, 21, 0.1)" />
                  <stop offset="100%" stopColor="rgba(250, 204, 21, 0.0)" />
                </radialGradient>
                {/* Blur for abstracted mode */}
                <filter id="abstractBlur">
                  <feGaussianBlur stdDeviation="8" />
                </filter>
              </defs>

              <rect width="160" height="120" fill="url(#heatBg)" />

              {/* Head/shoulders silhouette (dimmer) */}
              <ellipse cx="80" cy="46" rx="22" ry="26" fill="#374151" />
              <ellipse cx="80" cy="110" rx="40" ry="30" fill="#374151" />

              {showFullHeatMap &&
                zones.map((zone) => {
                  const cx = (zone.x + zone.width / 2) * 1.6
                  const cy = (zone.y + zone.height / 2) * 1.2
                  const rx = (zone.width / 2) * 1.6
                  const ry = (zone.height / 2) * 1.2
                  const gradientId =
                    zone.intensity === "high"
                      ? "zoneHigh"
                      : zone.intensity === "medium"
                        ? "zoneMedium"
                        : "zoneLow"
                  const colors = intensityColor(zone.intensity)
                  return (
                    <g key={zone.id}>
                      {/* Soft glow */}
                      <ellipse
                        cx={cx}
                        cy={cy}
                        rx={rx * 1.15}
                        ry={ry * 1.15}
                        fill={`url(#${gradientId})`}
                      />
                      {/* Zone boundary */}
                      <ellipse
                        cx={cx}
                        cy={cy}
                        rx={rx}
                        ry={ry}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth="1"
                        strokeDasharray="3,2"
                      />
                    </g>
                  )
                })}

              {showAbstracted && (
                <g filter="url(#abstractBlur)">
                  {zones.map((zone) => {
                    const cx = (zone.x + zone.width / 2) * 1.6
                    const cy = (zone.y + zone.height / 2) * 1.2
                    const rx = (zone.width / 2) * 1.6
                    const ry = (zone.height / 2) * 1.2
                    return (
                      <ellipse
                        key={zone.id}
                        cx={cx}
                        cy={cy}
                        rx={rx}
                        ry={ry}
                        fill="rgba(220, 38, 38, 0.35)"
                      />
                    )
                  })}
                </g>
              )}

              {/* No zones = clean frame */}
              {!isSuspicious && (
                <g>
                  <rect
                    x="52"
                    y="25"
                    width="56"
                    height="48"
                    rx="3"
                    fill="none"
                    stroke="rgba(34, 197, 94, 0.4)"
                    strokeWidth="1"
                    strokeDasharray="4,3"
                  />
                </g>
              )}
            </svg>

            {/* Enterprise badge overlay */}
            {!isEnterprise && isSuspicious && (
              <div
                style={{
                  position: "absolute",
                  bottom: "6px",
                  left: "6px",
                  right: "6px",
                  background: "rgba(0,0,0,0.7)",
                  borderRadius: "3px",
                  padding: "3px 6px",
                  fontSize: "8px",
                  color: "#d1d5db",
                  textAlign: "center",
                  letterSpacing: "0.3px",
                }}
              >
                Detailed overlay available with Enterprise plan
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: "9px",
              color: isSuspicious ? "#B91C1C" : "#15803D",
              marginTop: "8px",
              fontWeight: 500,
            }}
          >
            {isSuspicious ? "Regions of Interest" : "Analysis Overlay"}
          </div>
        </div>

        {/* Legend + caption panel */}
        <div
          style={{
            flex: "1.2",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Caption */}
          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "8px",
                lineHeight: "1.4",
              }}
            >
              {isSuspicious
                ? "Regions of Interest Identified"
                : "No Regions of Concern Observed"}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#4b5563",
                lineHeight: "1.6",
                marginBottom: "12px",
              }}
            >
              {isSuspicious
                ? "Shaded regions indicate areas where the analysis observed patterns that may be inconsistent with unaltered media. Warmer colors correspond to higher confidence of anomaly."
                : "Frame analysis did not observe regions exhibiting patterns suggestive of manipulation. The scanned area is outlined for reference."}
            </div>
          </div>

          {/* Intensity legend */}
          {isSuspicious && (
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "9px",
                  color: "#6b7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                  marginBottom: "6px",
                }}
              >
                Intensity Scale
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                }}
              >
                {(
                  [
                    { label: "High", color: "#DC2626", bg: "rgba(220,38,38,0.15)" },
                    { label: "Medium", color: "#EA580C", bg: "rgba(234,88,12,0.12)" },
                    { label: "Low", color: "#CA8A04", bg: "rgba(202,138,4,0.12)" },
                  ] as const
                ).map((lvl) => (
                  <div
                    key={lvl.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "2px",
                        background: lvl.bg,
                        border: `1.5px solid ${lvl.color}`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "9px",
                        color: lvl.color,
                        fontWeight: 500,
                      }}
                    >
                      {lvl.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytical aid disclaimer */}
          <div
            style={{
              fontSize: "8px",
              color: "#9ca3af",
              lineHeight: "1.5",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "8px",
              fontStyle: "italic",
            }}
          >
            This visualization is an analytical aid derived from statistical
            modeling. It does not represent raw sensor data and should not be
            treated as direct evidence of manipulation.
          </div>
        </div>
      </div>
    </div>
  )
}
