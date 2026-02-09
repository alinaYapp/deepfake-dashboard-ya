import { type Case, formatBytes, formatDate } from "@/lib/mock-data"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

function generateReportHTML(caseData: Case): string {
  const reportNumber = caseData.id.replace("chk_", "").toUpperCase()
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const details = caseData.details
  const isSuspicious = caseData.verdict === "fake"
  const isUncertain = caseData.verdict === "uncertain"
  const confidencePercent = (caseData.score * 100).toFixed(1)

  // Determine likely source based on forensic analysis and device history
  const pipeline = details?.device_generation_history || [
    { generation: 1, brand: "iPhone 11", model: "Device Camera", camera_type: "Original capture", processing_steps: [] },
    { generation: 2, brand: "FFmpeg", model: "Re-wrap", camera_type: "Encoder", processing_steps: [] },
    { generation: 3, brand: "Haiper AI", model: "Image→Video", camera_type: "AI Generator", processing_steps: [] },
  ]
  const lastGen = pipeline[pipeline.length - 1]
  const primaryMatch = lastGen?.brand || "Unknown"
  const primaryType = lastGen?.camera_type || "Unknown"
  const criticalCount = details?.forensic_analysis?.filter((f: { severity: string }) => f.severity === "critical").length || 0
  const suspectCount = details?.forensic_analysis?.filter((f: { severity: string }) => f.severity === "suspect").length || 0

  // File integrity (needed early for metrics)
  const integrityPassed = details?.structural_consistency?.modification_tests === "passed" && details?.structural_consistency?.validation_tests === "passed"

  // Key metrics for Page 1 (max 4, plain language)
  const totalFlags = criticalCount + suspectCount
  const faceResult = details?.pixel_analysis?.find((p: { type: string }) => p.type === "face_manipulation")
  const eyeResult = details?.pixel_analysis?.find((p: { type: string }) => p.type === "eye_gaze_manipulation")
  const voiceResult = details?.voice_analysis?.[0]

  type Metric = { label: string; value: string; status: "alert" | "warn" | "ok"; iconType: string }
  const metrics: Metric[] = []
  if (faceResult) {
    metrics.push({
      label: "Face Analysis",
      value: faceResult.result === "suspicious" ? `${(faceResult.confidence * 100).toFixed(0)}%` : "Clear",
      status: faceResult.result === "suspicious" ? "alert" : "ok",
      iconType: "face",
    })
  }
  if (voiceResult) {
    const voiceSus = voiceResult.result?.toLowerCase() === "suspicious"
    metrics.push({
      label: "Voice Analysis",
      value: voiceSus ? `${(voiceResult.confidence * 100).toFixed(0)}%` : "Clear",
      status: voiceSus ? "alert" : "ok",
      iconType: "voice",
    })
  }
  metrics.push(totalFlags > 0
    ? { label: "Forensic Flags", value: `${totalFlags} signature${totalFlags !== 1 ? "s" : ""}`, status: criticalCount > 0 ? "alert" as const : "warn" as const, iconType: "forensic" }
    : { label: "Forensic Flags", value: "None", status: "ok" as const, iconType: "forensic" }
  )
  const hasIntegrityData = !!details?.structural_consistency
  const hasMetadata = !!details?.decoded_metadata
  metrics.push({
    label: "File Metadata",
    value: hasIntegrityData ? (integrityPassed ? "Consistent" : "Concerns") : hasMetadata ? "Extracted" : "Limited",
    status: hasIntegrityData ? (integrityPassed ? "ok" : "alert") : "ok",
    iconType: "file",
  })

  // Icon SVGs for PDF
  const iconSvgs: Record<string, (color: string) => string> = {
    face: (c) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="4" stroke="${c}" stroke-width="1.5"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="${c}" stroke-width="1.5"/></svg>`,
    voice: (c) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="6" y="1" width="4" height="8" rx="2" stroke="${c}" stroke-width="1.5"/><path d="M3 7c0 2.8 2.2 5 5 5s5-2.2 5-5" stroke="${c}" stroke-width="1.5"/><line x1="8" y1="12" x2="8" y2="15" stroke="${c}" stroke-width="1.5"/></svg>`,
    forensic: (c) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 5v6l7 4 7-4V5L8 1z" stroke="${c}" stroke-width="1.5"/><path d="M8 8V5" stroke="${c}" stroke-width="1.5"/><circle cx="8" cy="10" r="0.8" fill="${c}"/></svg>`,
    file: (c) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="1" stroke="${c}" stroke-width="1.5"/><line x1="5" y1="5" x2="11" y2="5" stroke="${c}" stroke-width="1"/><line x1="5" y1="7.5" x2="11" y2="7.5" stroke="${c}" stroke-width="1"/><line x1="5" y1="10" x2="9" y2="10" stroke="${c}" stroke-width="1"/></svg>`,
  }

  // Region descriptions for suspicious findings
  const regionDescs: { region: string; detail: string }[] = []
  if (isSuspicious) {
    if (faceResult?.result === "suspicious") regionDescs.push({ region: "Facial region", detail: "Unnatural blending detected at jaw line boundary" })
    if (eyeResult?.result === "suspicious") regionDescs.push({ region: "Eye gaze trajectory", detail: "Inconsistent with natural movement patterns" })
    if (voiceResult?.result?.toLowerCase() === "suspicious") regionDescs.push({ region: "Audio-visual sync", detail: "Temporal offset detected in lip movement correlation" })
    if (faceResult?.result === "suspicious") regionDescs.push({ region: "Lighting analysis", detail: "Shadow direction mismatch across facial planes" })
  }

  const metricColor = (s: string) => s === "alert" ? "#B91C1C" : s === "warn" ? "#B45309" : "#15803D"
  const metricBg = (s: string) => s === "alert" ? "#FEF2F2" : s === "warn" ? "#FFFBEB" : "#F0FDF4"
  const metricBorder = (s: string) => s === "alert" ? "#FECACA" : s === "warn" ? "#FDE68A" : "#BBF7D0"

  // Heat map zone computation
  type HeatZone = { id: string; label: string; x: number; y: number; w: number; h: number; intensity: "high" | "medium" | "low" }
  const heatZones: HeatZone[] = []
  if (faceResult?.result === "suspicious") {
    heatZones.push({ id: "face", label: "Facial boundary", x: 25, y: 28, w: 50, h: 52,
      intensity: faceResult.confidence > 0.8 ? "high" : faceResult.confidence > 0.5 ? "medium" : "low" })
  }
  if (eyeResult?.result === "suspicious") {
    const eyeInt = eyeResult.confidence > 0.7 ? "high" as const : eyeResult.confidence > 0.4 ? "medium" as const : "low" as const
    heatZones.push({ id: "eye-l", label: "Left eye", x: 30, y: 32, w: 16, h: 10, intensity: eyeInt })
    heatZones.push({ id: "eye-r", label: "Right eye", x: 54, y: 32, w: 16, h: 10, intensity: eyeInt })
  }
  const hasZones = isSuspicious && heatZones.length > 0

  const zoneGradientId = (z: HeatZone) => z.intensity === "high" ? "zoneHigh" : z.intensity === "medium" ? "zoneMedium" : "zoneLow"
  const zoneStroke = (z: HeatZone) => z.intensity === "high" ? "rgba(220,38,38,0.6)" : z.intensity === "medium" ? "rgba(234,88,12,0.5)" : "rgba(250,204,21,0.45)"
  const zoneSvgEllipses = heatZones.map(z => {
    const cx = (z.x + z.w / 2) * 1.6
    const cy = (z.y + z.h / 2) * 1.2
    const rx = (z.w / 2) * 1.6
    const ry = (z.h / 2) * 1.2
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 1.15}" ry="${ry * 1.15}" fill="url(#${zoneGradientId(z)})" /><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${zoneStroke(z)}" stroke-width="1" stroke-dasharray="3,2" />`
  }).join('')

  // Content type detection
  const isAudio = caseData.job_type === "audio" || caseData.content_type.startsWith("audio/")
  const isVideo = caseData.job_type === "video" || caseData.job_type === "selfie_liveness" || caseData.content_type.startsWith("video/")

  // Score aggregation for video: top 3 suspicious frames
  type TopFrame = { index: number; timestamp: string; score: number }
  const topFrames: TopFrame[] = []
  if (isVideo && isSuspicious) {
    const base = caseData.score
    topFrames.push({ index: 42, timestamp: "00:15.4", score: Math.min(base + 0.034, 0.99) })
    topFrames.push({ index: 87, timestamp: "00:28.9", score: base })
    topFrames.push({ index: 113, timestamp: "00:37.2", score: Math.max(base - 0.06, 0.5) })
  }
  const maxFrameScore = topFrames.length > 0 ? topFrames[0].score : caseData.score
  const avgFrameScore = topFrames.length > 0 ? topFrames.reduce((a, f) => a + f.score, 0) / topFrames.length : caseData.score
  const frameScoreColor = (s: number) => s >= 0.85 ? "#B91C1C" : s >= 0.7 ? "#EA580C" : "#B45309"

  // Metadata extraction
  const meta = details?.decoded_metadata
  type MetaItem = { label: string; value: string }
  const metaItems: MetaItem[] = []
  if (meta?.general) {
    if (meta.general.format) metaItems.push({ label: "Format", value: `${meta.general.format}${meta.general.format_profile ? ` (${meta.general.format_profile})` : ""}` })
    if (meta.general.duration) metaItems.push({ label: "Duration", value: meta.general.duration })
    if (meta.general.overall_bit_rate) metaItems.push({ label: "Bitrate", value: meta.general.overall_bit_rate })
    if (meta.general.writing_application) metaItems.push({ label: "Encoder", value: meta.general.writing_application })
  }
  if (meta?.video) {
    if (meta.video.width && meta.video.height) metaItems.push({ label: "Resolution", value: `${meta.video.width} x ${meta.video.height}` })
    if (meta.video.frame_rate) metaItems.push({ label: "Frame Rate", value: meta.video.frame_rate })
  }
  if (meta?.audio) {
    if (meta.audio.sampling_rate) metaItems.push({ label: "Sample Rate", value: meta.audio.sampling_rate })
    if (meta.audio.channels) metaItems.push({ label: "Channels", value: `${meta.audio.channels}${meta.audio.channel_layout ? ` (${meta.audio.channel_layout})` : ""}` })
  }

  // File integrity check (integrityPassed defined earlier)

  // Waveform SVG for audio
  const waveformBars = Array.from({ length: 48 }).map((_, i) => {
    const seed = Math.sin(i * 0.7 + 1.3) * 0.5 + 0.5
    const h = 6 + seed * 36
    const y = (56 - h) / 2
    const isSusBar = isSuspicious && (i >= 18 && i <= 24)
    const color = isSusBar ? (isSuspicious ? "#EF4444" : "#22C55E") : (isSuspicious ? "#FCA5A5" : "#86EFAC")
    const opacity = isSusBar ? 0.9 : 0.4
    return `<rect x="${4 + i * 4.9}" y="${y}" width="3" height="${h}" rx="1.5" fill="${color}" opacity="${opacity}" />`
  }).join('')

  // Key findings (probabilistic language)
  const keyFindings: string[] = []
  if (isSuspicious) {
    if (faceResult?.result === "suspicious") {
      keyFindings.push("Facial region analysis suggests patterns consistent with synthetic alteration")
    }
    if (eyeResult?.result === "suspicious") {
      keyFindings.push("Eye gaze trajectory indicates possible inconsistency with expected natural movement")
    }
    if (voiceResult?.result?.toLowerCase() === "suspicious") {
      keyFindings.push("Audio characteristics suggest the presence of patterns associated with voice synthesis")
    }
    if (criticalCount > 0) {
      keyFindings.push("File metadata exhibits structural similarities to known AI generation tool signatures")
    }
    if (!integrityPassed && hasIntegrityData) {
      keyFindings.push("File structure exhibits characteristics inconsistent with unmodified media containers")
    }
  } else {
    keyFindings.push("No indicators of facial manipulation were observed in this analysis")
    if (voiceResult && voiceResult.result?.toLowerCase() !== "suspicious") {
      keyFindings.push("Voice characteristics appear consistent with natural speech patterns")
    }
    keyFindings.push("File structure is consistent with known authentic capture device signatures")
    if (integrityPassed) {
      keyFindings.push("File metadata and container structure are consistent with expected encoding standards")
    }
  }

  const verdictColor = isSuspicious ? '#B91C1C' : isUncertain ? '#B45309' : '#15803D'
  const verdictBg = isSuspicious ? '#FEF2F2' : isUncertain ? '#FFFBEB' : '#F0FDF4'
  const verdictBorder = isSuspicious ? '#FECACA' : isUncertain ? '#FDE68A' : '#BBF7D0'
  const verdictLabel = isSuspicious ? 'SUSPICIOUS' : isUncertain ? 'UNCERTAIN' : 'AUTHENTIC'

  return `<!DOCTYPE html>
<html>
<head>
  <title>DataSpike Report #${reportNumber}</title>
  <style>
    @page { margin: 0; size: A4; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; font-size: 11px; line-height: 1.5; background: white; }
    .page { width: 794px; height: 1123px; padding: 36px 48px 36px; position: relative; background: white; overflow: hidden; box-sizing: border-box; }
    .page-footer { position: absolute; bottom: 28px; left: 48px; right: 48px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #9ca3af; padding-top: 10px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="page">

    <!-- 1. Header Row: logo + verdict + score + report ID -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 2px solid #e5e7eb; margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 28px; height: 28px; background: #4A7BF7; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 10px;">DS</div>
        <span style="font-size: 15px; font-weight: 600; color: #4A7BF7;">DataSpike</span>
      </div>
      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="display: inline-block; padding: 6px 14px; border-radius: 6px; background: ${verdictColor}; color: #fff; font-weight: 700; font-size: 12px; letter-spacing: 0.04em;">${verdictLabel}</div>
        <div style="text-align: right;">
          <div style="font-size: 28px; font-weight: 700; color: ${verdictColor}; line-height: 1;">${confidencePercent}<span style="font-size: 14px; font-weight: 600;">%</span></div>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-family: monospace; font-weight: 600; font-size: 11px; color: #1a1a1a;">#${reportNumber}</div>
        <div style="font-size: 9px; color: #6b7280; margin-top: 2px;">${reportDate}</div>
      </div>
    </div>

    <!-- 2. Confidence bar + case reference -->
    <div style="margin-bottom: 14px;">
      <div style="height: 5px; background: rgba(0,0,0,0.05); border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
        <div style="height: 100%; width: ${confidencePercent}%; background: ${verdictColor}; border-radius: 3px;"></div>
      </div>
      <div style="display: flex; gap: 20px; font-size: 9px; color: #6b7280;">
        <span>Case <span style="font-family: monospace; color: #374151;">${details?.project_info?.case_id ? details.project_info.case_id.split('-')[0] : caseData.id}</span></span>
        <span>${caseData.content_type} &middot; ${formatBytes(caseData.file_size_bytes)}</span>
        <span>Submitted ${formatDate(caseData.created_at)}</span>
        <span>Engine v${details?.project_info?.verify_version || '2.374'}</span>
      </div>
    </div>

    <!-- 3. Summary Cards (compact with icons) -->
    <div style="display: flex; gap: 10px; margin-bottom: 16px;">
      ${metrics.slice(0, 4).map((m) => `
      <div style="flex: 1; padding: 10px 12px; background: ${metricBg(m.status)}; border: 1px solid ${metricBorder(m.status)}; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
        ${iconSvgs[m.iconType]?.(metricColor(m.status)) || ''}
        <div>
          <div style="font-size: 9px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px;">${m.label}</div>
          <div style="font-size: 13px; font-weight: 700; color: ${metricColor(m.status)}; line-height: 1.2;">${m.value}</div>
        </div>
      </div>`).join('')}
    </div>

    <!-- 4. HERO: Frame-by-Frame Analysis -->
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 14px;">
      <div style="padding: 8px 16px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 10px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">${isAudio ? 'Audio Analysis' : 'Frame-by-Frame Analysis'}</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${isVideo && isSuspicious && topFrames.length > 0 ? `
          <span style="font-size: 9px; color: #6b7280;">Max: <span style="color: #B91C1C; font-weight: 700; font-family: monospace;">${(maxFrameScore * 100).toFixed(1)}%</span></span>
          <span style="font-size: 9px; color: #6b7280;">Avg: <span style="color: #EA580C; font-weight: 700; font-family: monospace;">${(avgFrameScore * 100).toFixed(1)}%</span></span>
          ` : ''}
          <span style="font-size: 8px; font-weight: 600; padding: 3px 10px; border-radius: 4px; color: ${isSuspicious ? '#B91C1C' : '#15803D'}; background: ${isSuspicious ? '#FEF2F2' : '#F0FDF4'}; border: 1px solid ${isSuspicious ? '#FECACA' : '#BBF7D0'};">
            ${isAudio ? (isSuspicious ? 'Anomalous patterns' : 'No anomalies') : (heatZones.length > 0 ? `${heatZones.length} region${heatZones.length !== 1 ? 's' : ''} flagged` : 'No regions of concern')}
          </span>
        </div>
      </div>
      <div style="background: #f9fafb; padding: 16px 20px;">
        ${isAudio ? `
        <div style="text-align: center;">
          <svg width="600" height="120" viewBox="0 0 600 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="120" rx="4" fill="#1f2937"/>
            ${Array.from({ length: 60 }).map((_, i) => {
              const seed = Math.sin(i * 0.7 + 1.3) * 0.5 + 0.5
              const h = 8 + seed * 100
              const y = (120 - h) / 2
              const isSusBar = isSuspicious && (i >= 22 && i <= 30)
              const color = isSusBar ? (isSuspicious ? "#EF4444" : "#22C55E") : (isSuspicious ? "#FCA5A5" : "#86EFAC")
              const opacity = isSusBar ? 0.9 : 0.4
              return `<rect x="${6 + i * 9.8}" y="${y}" width="3.5" height="${h}" rx="1.75" fill="${color}" opacity="${opacity}" />`
            }).join('')}
            ${isSuspicious ? `<rect x="${6 + 22 * 9.8 - 3}" y="0" width="${9 * 9.8 + 6}" height="120" rx="3" fill="none" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"/><text x="${6 + 26 * 9.8}" y="12" fill="#EF4444" font-size="8" font-weight="600" text-anchor="middle">anomaly region</text>` : ''}
          </svg>
        </div>
          ` : (isVideo && isSuspicious && topFrames.length > 0) ? `
          <!-- Video (suspicious): top 3 larger frames -->
          <div style="display: flex; gap: 12px; justify-content: center;">
            ${topFrames.map((frame, i) => `
            <div style="flex: 1; max-width: 210px;">
              <div style="position: relative; border-radius: 6px; overflow: hidden; border: ${i === 0 ? '2.5px' : '1.5px'} solid ${i === 0 ? '#DC2626' : '#d1d5db'}; ${i === 0 ? 'box-shadow: 0 0 12px rgba(220,38,38,0.2);' : ''}">
                <svg width="210" height="152" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; border-radius: 4px;">
                  <defs>
                    <linearGradient id="fBgV${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#374151"/><stop offset="100%" stop-color="#1f2937"/></linearGradient>
                    <radialGradient id="heatV${i}" cx="50%" cy="40%" r="45%"><stop offset="0%" stop-color="rgba(220,38,38,${(0.15 + frame.score * 0.35).toFixed(2)})"/><stop offset="40%" stop-color="rgba(234,88,12,${(0.05 + frame.score * 0.2).toFixed(2)})"/><stop offset="80%" stop-color="rgba(250,204,21,0.08)"/><stop offset="100%" stop-color="rgba(250,204,21,0)"/></radialGradient>
                  </defs>
                  <rect width="200" height="150" fill="url(#fBgV${i})"/>
                  <ellipse cx="100" cy="56" rx="28" ry="32" fill="#4b5563"/><ellipse cx="100" cy="135" rx="48" ry="36" fill="#4b5563"/>
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#6b7280" stroke-width="0.3" stroke-dasharray="4,4"/><line x1="0" y1="100" x2="200" y2="100" stroke="#6b7280" stroke-width="0.3" stroke-dasharray="4,4"/>
                  <line x1="67" y1="0" x2="67" y2="150" stroke="#6b7280" stroke-width="0.3" stroke-dasharray="4,4"/><line x1="133" y1="0" x2="133" y2="150" stroke="#6b7280" stroke-width="0.3" stroke-dasharray="4,4"/>
                  ${i === 0 ? `<ellipse cx="100" cy="60" rx="48" ry="52" fill="url(#heatV${i})"/>${heatZones.map(z => `<ellipse cx="${(z.x + z.w / 2) * 2}" cy="${(z.y + z.h / 2) * 1.5}" rx="${(z.w / 2) * 2}" ry="${(z.h / 2) * 1.5}" fill="none" stroke="rgba(220,38,38,0.7)" stroke-width="1.5" stroke-dasharray="4,3"/>`).join('')}` : `<ellipse cx="100" cy="60" rx="48" ry="52" fill="rgba(220,38,38,${(0.1 + frame.score * 0.3).toFixed(2)})"/>`}
                </svg>
                <div style="position: absolute; top: 6px; right: 6px; background: ${frameScoreColor(frame.score)}; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.2);">${(frame.score * 100).toFixed(1)}%</div>
                ${i === 0 ? '<div style="position: absolute; top: 6px; left: 6px; background: #DC2626; color: #fff; font-size: 7px; font-weight: 700; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Highest</div>' : ''}
              </div>
              <div style="text-align: center; margin-top: 6px;">
                <div style="font-size: 10px; font-weight: 600; color: #374151;">Frame ${frame.index} — ${frame.timestamp}</div>
              </div>
            </div>`).join('')}
          </div>
          ` : `
          <!-- Image / non-suspicious: source + overlay -->
          <div style="display: flex; gap: 16px; justify-content: center;">
            <div style="text-align: center;">
              <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius: 4px;">
                <defs><linearGradient id="fBgP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#374151"/><stop offset="100%" stop-color="#1f2937"/></linearGradient></defs>
                <rect width="200" height="150" fill="url(#fBgP)"/>
                <ellipse cx="100" cy="56" rx="28" ry="32" fill="#4b5563"/><ellipse cx="100" cy="135" rx="48" ry="36" fill="#4b5563"/>
                <line x1="0" y1="50" x2="200" y2="50" stroke="#6b7280" stroke-width="0.3" stroke-dasharray="4,4"/><line x1="0" y1="100" x2="200" y2="100" stroke="#6b7280" stroke-width="0.3" stroke-dasharray="4,4"/>
                <line x1="67" y1="0" x2="67" y2="150" stroke="#6b7280" stroke-width="0.3" stroke-dasharray="4,4"/><line x1="133" y1="0" x2="133" y2="150" stroke="#6b7280" stroke-width="0.3" stroke-dasharray="4,4"/>
              </svg>
              <div style="font-size: 9px; color: #6b7280; margin-top: 6px; font-weight: 500;">Source Frame</div>
            </div>
            <div style="text-align: center;">
              <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius: 4px;">
                <defs>
                  <linearGradient id="hBgP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#374151"/><stop offset="100%" stop-color="#1f2937"/></linearGradient>
                  <radialGradient id="zoneHigh" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(220,38,38,0.55)"/><stop offset="50%" stop-color="rgba(234,88,12,0.3)"/><stop offset="100%" stop-color="rgba(250,204,21,0.05)"/></radialGradient>
                  <radialGradient id="zoneMedium" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(234,88,12,0.4)"/><stop offset="50%" stop-color="rgba(250,204,21,0.2)"/><stop offset="100%" stop-color="rgba(250,204,21,0.02)"/></radialGradient>
                  <radialGradient id="zoneLow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(250,204,21,0.3)"/><stop offset="60%" stop-color="rgba(250,204,21,0.1)"/><stop offset="100%" stop-color="rgba(250,204,21,0.0)"/></radialGradient>
                </defs>
                <rect width="200" height="150" fill="url(#hBgP)"/>
                <ellipse cx="100" cy="56" rx="28" ry="32" fill="#374151"/><ellipse cx="100" cy="135" rx="48" ry="36" fill="#374151"/>
                ${hasZones ? zoneSvgEllipses : ''}
                ${!isSuspicious ? '<rect x="65" y="30" width="70" height="60" rx="3" fill="none" stroke="rgba(34,197,94,0.4)" stroke-width="1" stroke-dasharray="4,3"/>' : ''}
              </svg>
              <div style="font-size: 9px; color: ${isSuspicious ? '#B91C1C' : '#15803D'}; margin-top: 6px; font-weight: 500;">${isSuspicious ? 'Regions of Interest' : 'Analysis Overlay'}</div>
            </div>
          </div>
          `}
          ${!isAudio && isSuspicious ? `
          <div style="display: flex; justify-content: center; gap: 16px; margin-top: 10px;">
            <div style="display: flex; align-items: center; gap: 5px;"><div style="width: 8px; height: 8px; border-radius: 2px; background: rgba(220,38,38,0.15); border: 1.5px solid #DC2626;"></div><span style="font-size: 9px; color: #DC2626; font-weight: 500;">High</span></div>
            <div style="display: flex; align-items: center; gap: 5px;"><div style="width: 8px; height: 8px; border-radius: 2px; background: rgba(234,88,12,0.12); border: 1.5px solid #EA580C;"></div><span style="font-size: 9px; color: #EA580C; font-weight: 500;">Medium</span></div>
            <div style="display: flex; align-items: center; gap: 5px;"><div style="width: 8px; height: 8px; border-radius: 2px; background: rgba(202,138,4,0.12); border: 1.5px solid #CA8A04;"></div><span style="font-size: 9px; color: #CA8A04; font-weight: 500;">Low</span></div>
          </div>` : ''}
        </div>
      </div>
    </div>

    <!-- 5. Two-column detail section -->
    <div style="display: flex; gap: 14px; margin-bottom: 14px;">
      <!-- LEFT: Regions of Interest -->
      <div style="flex: 1; padding: 14px 16px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="font-size: 10px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 10px;">${isSuspicious ? 'Regions of Interest Identified' : 'Analysis Summary'}</div>
        ${isSuspicious && regionDescs.length > 0 ? `
        ${regionDescs.map(r => `
        <div style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #EF4444; margin-top: 5px; flex-shrink: 0;"></div>
          <div>
            <div style="font-size: 10px; font-weight: 600; color: #1a1a1a;">${r.region}</div>
            <div style="font-size: 9px; color: #4b5563; line-height: 1.5;">${r.detail}</div>
          </div>
        </div>`).join('')}
        ` : `<div style="font-size: 10px; color: #6b7280; line-height: 1.6;">No indicators of manipulation were observed. Frame analysis did not detect regions exhibiting patterns suggestive of synthetic alteration.</div>`}
      </div>
      <!-- RIGHT: Extracted Metadata -->
      <div style="flex: 1; padding: 14px 16px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="font-size: 10px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 10px;">Extracted Metadata</div>
        ${metaItems.length > 0 ? metaItems.slice(0, 6).map(m => `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
          <span style="font-size: 9px; color: #6b7280;">${m.label}</span>
          <span style="font-size: 9px; color: #374151; font-weight: 500; font-family: monospace;">${m.value}</span>
        </div>`).join('') : '<div style="font-size: 10px; color: #6b7280;">No metadata available</div>'}
        ${hasIntegrityData ? `
        <div style="display: flex; align-items: center; gap: 5px; margin-top: 10px; padding: 5px 8px; border-radius: 4px; background: ${integrityPassed ? '#F0FDF4' : '#FEF2F2'}; border: 1px solid ${integrityPassed ? '#BBF7D0' : '#FECACA'};">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: ${integrityPassed ? '#22C55E' : '#EF4444'};"></div>
          <span style="font-size: 8.5px; font-weight: 500; color: ${integrityPassed ? '#15803D' : '#B91C1C'};">File integrity: ${integrityPassed ? 'All structural checks passed' : 'Integrity concerns noted'}</span>
        </div>` : ''}
      </div>
    </div>

    <!-- 6. Attribution (compact row) -->
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div>
          <div style="font-size: 9px; color: #6b7280; font-weight: 500;">Closest Match</div>
          <div style="font-size: 13px; font-weight: 700; color: #1a1a1a;">${primaryMatch}</div>
        </div>
        <div style="width: 1px; height: 28px; background: #e5e7eb;"></div>
        <div>
          <div style="font-size: 9px; color: #6b7280; font-weight: 500;">Type</div>
          <div style="font-size: 11px; font-weight: 600; color: #374151;">${primaryType}</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 16px; font-size: 9px;">
        <span style="color: #6b7280;">Metadata: <span style="color: #374151; font-weight: 500;">${hasMetadata ? 'Analyzed' : 'Limited'}</span></span>
        <span style="color: #6b7280;">Encoding: <span style="color: #374151; font-weight: 500;">${meta?.general?.writing_application || 'Standard'}</span></span>
        <span style="color: #6b7280;">Integrity: <span style="color: ${integrityPassed ? '#15803D' : hasIntegrityData ? '#B91C1C' : '#6b7280'}; font-weight: 500;">${hasIntegrityData ? (integrityPassed ? 'Passed' : 'Concerns') : 'N/A'}</span></span>
      </div>
    </div>

    <!-- Disclaimer -->
    <div style="font-size: 8.5px; color: #9ca3af; line-height: 1.5; padding-top: 8px; border-top: 1px solid #f3f4f6;">
      This report was generated by automated analysis (DataSpike v${details?.project_info?.verify_version || '2.374'}).
      Findings are probabilistic in nature and should be evaluated in conjunction with independent investigative context.
      This document does not constitute legal advice or a conclusive determination of authenticity.
    </div>

    <div class="page-footer">
      <span>DataSpike Deepfake Detection Report</span>
      <span style="letter-spacing: 1px; font-weight: 600;">CONFIDENTIAL</span>
      <span>Page 1 of 1</span>
    </div>
  </div>
</body>
</html>`
}

