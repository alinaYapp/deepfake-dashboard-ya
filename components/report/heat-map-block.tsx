"use client"

import type { PixelAnalysisResult, CaseDetails } from "@/lib/mock-data"
import React from "react"

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
  return [
    { index: 42, timestamp: "00:15.4", score: Math.min(base + 0.034, 0.99), isHighest: true },
    { index: 87, timestamp: "00:28.9", score: base, isHighest: false },
    { index: 113, timestamp: "00:37.2", score: Math.max(base - 0.06, 0.5), isHighest: false },
  ]
}

function frameScoreColor(s: number) {
  if (s >= 0.85) return "#B91C1C"
  if (s >= 0.7) return "#EA580C"
  return "#B45309"
}

function getRegionDescriptions(pixelAnalysis?: PixelAnalysisResult[]) {
  const d: { region: string; detail: string }[] = []
  const face = pixelAnalysis?.find((p) => p.type === "face_manipulation")
  const eye = pixelAnalysis?.find((p) => p.type === "eye_gaze_manipulation")
  if (face?.result === "suspicious") d.push({ region: "Facial region", detail: "Unnatural blending detected at jaw line boundary" })
  if (eye?.result === "suspicious") d.push({ region: "Eye gaze trajectory", detail: "Inconsistent with natural movement patterns" })
  if (face?.result === "suspicious") d.push({ region: "Lighting analysis", detail: "Shadow direction mismatch across facial planes" })
  return d
}

