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
  isHighest: boolean
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
    zones.push({ id: "face-boundary", label: "Facial boundary", x: 25, y: 28, width: 50, height: 52, intensity: face.confidence > 0.8 ? "high" : face.confidence > 0.5 ? "medium" : "low" })
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
  const frames = [
    { index: 42, timestamp: "00:15.4", score: Math.min(base + 0.034, 0.99), isHighest: true },
    { index: 87, timestamp: "00:28.9", score: base, isHighest: false },
    { index: 113, timestamp: "00:37.2", score: Math.max(base - 0.06, 0.5), isHighest: false },
  ]
  return frames
}

function frameScoreColor(s: number) {
  if (s >= 0.85) return "#B91C1C"
  if (s >= 0.7) return "#EA580C"
  return "#B45309"
}

// ── Region descriptions for suspicious findings ──
function getRegionDescriptions(pixelAnalysis?: PixelAnalysisResult[], voiceResult?: { result?: string }) {
  const descriptions: { region: string; detail: string }[] = []
  const face = pixelAnalysis?.find((p) => p.type === "face_manipulation")
  const eye = pixelAnalysis?.find((p) => p.type === "eye_gaze_manipulation")
  if (face?.result === "suspicious") {
    descriptions.push({ region: "Facial region", detail: "Unnatural blending detected at jaw line boundary" })
  }
  if (eye?.result === "suspicious") {
    descriptions.push({ region: "Eye gaze trajectory", detail: "Inconsistent with natural movement patterns" })
  }
  if (voiceResult?.result?.toLowerCase() === "suspicious") {
    descriptions.push({ region: "Audio-visual sync", detail: "Temporal offset detected in lip movement correlation" })
  }
  if (face?.result === "suspicious") {
    descriptions.push({ region: "Lighting analysis", detail: "Shadow direction mismatch across facial planes" })
  }
  return descriptions
}

