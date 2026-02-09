"use client"

import type { PixelAnalysisResult, CaseDetails } from "@/lib/mock-data"

// ── Types ──────────────────────────────────────────────────────────
interface ManipulationZone {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  intensity: "high" | "medium" | "low"
}

interface SuspiciousFrame {
  index: number
  timestamp: string
  score: number
}

export interface HeatMapBlockProps {
  isSuspicious: boolean
  isEnterprise?: boolean
  pixelAnalysis?: PixelAnalysisResult[]
  confidencePercent: string
  jobType: "selfie_liveness" | "document_id" | "video" | "audio"
  contentType: string
  details?: CaseDetails
  overallScore: number
}

// ── Helpers ────────────────────────────────────────────────────────
function getManipulationZones(pixelAnalysis?: PixelAnalysisResult[]): ManipulationZone[] {
  const zones: ManipulationZone[] = []
  const face = pixelAnalysis?.find((p) => p.type === "face_manipulation")
  const eye = pixelAnalysis?.find((p) => p.type === "eye_gaze_manipulation")

  if (face?.result === "suspicious") {
    zones.push({
      id: "face-boundary", label: "Facial boundary",
      x: 25, y: 28, width: 50, height: 52,
      intensity: face.confidence > 0.8 ? "high" : face.confidence > 0.5 ? "medium" : "low",
    })
  }
  if (eye?.result === "suspicious") {
    const int = eye.confidence > 0.7 ? "high" as const : eye.confidence > 0.4 ? "medium" as const : "low" as const
    zones.push({ id: "eye-left", label: "Left eye", x: 30, y: 32, width: 16, height: 10, intensity: int })
    zones.push({ id: "eye-right", label: "Right eye", x: 54, y: 32, width: 16, height: 10, intensity: int })
  }
  return zones
}

function deriveTopFrames(overallScore: number, isSuspicious: boolean): SuspiciousFrame[] {
  if (!isSuspicious) return []
  const base = overallScore
  return [
    { index: 42, timestamp: "00:01.4", score: Math.min(base + 0.03, 0.99) },
    { index: 87, timestamp: "00:02.9", score: base },
    { index: 113, timestamp: "00:03.8", score: Math.max(base - 0.06, 0.5) },
  ]
}

function frameScoreColor(s: number) {
  if (s >= 0.85) return "#B91C1C"
  if (s >= 0.7) return "#EA580C"
  return "#B45309"
}

// ── Shared sub-components ──────────────────────────────────────────
function IntensityLegend() {
  const levels = [
    { label: "High", color: "#DC2626", bg: "rgba(220,38,38,0.15)" },
    { label: "Medium", color: "#EA580C", bg: "rgba(234,88,12,0.12)" },
    { label: "Low", color: "#CA8A04", bg: "rgba(202,138,4,0.12)" },
  ] as const
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {levels.map((l) => (
        <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "2px", background: l.bg, border: `1.5px solid ${l.color}` }} />
          <span style={{ fontSize: "8px", color: l.color, fontWeight: 500 }}>{l.label}</span>
        </div>
      ))}
    </div>
  )
}

function Disclaimer() {
  return (
    <div style={{
      fontSize: "7.5px", color: "#9ca3af", lineHeight: "1.5",
      borderTop: "1px solid #e5e7eb", paddingTop: "6px", fontStyle: "italic",
    }}>
      This visualization is an analytical aid derived from statistical modeling.
      It does not represent raw sensor data and should not be treated as direct
      evidence of manipulation.
    </div>
  )
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
      <span style={{ fontSize: "8px", color: "#6b7280" }}>{label}</span>
      <span style={{ fontSize: "8px", color: "#374151", fontWeight: 500, fontFamily: "monospace" }}>{value}</span>
    </div>
  )
}

// ── Silhouette frame SVG ───────────────────────────────────────────
function SourceFrameSvg() {
  return (
    <svg width="120" height="90" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "3px" }}>
      <defs><linearGradient id="fBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#374151" /><stop offset="100%" stopColor="#1f2937" /></linearGradient></defs>
      <rect width="160" height="120" fill="url(#fBg)" />
      <ellipse cx="80" cy="46" rx="22" ry="26" fill="#4b5563" />
      <ellipse cx="80" cy="110" rx="40" ry="30" fill="#4b5563" />
      <line x1="0" y1="40" x2="160" y2="40" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1="0" y1="80" x2="160" y2="80" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1="53" y1="0" x2="53" y2="120" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1="107" y1="0" x2="107" y2="120" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
    </svg>
  )
}