// ── Frame SVG ──────────────────────────────────────────────────────
function FrameSvg({ width, height, showHeat, zones }: { width: number; height: number; showHeat?: boolean; zones?: ManipulationZone[] }) {
  const vw = 200; const vh = 150
  return (
    <svg width={width} height={height} viewBox={`0 0 ${vw} ${vh}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "4px", display: "block" }}>
      <defs>
        <linearGradient id="fBgH" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#374151" /><stop offset="100%" stopColor="#1f2937" /></linearGradient>
        <radialGradient id="heatH" cx="50%" cy="40%" r="45%"><stop offset="0%" stopColor={`rgba(220,38,38,${showHeat ? 0.5 : 0})`} /><stop offset="40%" stopColor={`rgba(234,88,12,${showHeat ? 0.25 : 0})`} /><stop offset="80%" stopColor={`rgba(250,204,21,${showHeat ? 0.08 : 0})`} /><stop offset="100%" stopColor="rgba(250,204,21,0)" /></radialGradient>
      </defs>
      <rect width={vw} height={vh} fill="url(#fBgH)" />
      <ellipse cx={vw / 2} cy={56} rx="28" ry="32" fill="#4b5563" />
      <ellipse cx={vw / 2} cy={135} rx="48" ry="36" fill="#4b5563" />
      <line x1="0" y1="50" x2={vw} y2="50" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1="0" y1="100" x2={vw} y2="100" stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1={vw / 3} y1="0" x2={vw / 3} y2={vh} stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      <line x1={(vw * 2) / 3} y1="0" x2={(vw * 2) / 3} y2={vh} stroke="#6b7280" strokeWidth="0.3" strokeDasharray="4,4" />
      {showHeat && (
        <ellipse cx={vw / 2} cy="60" rx="48" ry="52" fill="url(#heatH)" />
      )}
    </svg>
  )
}

// ── Waveform SVG ───────────────────────────────────────────────────
function WaveformSvg({ isSuspicious, width, height }: { isSuspicious: boolean; width: number; height: number }) {
  const bars = 60
  const base = isSuspicious ? "#EF4444" : "#22C55E"
  const dim = isSuspicious ? "#FCA5A5" : "#86EFAC"
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "4px" }}>
      <rect width={width} height={height} rx="4" fill="#1f2937" />
      {Array.from({ length: bars }).map((_, i) => {
        const seed = Math.sin(i * 0.7 + 1.3) * 0.5 + 0.5
        const h = 8 + seed * (height - 20)
        const y = (height - h) / 2
        const isSus = isSuspicious && (i >= 22 && i <= 30)
        return <rect key={i} x={6 + i * ((width - 12) / bars)} y={y} width="3.5" height={h} rx="1.75" fill={isSus ? base : dim} opacity={isSus ? 0.9 : 0.4} />
      })}
      {isSuspicious && (
        <>
          <rect x={6 + 22 * ((width - 12) / bars) - 3} y="0" width={9 * ((width - 12) / bars) + 6} height={height} rx="3" fill="none" stroke={base} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7" />
          <text x={6 + 26 * ((width - 12) / bars)} y="12" fill={base} fontSize="8" fontWeight="600" textAnchor="middle">anomaly region</text>
        </>
      )}
    </svg>
  )
}

// ── Forensic flags builder (data-driven from CaseDetails) ──────────
interface FlagEntry {
  type: "red" | "amber" | "green"
  icon: "info" | "warn" | "check"
  title: string
  description: string
}

function buildForensicFlags(isSuspicious: boolean, details?: CaseDetails): FlagEntry[] {
  const encoderVal = details?.decoded_metadata?.general?.writing_application || ""
  const sigCat = details?.structural_analysis?.signature_category || ""
  const isAiGen = sigCat === "AI Generator"
  const isProSw = sigCat === "Professional Software" || sigCat === "Uncategorized"
  const isSusEncoder = encoderVal.toLowerCase().includes("ffmpeg") || encoderVal.toLowerCase().includes("lavf") || encoderVal.toLowerCase().includes("converter")

  if (!isSuspicious && !isAiGen && !isProSw && !isSusEncoder) {
    return [{ type: "green", icon: "check", title: "No signs of manipulation detected", description: "No errors were found during analysis." }]
  }

  const out: FlagEntry[] = []
  if (isSuspicious) {
    out.push({ type: "red", icon: "info", title: "High confidence of AI-generated content detected", description: "Deepfake detected by the model. Signatures consistent with known deepfake generation tools found in file structure." })
  }
  if (isAiGen) {
    out.push({ type: "red", icon: "warn", title: "AI video generator signatures detected", description: encoderVal ? `Metadata contains clear signs that the video was generated by an AI tool. Software: ${encoderVal}.` : "Metadata contains clear signs that the video was generated by an AI tool." })
  }
  if (isProSw) {
    out.push({ type: "amber", icon: "warn", title: "Professional video editing software detected", description: encoderVal ? `Metadata contains clear signs of professional software such as ${encoderVal}.` : "Metadata contains clear signs of professional software such as Adobe After Effects or similar tools." })
  }
  if (isSusEncoder) {
    out.push({ type: "amber", icon: "warn", title: "Suspicious metadata detected", description: encoderVal ? `Suspicious metadata found \u2014 encoder: ${encoderVal}. This can be a result of video conversions.` : "Suspicious metadata found \u2014 for example missing camera data, encoding mismatches, etc." })
  }
  return out
}

const FLAG_COLORS: Record<string, { bg: string; border: string; titleColor: string; descColor: string }> = {
  red: { bg: "#FEE2E2", border: "#DC2626", titleColor: "#991B1B", descColor: "#7F1D1D" },
  amber: { bg: "#FEF3C7", border: "#F59E0B", titleColor: "#92400E", descColor: "#78350F" },
  green: { bg: "#D1FAE5", border: "#10B981", titleColor: "#065F46", descColor: "#047857" },
}

function FlagIcon({ icon }: { icon: "info" | "warn" | "check" }) {
  if (icon === "info") return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}><circle cx="7" cy="7" r="6" fill="#DC2626" /><text x="7" y="10.5" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">i</text></svg>
  if (icon === "warn") return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}><path d="M7 1L1 12h12L7 1z" fill="#F59E0B" stroke="#D97706" strokeWidth="0.5" /><text x="7" y="10.5" textAnchor="middle" fill="#78350F" fontSize="8" fontWeight="700">!</text></svg>
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}><circle cx="7" cy="7" r="6" fill="#10B981" /><path d="M4.5 7L6.5 9L9.5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

// ── Metadata builder (grouped subsections from decoded_metadata) ───
interface MetaGroup { heading: string; rows: { label: string; value: string }[] }

function buildMetaGroups(decoded?: { general?: Record<string, string>; video?: Record<string, string>; audio?: Record<string, string> }): MetaGroup[] {
  const groups: MetaGroup[] = []

  // Video Stream
  const vr: { label: string; value: string }[] = []
  if (decoded?.video) {
    const v = decoded.video
    if (v.codec_id || v.format) vr.push({ label: "Codec", value: v.format ? `${v.format} (${v.codec_id || ""})` : v.codec_id || "\u2014" })
    if (v.width && v.height) vr.push({ label: "Resolution", value: `${v.width} x ${v.height}` })
    if (v.frame_rate) vr.push({ label: "Frame Rate", value: v.frame_rate })
  }
  if (decoded?.general) {
    if (decoded.general.overall_bit_rate) vr.push({ label: "Bitrate", value: decoded.general.overall_bit_rate })
    if (decoded.general.duration) vr.push({ label: "Duration", value: decoded.general.duration })
  }
  if (decoded?.audio?.sampling_rate) vr.push({ label: "Sample Rate", value: decoded.audio.sampling_rate })
  if (vr.length > 0) groups.push({ heading: "Video Stream", rows: vr })

  // Container
  const cr: { label: string; value: string }[] = []
  if (decoded?.general?.format) cr.push({ label: "Format", value: decoded.general.format + (decoded.general.format_profile ? ` (${decoded.general.format_profile})` : "") })
  if (decoded?.general?.writing_application) cr.push({ label: "Encoder", value: decoded.general.writing_application })
  if (cr.length > 0) groups.push({ heading: "Container", rows: cr })

  return groups
}

// ── Main component ─────────────────────────────────────────────────
export function HeatMapBlock({ isSuspicious, isEnterprise = true, pixelAnalysis, confidencePercent, jobType, contentType, details, overallScore }: HeatMapBlockProps) {
  const zones = getManipulationZones(pixelAnalysis)
  const isAudio = jobType === "audio" || contentType.startsWith("audio/")
  const isVideo = jobType === "video" || jobType === "selfie_liveness" || contentType.startsWith("video/")
  const topFrames = isVideo ? deriveTopFrames(overallScore, isSuspicious) : []
  const maxScore = topFrames.length > 0 ? topFrames[0].score : overallScore
  const avgScore = topFrames.length > 0 ? topFrames.reduce((a, f) => a + f.score, 0) / topFrames.length : overallScore
  const regionDescs = isSuspicious ? getRegionDescriptions(pixelAnalysis) : []

  const decoded = details?.decoded_metadata
  const forensicFlags = buildForensicFlags(isSuspicious, details)
  const metaGroups = buildMetaGroups(decoded)

  return (
    <div style={{ marginBottom: "6px" }}>
      {/* ── SECTION A: Frame-by-Frame Analysis ── */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", marginBottom: "6px" }}>
        <div style={{ padding: "5px 12px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
          </div>
        </div>

        <div style={{ background: "#f9fafb", padding: "8px 14px" }}>
          {isAudio ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <WaveformSvg isSuspicious={isSuspicious} width={640} height={100} />
            </div>
          ) : isVideo && isSuspicious && topFrames.length > 0 ? (
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              {topFrames.map((frame, i) => (
                <div key={i} style={{ flex: 1, maxWidth: "210px" }}>
                  <div style={{
                    position: "relative", borderRadius: "5px", overflow: "hidden",
                    border: `${frame.isHighest ? "2px" : "1px"} solid ${frame.isHighest ? "#DC2626" : "#d1d5db"}`,
                    boxShadow: frame.isHighest ? "0 0 8px rgba(220,38,38,0.2)" : "none",
                  }}>
                    <FrameSvg width={210} height={130} />
                    <div style={{
                      position: "absolute", top: "4px", right: "4px",
                      background: frameScoreColor(frame.score), color: "#fff",
                      fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}>
                      {(frame.score * 100).toFixed(1)}%
                    </div>
                    {frame.isHighest && (
                      <div style={{
                        position: "absolute", top: "4px", left: "4px",
                        background: "#DC2626", color: "#fff",
                        fontSize: "7px", fontWeight: 700, padding: "2px 5px", borderRadius: "3px",
                        textTransform: "uppercase", letterSpacing: "0.5px",
                      }}>Highest</div>
                    )}
                  </div>
                  <div style={{ textAlign: "center", marginTop: "3px" }}>
                    <div style={{ fontSize: "9px", fontWeight: 600, color: "#374151" }}>
                      Frame {frame.index} &mdash; {frame.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <FrameSvg width={200} height={130} />
                <div style={{ fontSize: "8px", color: "#6b7280", marginTop: "3px", fontWeight: 500 }}>Source Frame</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION B: Manipulation Zones (full-width, only when suspicious + not audio) ── */}
      {isSuspicious && !isAudio && (
        <div style={{ border: "1.5px solid #FECACA", borderRadius: "6px", overflow: "hidden", marginBottom: "6px", background: "#FEF2F2" }}>
          <div style={{ padding: "4px 12px", background: "#FEE2E2", borderBottom: "1px solid #FECACA", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#991B1B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Manipulation Zones Detected
            </span>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { label: "High", color: "#DC2626", bg: "rgba(220,38,38,0.2)" },
                { label: "Medium", color: "#EA580C", bg: "rgba(234,88,12,0.15)" },
                { label: "Low", color: "#CA8A04", bg: "rgba(202,138,4,0.15)" },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: l.bg, border: `1.5px solid ${l.color}` }} />
                  <span style={{ fontSize: "7px", color: l.color, fontWeight: 600 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", borderRadius: "5px", overflow: "hidden", border: "2px solid #DC2626" }}>
              <FrameSvg width={280} height={210} showHeat={true} zones={zones} />
              <div style={{
                position: "absolute", top: "5px", left: "5px", background: "rgba(220,38,38,0.9)", color: "#fff",
                fontSize: "7px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px", textTransform: "uppercase",
              }}>Frame 42 - Highest Score</div>
            </div>
            <div style={{ fontSize: "8px", color: "#7F1D1D", marginTop: "6px", textAlign: "center", lineHeight: "1.4", maxWidth: "420px" }}>
              Analysis detected anomalies in facial regions with varying confidence levels across the frame
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION C: Forensic Flags + Extracted Metadata ── */}
      <div style={{ display: "flex", gap: "8px" }}>
        {/* LEFT: Forensic Flags */}
        <div style={{ flex: "1.4", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "9px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
            Forensic Flags
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {forensicFlags.map((flag, i) => {
              const c = FLAG_COLORS[flag.type]
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "8px 10px", background: c.bg, borderLeft: `4px solid ${c.border}`, borderRadius: "4px" }}>
                  <FlagIcon icon={flag.icon} />
                  <div>
                    <div style={{ fontSize: "9px", fontWeight: 700, color: c.titleColor, lineHeight: "1.3" }}>{flag.title}</div>
                    <div style={{ fontSize: "8px", color: c.descColor, lineHeight: "1.4", marginTop: "2px" }}>{flag.description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT: Extracted Metadata (grouped) */}
        {metaGroups.length > 0 ? (
          <div style={{ flex: "0.6", background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ padding: "6px 10px 3px", fontSize: "9px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.3px" }}>Extracted Metadata</div>
            {metaGroups.map((section, si) => (
              <div key={section.heading}>
                <div style={{ padding: "4px 10px 2px", fontSize: "7.5px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.6px" }}>{section.heading}</div>
                {section.rows.map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 10px", background: i % 2 === 0 ? "#f8fafc" : "#ffffff", borderBottom: i < section.rows.length - 1 || si < metaGroups.length - 1 ? "1px solid #f0f1f3" : "none" }}>
                    <span style={{ fontSize: "8px", color: "#6b7280" }}>{r.label}</span>
                    <span style={{ fontSize: "8px", color: "#374151", fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace" }}>{r.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex: "0.6", padding: "8px 10px", background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "6px" }}>
            <div style={{ fontSize: "9px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: "5px" }}>Extracted Metadata</div>
            <div style={{ fontSize: "9px", color: "#6b7280" }}>No metadata available</div>
          </div>
        )}
      </div>
    </div>
  )
}