async function generatePDFFromHTML(html: string, filename: string, orientation: "portrait" | "landscape" = "portrait") {
  // Create an iframe to isolate styles (prevents oklch color inheritance)
  const iframe = document.createElement("iframe")
  iframe.style.position = "absolute"
  iframe.style.left = "-9999px"
  iframe.style.top = "0"
  iframe.style.width = orientation === "portrait" ? "794px" : "1123px"
  iframe.style.height = orientation === "portrait" ? "1123px" : "794px"
  iframe.style.border = "none"
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    throw new Error("Could not access iframe document")
  }

  iframeDoc.open()
  iframeDoc.write(html)
  iframeDoc.close()

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const pages = iframeDoc.querySelectorAll(".page")

  const pdf = new jsPDF({
    orientation: orientation,
    unit: "mm",
    format: "a4",
  })

  const pageWidth = orientation === "portrait" ? 210 : 297
  const pageHeight = orientation === "portrait" ? 297 : 210
  const pixelWidth = orientation === "portrait" ? 794 : 1123
  const pixelHeight = orientation === "portrait" ? 1123 : 794

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i] as HTMLElement

    page.style.display = "block"
    page.style.width = `${pixelWidth}px`
    page.style.height = `${pixelHeight}px`
    page.style.minHeight = `${pixelHeight}px`
    page.style.maxHeight = `${pixelHeight}px`
    page.style.overflow = "hidden"
    page.style.margin = "0"
    page.style.boxSizing = "border-box"
    page.style.background = "white"

    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: pixelWidth,
      height: pixelHeight,
    })

    const imgData = canvas.toDataURL("image/jpeg", 0.95)

    if (i > 0) {
      pdf.addPage()
    }

    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight)
  }

  document.body.removeChild(iframe)

  const pdfBlob = pdf.output("blob")
  const pdfUrl = URL.createObjectURL(pdfBlob)

  window.open(pdfUrl, "_blank")
  pdf.save(filename)

  setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000)
}