function HeatOverlaySvg({ zones, isSuspicious, isEnterprise }: { zones: ManipulationZone[]; isSuspicious: boolean; isEnterprise: boolean }) {
  const showFull = isEnterprise && isSuspicious && zones.length > 0
  const showBlur = !isEnterprise && isSuspicious && zones.length > 0
  return (
    <svg width="120" height="90" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "3px" }}>
      <defs>
        <linearGradient id="hBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#374151" /><stop offset="100%" stopColor="#1f2937" /></linearGradient>
        <radialGradient id="zH" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(220,38,38,0.55)" /><stop offset="50%" stopColor="rgba(234,88,12,0.3)" /><stop offset="100%" stopColor="rgba(250,204,21,0.05)" /></radialGradient>
        <radialGradient id="zM" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(234,88,12,0.4)" /><stop offset="50%" stopColor="rgba(250,204,21,0.2)" /><stop offset="100%" stopColor="rgba(250,204,21,0.02)" /></radialGradient>
        <radialGradient id="zL" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(250,204,21,0.3)" /><stop offset="60%" stopColor="rgba(250,204,21,0.1)" /><stop offset="100%" stopColor="rgba(250,204,21,0.0)" /></radialGradient>
        <filter id="aBlur"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>
      <rect width="160" height="120" fill="url(#hBg)" />
      <ellipse cx="80" cy="46" rx="22" ry="26" fill="#374151" />
      <ellipse cx="80" cy="110" rx="40" ry="30" fill="#374151" />
      {showFull && zones.map((z) => {
        const cx = (z.x + z.width / 2) * 1.6, cy = (z.y + z.height / 2) * 1.2
        const rx = (z.width / 2) * 1.6, ry = (z.height / 2) * 1.2
        const gId = z.intensity === "high" ? "zH" : z.intensity === "medium" ? "zM" : "zL"
        const st = z.intensity === "high" ? "rgba(220,38,38,0.6)" : z.intensity === "medium" ? "rgba(234,88,12,0.5)" : "rgba(250,204,21,0.45)"
        return (<g key={z.id}><ellipse cx={cx} cy={cy} rx={rx * 1.15} ry={ry * 1.15} fill={`url(#${gId})`} /><ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={st} strokeWidth="1" strokeDasharray="3,2" /></g>)
      })}
      {showBlur && <g filter="url(#aBlur)">{zones.map((z) => { const cx = (z.x + z.width / 2) * 1.6, cy = (z.y + z.height / 2) * 1.2, rx = (z.width / 2) * 1.6, ry = (z.height / 2) * 1.2; return <ellipse key={z.id} cx={cx} cy={cy} rx={rx} ry={ry} fill="rgba(220,38,38,0.35)" /> })}</g>}
      {!isSuspicious && <rect x="52" y="25" width="56" height="48" rx="3" fill="none" stroke="rgba(34,197,94,0.4)" strokeWidth="1" strokeDasharray="4,3" />}
    </svg>
  )
}

// ── Waveform SVG for audio ─────────────────────────────────────────
function WaveformSvg({ isSuspicious }: { isSuspicious: boolean }) {
  const bars = 48
  const baseColor = isSuspicious ? "#EF4444" : "#22C55E"
  const dimColor = isSuspicious ? "#FCA5A5" : "#86EFAC"
  return (
    <svg width="240" height="56" viewBox="0 0 240 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="56" rx="3" fill="#1f2937" />
      {Array.from({ length: bars }).map((_, i) => {
        const seed = Math.sin(i * 0.7 + 1.3) * 0.5 + 0.5
        const h = 6 + seed * 36
        const y = (56 - h) / 2
        const isSus = isSuspicious && (i >= 18 && i <= 24)
        return <rect key={i} x={4 + i * 4.9} y={y} width="3" height={h} rx="1.5" fill={isSus ? baseColor : dimColor} opacity={isSus ? 0.9 : 0.4} />
      })}
      {isSuspicious && (
        <>
          <rect x={4 + 18 * 4.9 - 2} y="0" width={7 * 4.9 + 4} height="56" rx="2" fill="none" stroke={baseColor} strokeWidth="1" strokeDasharray="3,2" opacity="0.6" />
          <text x={4 + 21 * 4.9} y="8" fill={baseColor} fontSize="6" fontWeight="600" textAnchor="middle">anomaly region</text>
        </>
      )}
    </svg>
  )
}