// ── Frame SVG with optional heat overlay ──
function FrameSvg({ width, height, showHeat, heatIntensity, zones }: { width: number; height: number; showHeat?: boolean; heatIntensity?: number; zones?: ManipulationZone[] }) {
  const vw = 200
  const vh = 150
  return (
    <svg width={width} height={height} viewBox={`0 0 ${vw} ${vh}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "4px", display: "block" }}>
      <defs>
        <linearGradient id="fBgH" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#374151" /><stop offset="100%" stopColor="#1f2937" /></linearGradient>
        <radialGradient id="heatH" cx="50%" cy="40%" r="45%"><stop offset="0%" stopColor={`rgba(220,38,38,${showHeat ? 0.5 : 0})`} /><stop offset="40%" stopColor={`rgba(234,88,12,${showHeat ? 0.25 : 0})`} /><stop offset="80%" stopColor={`rgba(250,204,21,${showHeat ? 0.08 : 0})`} /><stop offset="100%" stopColor="rgba(250,204,21,0)" /></radialGradient>
      </defs>
      <rect width={vw} height={vh} fill="url(#fBgH)" />
      {/* Silhouette */}
      <ellipse cx={vw / 2} cy={56} rx="28" ry="32" fill="#4b5563" />
      <ellipse cx={vw / 2} cy={135} rx="48" ry="36" fill="#4b5563" />
      {/* Grid lines */}
      <line x1="0" y1="50" x2={vw} y2="50" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1="0" y1="100" x2={vw} y2="100" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1={vw / 3} y1="0" x2={vw / 3} y2={vh} stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1={(vw * 2) / 3} y1="0" x2={(vw * 2) / 3} y2={vh} stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      {/* Heat overlay */}
      {showHeat && (
        <>
          <ellipse cx={vw / 2} cy="60" rx="48" ry="52" fill="url(#heatH)" />
          {zones?.map((z) => {
            const cx = (z.x + z.width / 2) * 2
            const cy = (z.y + z.height / 2) * 1.5
            const rx = (z.width / 2) * 2
            const ry = (z.height / 2) * 1.5
            const stroke = z.intensity === "high" ? "rgba(220,38,38,0.7)" : z.intensity === "medium" ? "rgba(234,88,12,0.6)" : "rgba(250,204,21,0.5)"
            return (
              <ellipse key={z.id} cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray="4,3" />
            )
          })}
        </>
      )}
    </svg>
  )
}

// ── Waveform SVG for audio ─────────────────────────────────────────
function WaveformSvg({ isSuspicious, width, height }: { isSuspicious: boolean; width: number; height: number }) {
  const bars = 60
  const baseColor = isSuspicious ? "#EF4444" : "#22C55E"
  const dimColor = isSuspicious ? "#FCA5A5" : "#86EFAC"
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "4px" }}>
      <rect width={width} height={height} rx="4" fill="#1f2937" />
      {Array.from({ length: bars }).map((_, i) => {
        const seed = Math.sin(i * 0.7 + 1.3) * 0.5 + 0.5
        const h = 8 + seed * (height - 20)
        const y = (height - h) / 2
        const isSus = isSuspicious && (i >= 22 && i <= 30)
        return <rect key={i} x={6 + i * ((width - 12) / bars)} y={y} width="3.5" height={h} rx="1.75" fill={isSus ? baseColor : dimColor} opacity={isSus ? 0.9 : 0.4} />
      })}
      {isSuspicious && (
        <>
          <rect x={6 + 22 * ((width - 12) / bars) - 3} y="0" width={9 * ((width - 12) / bars) + 6} height={height} rx="3" fill="none" stroke={baseColor} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7" />
          <text x={6 + 26 * ((width - 12) / bars)} y="12" fill={baseColor} fontSize="8" fontWeight="600" textAnchor="middle">anomaly region</text>
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
  const topFrames = isVideo ? deriveTopFrames(overallScore, isSuspicious) : []
  const maxScore = topFrames.length > 0 ? topFrames[0].score : overallScore
  const avgScore = topFrames.length > 0 ? topFrames.reduce((a, f) => a + f.score, 0) / topFrames.length : overallScore
  const voiceResult = details?.voice_analysis?.[0]
  const regionDescs = isSuspicious ? getRegionDescriptions(pixelAnalysis, voiceResult) : []

  // Metadata
  const meta = details?.decoded_metadata
  const metaItems: { label: string; value: string }[] = []
  if (meta?.general) {
    if (meta.general.duration) metaItems.push({ label: "Duration", value: meta.general.duration })
    if (meta.general.format) metaItems.push({ label: "Format", value: meta.general.format })
    if (meta.general.overall_bit_rate) metaItems.push({ label: "Bitrate", value: meta.general.overall_bit_rate })
    if (meta.general.writing_application) metaItems.push({ label: "Encoder", value: meta.general.writing_application })
    if (meta.general.file_size) metaItems.push({ label: "File Size", value: meta.general.file_size })
  }
  if (meta?.video) {
    if (meta.video.width && meta.video.height) metaItems.push({ label: "Resolution", value: `${meta.video.width} x ${meta.video.height}` })
    if (meta.video.frame_rate) metaItems.push({ label: "Frame Rate", value: meta.video.frame_rate })
    if (meta.video.codec_id) metaItems.push({ label: "Codec", value: meta.video.codec_id })
  }
  if (meta?.audio) {
    if (meta.audio.sampling_rate) metaItems.push({ label: "Sample Rate", value: meta.audio.sampling_rate })
  }

  const integrityPassed = details?.structural_consistency?.modification_tests === "passed" && details?.structural_consistency?.validation_tests === "passed"
  const hasIntegrityData = !!details?.structural_consistency

  return (
    <div style={{ marginBottom: "16px" }}>
      {/* ── HERO: Frame Analysis Section ── */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", marginBottom: "14px" }}>
        {/* Section header */}
        <div style={{
          padding: "8px 16px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {isAudio ? "Audio Analysis" : "Frame-by-Frame Analysis"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isVideo && isSuspicious && topFrames.length > 0 && (
              <div style={{ display: "flex", gap: "10px", fontSize: "9px" }}>
                <span style={{ color: "#6b7280" }}>Max: <span style={{ color: "#B91C1C", fontWeight: 700, fontFamily: "monospace" }}>{(maxScore * 100).toFixed(1)}%</span></span>
                <span style={{ color: "#6b7280" }}>Avg: <span style={{ color: "#EA580C", fontWeight: 700, fontFamily: "monospace" }}>{(avgScore * 100).toFixed(1)}%</span></span>
              </div>
            )}
            <span style={{
              fontSize: "8px", fontWeight: 600, padding: "3px 10px", borderRadius: "4px",
              color: isSuspicious ? "#B91C1C" : "#15803D",
              background: isSuspicious ? "#FEF2F2" : "#F0FDF4",
              border: `1px solid ${isSuspicious ? "#FECACA" : "#BBF7D0"}`,
            }}>
              {isAudio
                ? (isSuspicious ? "Anomalous patterns" : "No anomalies")
                : (zones.length > 0 ? `${zones.length} region${zones.length !== 1 ? "s" : ""} flagged` : "No regions of concern")}
            </span>
          </div>
        </div>

        {/* Frame display area */}
        <div style={{ background: "#f9fafb", padding: "16px 20px" }}>
          {isAudio ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <WaveformSvg isSuspicious={isSuspicious} width={600} height={120} />
            </div>
          ) : isVideo && isSuspicious && topFrames.length > 0 ? (
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              {topFrames.map((frame, i) => (
                <div key={i} style={{ flex: 1, maxWidth: "210px" }}>
                  <div style={{
                    position: "relative", borderRadius: "6px", overflow: "hidden",
                    border: `${frame.isHighest ? "2.5px" : "1.5px"} solid ${frame.isHighest ? "#DC2626" : "#d1d5db"}`,
                    boxShadow: frame.isHighest ? "0 0 12px rgba(220,38,38,0.2)" : "none",
                  }}>
                    <FrameSvg
                      width={210}
                      height={152}
                      showHeat={frame.isHighest && isEnterprise}
                      heatIntensity={frame.score}
                      zones={frame.isHighest ? zones : undefined}
                    />
                    {/* Score badge */}
                    <div style={{
                      position: "absolute", top: "6px", right: "6px",
                      background: frameScoreColor(frame.score), color: "#fff",
                      fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    }}>
                      {(frame.score * 100).toFixed(1)}%
                    </div>
                    {frame.isHighest && (
                      <div style={{
                        position: "absolute", top: "6px", left: "6px",
                        background: "#DC2626", color: "#fff",
                        fontSize: "7px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px",
                        textTransform: "uppercase", letterSpacing: "0.5px",
                      }}>
                        Highest
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "center", marginTop: "6px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151" }}>
                      Frame {frame.index} &mdash; {frame.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Image / non-suspicious: source + overlay side by side */
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <FrameSvg width={200} height={150} />
                <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "6px", fontWeight: 500 }}>Source Frame</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <FrameSvg width={200} height={150} showHeat={isSuspicious && isEnterprise} zones={zones} />
                <div style={{ fontSize: "9px", color: isSuspicious ? "#B91C1C" : "#15803D", marginTop: "6px", fontWeight: 500 }}>
                  {isSuspicious ? "Regions of Interest" : "Analysis Overlay"}
                </div>
              </div>
            </div>
          )}

          {/* Intensity legend (below frames when suspicious) */}
          {!isAudio && isSuspicious && (
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "10px" }}>
              {[
                { label: "High", color: "#DC2626", bg: "rgba(220,38,38,0.15)" },
                { label: "Medium", color: "#EA580C", bg: "rgba(234,88,12,0.12)" },
                { label: "Low", color: "#CA8A04", bg: "rgba(202,138,4,0.12)" },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: l.bg, border: `1.5px solid ${l.color}` }} />
                  <span style={{ fontSize: "9px", color: l.color, fontWeight: 500 }}>{l.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM: 2-column detail section ── */}
      <div style={{ display: "flex", gap: "14px" }}>
        {/* LEFT: Regions of Interest / Findings */}
        <div style={{
          flex: 1, padding: "14px 16px", background: "#f8fafc",
          border: "1px solid #e5e7eb", borderRadius: "8px",
        }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: "10px" }}>
            {isSuspicious ? "Regions of Interest Identified" : "Analysis Summary"}
          </div>
          {isSuspicious && regionDescs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {regionDescs.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#EF4444", marginTop: "5px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "#1a1a1a" }}>{r.region}</div>
                    <div style={{ fontSize: "9px", color: "#4b5563", lineHeight: "1.5" }}>{r.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "10px", color: "#6b7280", lineHeight: "1.6" }}>
              No indicators of manipulation were observed. Frame analysis did not detect regions exhibiting patterns suggestive of synthetic alteration.
            </div>
          )}
        </div>

        {/* RIGHT: Extracted Metadata */}
        <div style={{
          flex: 1, padding: "14px 16px", background: "#f8fafc",
          border: "1px solid #e5e7eb", borderRadius: "8px",
        }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: "10px" }}>
            Extracted Metadata
          </div>
          {metaItems.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {metaItems.slice(0, 6).map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "9px", color: "#6b7280" }}>{m.label}</span>
                  <span style={{ fontSize: "9px", color: "#374151", fontWeight: 500, fontFamily: "monospace" }}>{m.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "10px", color: "#6b7280" }}>No metadata available</div>
          )}
          {/* File integrity marker */}
          {hasIntegrityData && (
            <div style={{
              display: "flex", alignItems: "center", gap: "5px",
              marginTop: "10px", padding: "5px 8px", borderRadius: "4px",
              background: integrityPassed ? "#F0FDF4" : "#FEF2F2",
              border: `1px solid ${integrityPassed ? "#BBF7D0" : "#FECACA"}`,
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: integrityPassed ? "#22C55E" : "#EF4444" }} />
              <span style={{ fontSize: "8.5px", fontWeight: 500, color: integrityPassed ? "#15803D" : "#B91C1C" }}>
                File integrity: {integrityPassed ? "All structural checks passed" : "Integrity concerns noted"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