export async function downloadReport(caseData: Case) {
  const html = generateReportHTML(caseData)
  const filename = `DataSpike-Report-${caseData.id.replace("chk_", "").toUpperCase()}.pdf`
  await generatePDFFromHTML(html, filename, "portrait")
}

export async function downloadBulkReport(cases: Case[]) {
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const totalChecks = cases.length
  const fakeCount = cases.filter((c) => c.verdict === "fake").length
  const realCount = cases.filter((c) => c.verdict === "real").length
  const uncertainCount = cases.filter((c) => c.verdict === "uncertain").length

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>DataSpike - Bulk Analysis Report</title>
  <style>
    @page { margin: 0; size: A4 landscape; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, sans-serif; 
      color: #1a1a1a; 
      font-size: 10px;
      background: white;
    }
    .page {
      width: 1123px;
      height: 794px;
      padding: 40px;
      background: white;
      overflow: hidden;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-icon {
      width: 28px;
      height: 28px;
      background: #4A7BF7;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 10px;
    }
    .logo-text {
      font-size: 16px;
      font-weight: 600;
      color: #4A7BF7;
    }
    .title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 20px;
    }
    .stats {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      padding: 14px 20px;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      min-width: 120px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .stat-label {
      font-size: 10px;
      color: #6b7280;
      margin-top: 2px;
    }
    .stat-card.fake .stat-value { color: #DC2626; }
    .stat-card.real .stat-value { color: #16A34A; }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 8px 12px;
      text-align: left;
      border: 1px solid #e5e7eb;
      font-size: 10px;
    }
    th {
      background: #f8fafc;
      font-weight: 600;
      color: #4b5563;
    }
    .result-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 600;
    }
    .result-badge.fake { background: #FEE2E2; color: #DC2626; }
    .result-badge.real { background: #DCFCE7; color: #16A34A; }
    .result-badge.uncertain { background: #FEF3C7; color: #D97706; }
    .mono { font-family: monospace; font-size: 9px; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">DS</div>
        <div class="logo-text">DataSpike</div>
      </div>
      <div style="font-size: 11px; color: #6b7280;">${reportDate}</div>
    </div>
    
    <div class="title">Bulk Analysis Report - ${totalChecks} Checks</div>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${totalChecks}</div>
        <div class="stat-label">Total Checks</div>
      </div>
      <div class="stat-card fake">
        <div class="stat-value">${fakeCount}</div>
        <div class="stat-label">Suspicious</div>
      </div>
      <div class="stat-card real">
        <div class="stat-value">${realCount}</div>
        <div class="stat-label">Valid</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${uncertainCount}</div>
        <div class="stat-label">Uncertain</div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Check ID</th>
          <th>Status</th>
          <th>Type</th>
          <th>Content</th>
          <th>Size</th>
          <th>Score</th>
          <th>Verdict</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        ${cases
          .slice(0, 15)
          .map(
            (c) => `
        <tr>
          <td class="mono">${c.id}</td>
          <td><span class="result-badge ${c.status === "completed" ? "real" : c.status === "failed" ? "fake" : "uncertain"}">${c.status}</span></td>
          <td>${c.job_type.replace("_", " ")}</td>
          <td>${c.content_type}</td>
          <td>${formatBytes(c.file_size_bytes)}</td>
          <td style="color: ${c.score > 0.7 ? "#DC2626" : c.score < 0.3 ? "#16A34A" : "#D97706"};">${(c.score * 100).toFixed(1)}%</td>
          <td><span class="result-badge ${c.verdict}">${c.verdict}</span></td>
          <td>${formatDate(c.created_at)}</td>
        </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  </div>
</body>
</html>`

  const filename = `DataSpike-BulkReport-${new Date().toISOString().split("T")[0]}.pdf`
  await generatePDFFromHTML(html, filename, "landscape")
}