// ── Main component ─────────────────────────────────────────────────
export function HeatMapBlock({
  isSuspicious,
  isEnterprise = true,
  pixelAnalysis,
  confidencePercent,
  jobType,
  contentType,
  details,
  overallScore,
}: HeatMapBlockProps) {
  const zones = getManipulationZones(pixelAnalysis)
  const isAudio = jobType === "audio" || contentType.startsWith("audio/")
  const isVideo = jobType === "video" || jobType === "selfie_liveness" || contentType.startsWith("video/")

  // Score aggregation for video
  const topFrames = isVideo ? deriveTopFrames(overallScore, isSuspicious) : []
  const maxScore = topFrames.length > 0 ? topFrames[0].score : overallScore
  const avgScore = topFrames.length > 0 ? topFrames.reduce((a, f) => a + f.score, 0) / topFrames.length : overallScore

  // Metadata extraction
  const meta = details?.decoded_metadata
  const metaItems: { label: string; value: string }[] = []
  if (meta?.general) {
    if (meta.general.format) metaItems.push({ label: "Format", value: `${meta.general.format}${meta.general.format_profile ? ` (${meta.general.format_profile})` : ""}` })
    if (meta.general.duration) metaItems.push({ label: "Duration", value: meta.general.duration })
    if (meta.general.overall_bit_rate) metaItems.push({ label: "Bitrate", value: meta.general.overall_bit_rate })
    if (meta.general.writing_application) metaItems.push({ label: "Encoder", value: meta.general.writing_application })
  }
  if (meta?.video) {
    if (meta.video.width && meta.video.height) metaItems.push({ label: "Resolution", value: `${meta.video.width} x ${meta.video.height}` })
    if (meta.video.frame_rate) metaItems.push({ label: "Frame Rate", value: meta.video.frame_rate })
    if (meta.video.codec_id) metaItems.push({ label: "Video Codec", value: meta.video.codec_id })
  }
  if (meta?.audio) {
    if (meta.audio.sampling_rate) metaItems.push({ label: "Sample Rate", value: meta.audio.sampling_rate })
    if (meta.audio.channels) metaItems.push({ label: "Channels", value: `${meta.audio.channels} (${meta.audio.channel_layout || "unknown"})` })
    if (meta.audio.codec_id) metaItems.push({ label: "Audio Codec", value: meta.audio.codec_id })
  }

  // File integrity markers
  const integrityPassed = details?.structural_consistency?.modification_tests === "passed" && details?.structural_consistency?.validation_tests === "passed"

  // Badge label
  const badgeLabel = isAudio
    ? (isSuspicious ? "Anomalous patterns observed" : "No anomalous patterns")
    : (zones.length > 0 ? `${zones.length} region${zones.length !== 1 ? "s" : ""} of interest` : "No regions of concern")

  return (
    <div style={{ marginBottom: "20px", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
      {/* Header bar */}
      <div style={{
        padding: "6px 14px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: "9px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.4px" }}>
          {isAudio ? "Audio Analysis" : isVideo ? "Frame-by-Frame Analysis" : "Frame Analysis"}
        </span>
        <span style={{
          fontSize: "8px", fontWeight: 500, padding: "2px 8px", borderRadius: "3px",
          color: isSuspicious ? "#B91C1C" : "#15803D",
          background: isSuspicious ? "#FEF2F2" : "#F0FDF4",
          border: `1px solid ${isSuspicious ? "#FECACA" : "#BBF7D0"}`,
        }}>
          {badgeLabel}
        </span>
      </div>

      {/* Body */}
      <div style={{ display: "flex", background: "#f9fafb", minHeight: "130px" }}>

        {/* LEFT: Visual content (adapts to media type) */}
        <div style={{ flex: "2", borderRight: "1px solid #e5e7eb", padding: "12px 14px" }}>
          {isAudio ? (
            /* ── Audio: waveform placeholder ── */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <WaveformSvg isSuspicious={isSuspicious} />
              <div style={{ fontSize: "8px", color: isSuspicious ? "#B91C1C" : "#6b7280", fontWeight: 500 }}>
                {isSuspicious ? "Flagged audio region highlighted" : "Waveform visualization"}
              </div>
            </div>
          ) : isVideo && isSuspicious && topFrames.length > 0 ? (
            /* ── Video (suspicious): top 3 frames ── */
            <div>
              <div style={{ fontSize: "8px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: "8px" }}>
                Top 3 Suspicious Frames
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {topFrames.map((frame, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{
                      position: "relative", borderRadius: "3px", overflow: "hidden",
                      border: `1.5px solid ${frameScoreColor(frame.score)}`,
                    }}>
                      <svg width="100%" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
                        <rect width="100" height="60" fill="#1f2937" />
                        <ellipse cx="50" cy="24" rx="12" ry="14" fill="#374151" />
                        <ellipse cx="50" cy="55" rx="22" ry="16" fill="#374151" />
                        {/* Heat overlay per frame */}
                        <ellipse cx="50" cy="28" rx="18" ry="20" fill={`rgba(220,38,38,${0.1 + frame.score * 0.3})`} />
                      </svg>
                      <div style={{
                        position: "absolute", top: "2px", right: "3px",
                        background: frameScoreColor(frame.score), color: "#fff",
                        fontSize: "7px", fontWeight: 700, padding: "1px 4px", borderRadius: "2px",
                      }}>
                        {(frame.score * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div style={{ fontSize: "7px", color: "#6b7280", marginTop: "3px" }}>
                      Frame {frame.index} &middot; {frame.timestamp}
                    </div>
                  </div>
                ))}
              </div>
              {/* Score aggregation bar */}
              <div style={{
                marginTop: "8px", padding: "6px 8px", background: "#ffffff",
                border: "1px solid #e5e7eb", borderRadius: "4px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div>
                    <div style={{ fontSize: "7px", color: "#6b7280", textTransform: "uppercase" }}>Max Score</div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#B91C1C", fontFamily: "monospace" }}>{(maxScore * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "7px", color: "#6b7280", textTransform: "uppercase" }}>Running Avg</div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#EA580C", fontFamily: "monospace" }}>{(avgScore * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <div style={{ fontSize: "7px", color: "#9ca3af", maxWidth: "120px", lineHeight: "1.4" }}>
                  Scores represent maximum and mean across all analyzed frames
                </div>
              </div>
            </div>
          ) : (
            /* ── Image / non-suspicious video: source + heat map ── */
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <SourceFrameSvg />
                <div style={{ fontSize: "8px", color: "#6b7280", marginTop: "4px", fontWeight: 500 }}>Source Frame</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <HeatOverlaySvg zones={zones} isSuspicious={isSuspicious} isEnterprise={isEnterprise} />
                <div style={{ fontSize: "8px", color: isSuspicious ? "#B91C1C" : "#15803D", marginTop: "4px", fontWeight: 500 }}>
                  {isSuspicious ? "Regions of Interest" : "Analysis Overlay"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Legend + metadata panel */}
        <div style={{ flex: "1.3", padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "6px" }}>
          {/* Caption */}
          <div>
            <div style={{ fontSize: "9px", fontWeight: 600, color: "#374151", marginBottom: "4px", lineHeight: "1.4" }}>
              {isAudio
                ? (isSuspicious ? "Anomalous Audio Patterns" : "No Audio Anomalies Observed")
                : (isSuspicious ? "Regions of Interest Identified" : "No Regions of Concern Observed")}
            </div>
            <div style={{ fontSize: "8px", color: "#4b5563", lineHeight: "1.5", marginBottom: "6px" }}>
              {isAudio
                ? (isSuspicious
                    ? "Highlighted region indicates audio characteristics that may be inconsistent with natural speech patterns."
                    : "Audio analysis did not observe patterns suggestive of synthetic generation.")
                : (isSuspicious
                    ? "Shaded regions indicate areas where analysis observed patterns that may be inconsistent with unaltered media."
                    : "Frame analysis did not observe regions exhibiting patterns suggestive of manipulation.")}
            </div>
          </div>

          {/* Intensity legend (non-audio only when suspicious) */}
          {!isAudio && isSuspicious && (
            <div style={{ marginBottom: "4px" }}>
              <div style={{ fontSize: "8px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: "4px" }}>Intensity Scale</div>
              <IntensityLegend />
            </div>
          )}

          {/* Extracted metadata */}
          {metaItems.length > 0 && (
            <div style={{ marginBottom: "4px" }}>
              <div style={{ fontSize: "8px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: "3px" }}>Extracted Metadata</div>
              {metaItems.slice(0, 4).map((m, i) => (
                <MetadataRow key={i} label={m.label} value={m.value} />
              ))}
            </div>
          )}

          {/* File integrity check */}
          {details?.structural_consistency && (
            <div style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "3px 6px", borderRadius: "3px", marginBottom: "4px",
              background: integrityPassed ? "#F0FDF4" : "#FEF2F2",
              border: `1px solid ${integrityPassed ? "#BBF7D0" : "#FECACA"}`,
            }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: integrityPassed ? "#22C55E" : "#EF4444" }} />
              <span style={{ fontSize: "7.5px", fontWeight: 500, color: integrityPassed ? "#15803D" : "#B91C1C" }}>
                File integrity: {integrityPassed ? "Structural checks passed" : "Integrity concerns noted"}
              </span>
            </div>
          )}

          <Disclaimer />
        </div>
      </div>
    </div>
  )
}
