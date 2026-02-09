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

  // Determine likely source based on forensic analysis and pipeline
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

  // Key metrics for Page 1 (max 4, plain language)
  const totalFlags = criticalCount + suspectCount
  const faceResult = details?.pixel_analysis?.find((p: { type: string }) => p.type === "face_manipulation")
  const voiceResult = details?.voice_analysis?.[0]

  type Metric = { label: string; value: string; status: "alert" | "warn" | "ok" }
  const metrics: Metric[] = []
  if (faceResult) {
    metrics.push({
      label: "Face Analysis",
      value: faceResult.result === "suspicious" ? `${(faceResult.confidence * 100).toFixed(0)}% confidence of concern` : "No concerns indicated",
      status: faceResult.result === "suspicious" ? "alert" : "ok",
    })
  }
  if (voiceResult) {
    const voiceSus = voiceResult.result?.toLowerCase() === "suspicious"
    metrics.push({
      label: "Voice Analysis",
      value: voiceSus ? `${(voiceResult.confidence * 100).toFixed(0)}% confidence of concern` : "No concerns indicated",
      status: voiceSus ? "alert" : "ok",
    })
  }
  metrics.push(totalFlags > 0
    ? { label: "Forensic Flags", value: `${totalFlags} signature${totalFlags !== 1 ? "s" : ""} noted`, status: criticalCount > 0 ? "alert" as const : "warn" as const }
    : { label: "Forensic Flags", value: "None observed", status: "ok" as const }
  )
  metrics.push({
    label: "Processing Pipeline",
    value: pipeline.length > 1 ? `${pipeline.length} stages observed` : pipeline.length === 1 ? `Single source indicated: ${pipeline[0]?.brand}` : "Undetermined",
    status: pipeline.length > 2 ? "warn" : "ok",
  })

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
  const eyeResult = details?.pixel_analysis?.find((p: { type: string }) => p.type === "eye_gaze_manipulation")
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

  // Key findings (probabilistic language)
  const keyFindings: string[] = []
  if (isSuspicious) {
    if (faceResult?.result === "suspicious") {
      keyFindings.push("Facial region analysis suggests patterns consistent with synthetic alteration")
    }
    const eyeResult2 = details?.pixel_analysis?.find((p: { type: string }) => p.type === "eye_gaze_manipulation")
    if (eyeResult2?.result === "suspicious") {
      keyFindings.push("Eye gaze trajectory indicates possible inconsistency with expected natural movement")
    }
    if (voiceResult?.result?.toLowerCase() === "suspicious") {
      keyFindings.push("Audio characteristics suggest the presence of patterns associated with voice synthesis")
    }
    if (criticalCount > 0) {
      keyFindings.push("File metadata exhibits structural similarities to known AI generation tool signatures")
    }
    if (pipeline.length > 2) {
      keyFindings.push("Media appears to have been processed through multiple intermediate stages")
    }
  } else {
    keyFindings.push("No indicators of facial manipulation were observed in this analysis")
    if (voiceResult && voiceResult.result?.toLowerCase() !== "suspicious") {
      keyFindings.push("Voice characteristics appear consistent with natural speech patterns")
    }
    keyFindings.push("File structure is consistent with known authentic capture device signatures")
    if (pipeline.length <= 1) {
      keyFindings.push("Available metadata suggests a single origination source")
    }
  }

  return `<!DOCTYPE html>
<html>
<head>
  <title>DataSpike Report #${reportNumber}</title>
  <style>
    @page { margin: 0; size: A4; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      color: #1a1a1a; 
      font-size: 11px;
      line-height: 1.5;
      background: white;
    }
    
    .page {
      width: 794px;
      height: 1123px;
      padding: 40px 50px;
      position: relative;
      background: white;
      overflow: hidden;
      box-sizing: border-box;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-icon {
      width: 32px;
      height: 32px;
      background: #4A7BF7;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    }
    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: #4A7BF7;
    }
    .header-right {
      text-align: right;
      font-size: 11px;
      color: #6b7280;
    }
    .report-id {
      font-weight: 600;
      color: #1a1a1a;
      font-family: monospace;
    }
    
    /* Footer */
    .page-footer {
      position: absolute;
      bottom: 30px;
      left: 50px;
      right: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #9ca3af;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <!-- Single-Page Executive Summary -->
  <div class="page" style="padding: 48px 56px 44px;">

    <!-- 1. Report Header -->
    <div class="header" style="margin-bottom: 28px;">
      <div class="logo">
        <div class="logo-icon" style="width: 28px; height: 28px; font-size: 10px;">DS</div>
        <div class="logo-text" style="font-size: 15px;">DataSpike</div>
      </div>
      <div class="header-right">
        <div class="report-id" style="font-size: 12px;">#${reportNumber}</div>
        <div style="font-size: 10px; margin-top: 2px;">${reportDate}</div>
      </div>
    </div>

    <!-- 2. Overall Verdict Block (most prominent) -->
    <div style="background: ${isSuspicious ? '#FEF2F2' : isUncertain ? '#FFFBEB' : '#F0FDF4'}; border: 1.5px solid ${isSuspicious ? '#FECACA' : isUncertain ? '#FDE68A' : '#BBF7D0'}; border-radius: 10px; padding: 24px 28px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="display: inline-block; padding: 7px 14px; border-radius: 6px; background: ${isSuspicious ? '#B91C1C' : isUncertain ? '#B45309' : '#15803D'}; color: white; font-weight: 700; font-size: 13px; letter-spacing: 0.02em;">
            ${isSuspicious ? 'SUSPICIOUS' : isUncertain ? 'UNCERTAIN' : 'VALID'}
          </div>
          <div style="font-size: 13px; color: #4b5563; margin-top: 10px; font-weight: 500;">
            ${isSuspicious ? 'Analysis indicates possible manipulation' : isUncertain ? 'Analysis results are inconclusive' : 'No indicators of manipulation identified'}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10px; color: #6b7280; margin-bottom: 4px;">Confidence Score</div>
          <div style="font-size: 36px; font-weight: 700; color: ${isSuspicious ? '#B91C1C' : isUncertain ? '#B45309' : '#15803D'}; line-height: 1;">
            ${confidencePercent}<span style="font-size: 18px; font-weight: 600;">%</span>
          </div>
        </div>
      </div>
      <div style="margin-top: 16px; height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden;">
        <div style="height: 100%; width: ${confidencePercent}%; background: ${isSuspicious ? '#B91C1C' : isUncertain ? '#B45309' : '#15803D'}; border-radius: 3px;"></div>
      </div>
      <div style="display: flex; gap: 24px; margin-top: 14px; font-size: 10px; color: #6b7280;">
        <span>Case <span style="font-family: monospace; color: #374151;">${details?.project_info?.case_id ? details.project_info.case_id.split('-')[0] : caseData.id}</span></span>
        <span>${caseData.content_type} &middot; ${formatBytes(caseData.file_size_bytes)}</span>
        <span>Submitted ${formatDate(caseData.created_at)}</span>
        <span>Engine v${details?.project_info?.verify_version || '2.374'}</span>
      </div>
    </div>

    <!-- 3. Key Metrics Summary -->
    <div style="display: flex; gap: 12px; margin-bottom: 24px;">
      ${metrics.slice(0, 4).map((m) => `
      <div style="flex: 1; padding: 14px 16px; background: ${metricBg(m.status)}; border: 1px solid ${metricBorder(m.status)}; border-radius: 8px;">
        <div style="font-size: 10px; color: #6b7280; font-weight: 500; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px;">${m.label}</div>
        <div style="font-size: 12px; font-weight: 600; color: ${metricColor(m.status)}; line-height: 1.3;">${m.value}</div>
      </div>`).join('')}
    </div>

    <!-- 4. Frame Analysis Heat Map -->
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="padding: 8px 16px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 10px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.4px;">Frame Analysis</span>
        ${isSuspicious
          ? `<span style="font-size: 9px; font-weight: 500; color: #B91C1C; background: #FEF2F2; border: 1px solid #FECACA; padding: 2px 8px; border-radius: 3px;">${heatZones.length} region${heatZones.length !== 1 ? 's' : ''} of interest</span>`
          : `<span style="font-size: 9px; font-weight: 500; color: #15803D; background: #F0FDF4; border: 1px solid #BBF7D0; padding: 2px 8px; border-radius: 3px;">No regions of concern</span>`}
      </div>
      <div style="display: flex; background: #f9fafb;">
        <!-- Source frame -->
        <div style="flex: 1; border-right: 1px solid #e5e7eb; padding: 16px; text-align: center;">
          <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius: 4px;">
            <defs><linearGradient id="frameBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#374151"/><stop offset="100%" stop-color="#1f2937"/></linearGradient></defs>
            <rect width="160" height="120" fill="url(#frameBg)"/>
            <ellipse cx="80" cy="46" rx="22" ry="26" fill="#4b5563"/>
            <ellipse cx="80" cy="110" rx="40" ry="30" fill="#4b5563"/>
            <line x1="0" y1="40" x2="160" y2="40" stroke="#6b7280" stroke-width="0.3" stroke-dasharray="4,4"/>
            <line x1="0" y1="80" x2="160" y2="80" stroke="#6b7280" stroke-width="0.3" stroke-dasharray="4,4"/>
            <line x1="53" y1="0" x2="53" y2="120" stroke="#6b7280" stroke-width="0.3" stroke-dasharray="4,4"/>
            <line x1="107" y1="0" x2="107" y2="120" stroke="#6b7280" stroke-width="0.3" stroke-dasharray="4,4"/>
          </svg>
          <div style="font-size: 9px; color: #6b7280; margin-top: 8px; font-weight: 500;">Source Frame</div>
        </div>
        <!-- Heat map overlay -->
        <div style="flex: 1; border-right: 1px solid #e5e7eb; padding: 16px; text-align: center;">
          <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius: 4px;">
            <defs>
              <linearGradient id="heatBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#374151"/><stop offset="100%" stop-color="#1f2937"/></linearGradient>
              <radialGradient id="zoneHigh" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(220,38,38,0.55)"/><stop offset="50%" stop-color="rgba(234,88,12,0.3)"/><stop offset="100%" stop-color="rgba(250,204,21,0.05)"/></radialGradient>
              <radialGradient id="zoneMedium" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(234,88,12,0.4)"/><stop offset="50%" stop-color="rgba(250,204,21,0.2)"/><stop offset="100%" stop-color="rgba(250,204,21,0.02)"/></radialGradient>
              <radialGradient id="zoneLow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(250,204,21,0.3)"/><stop offset="60%" stop-color="rgba(250,204,21,0.1)"/><stop offset="100%" stop-color="rgba(250,204,21,0.0)"/></radialGradient>
            </defs>
            <rect width="160" height="120" fill="url(#heatBg)"/>
            <ellipse cx="80" cy="46" rx="22" ry="26" fill="#374151"/>
            <ellipse cx="80" cy="110" rx="40" ry="30" fill="#374151"/>
            ${hasZones ? zoneSvgEllipses : ''}
            ${!isSuspicious ? '<rect x="52" y="25" width="56" height="48" rx="3" fill="none" stroke="rgba(34,197,94,0.4)" stroke-width="1" stroke-dasharray="4,3"/>' : ''}
          </svg>
          <div style="font-size: 9px; color: ${isSuspicious ? '#B91C1C' : '#15803D'}; margin-top: 8px; font-weight: 500;">${isSuspicious ? 'Regions of Interest' : 'Analysis Overlay'}</div>
        </div>
        <!-- Legend + caption -->
        <div style="flex: 1.2; padding: 14px 16px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 10px; font-weight: 600; color: #374151; margin-bottom: 8px; line-height: 1.4;">${isSuspicious ? 'Regions of Interest Identified' : 'No Regions of Concern Observed'}</div>
            <div style="font-size: 10px; color: #4b5563; line-height: 1.6; margin-bottom: 12px;">${isSuspicious ? 'Shaded regions indicate areas where the analysis observed patterns that may be inconsistent with unaltered media. Warmer colors correspond to higher confidence of anomaly.' : 'Frame analysis did not observe regions exhibiting patterns suggestive of manipulation. The scanned area is outlined for reference.'}</div>
          </div>
          ${isSuspicious ? `<div style="margin-bottom: 12px;">
            <div style="font-size: 9px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px;">Intensity Scale</div>
            <div style="display: flex; gap: 6px;">
              <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 8px; height: 8px; border-radius: 2px; background: rgba(220,38,38,0.15); border: 1.5px solid #DC2626;"></div><span style="font-size: 9px; color: #DC2626; font-weight: 500;">High</span></div>
              <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 8px; height: 8px; border-radius: 2px; background: rgba(234,88,12,0.12); border: 1.5px solid #EA580C;"></div><span style="font-size: 9px; color: #EA580C; font-weight: 500;">Medium</span></div>
              <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 8px; height: 8px; border-radius: 2px; background: rgba(202,138,4,0.12); border: 1.5px solid #CA8A04;"></div><span style="font-size: 9px; color: #CA8A04; font-weight: 500;">Low</span></div>
            </div>
          </div>` : ''}
          <div style="font-size: 8px; color: #9ca3af; line-height: 1.5; border-top: 1px solid #e5e7eb; padding-top: 8px; font-style: italic;">This visualization is an analytical aid derived from statistical modeling. It does not represent raw sensor data and should not be treated as direct evidence of manipulation.</div>
        </div>
      </div>
    </div>

    <!-- 5. Key Findings + 6. Attribution -->
    <div style="display: flex; gap: 16px; margin-bottom: 20px;">
      <div style="flex: 3; padding: 16px 20px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="font-size: 11px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 10px;">Key Findings</div>
        <ul style="list-style: none; margin: 0; padding: 0;">
          ${keyFindings.slice(0, 5).map((f) => `<li style="font-size: 11px; color: #374151; padding: 4px 0; padding-left: 16px; position: relative; line-height: 1.6;"><span style="position: absolute; left: 0; top: 9px; width: 6px; height: 6px; border-radius: 50%; background: ${isSuspicious ? '#EF4444' : '#22C55E'}; display: inline-block;"></span>${f}</li>`).join('')}
        </ul>
      </div>
      <div style="flex: 2; padding: 16px 20px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="font-size: 11px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 10px;">Attribution</div>
        <div style="margin-bottom: 8px;">
          <div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Closest Structural Match</div>
          <div style="font-size: 15px; font-weight: 700; color: #1a1a1a;">${primaryMatch}</div>
          <div style="font-size: 10px; color: #6b7280;">${primaryType}</div>
        </div>
        ${pipeline.length > 1 ? `
        <div style="margin-top: 10px;">
          <div style="font-size: 10px; color: #6b7280; margin-bottom: 6px;">Observed Media Pipeline</div>
          <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
            ${pipeline.map((p, i) => `<span style="display: inline-block; padding: 2px 7px; border-radius: 3px; font-size: 9px; font-weight: 600; background: ${p.camera_type === 'AI Generator' ? '#FEE2E2' : p.camera_type === 'Encoder' ? '#FEF3C7' : '#DCFCE7'}; color: ${p.camera_type === 'AI Generator' ? '#B91C1C' : p.camera_type === 'Encoder' ? '#B45309' : '#15803D'};">${p.brand}</span>${i < pipeline.length - 1 ? '<span style="color: #9ca3af; font-size: 10px;">&#8250;</span>' : ''}`).join('')}
          </div>
        </div>` : ''}
        <div style="margin-top: 12px; padding: 8px 10px; background: white; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 9px; color: #9ca3af; line-height: 1.5; font-style: italic;">
          Attribution reflects structural signature comparison and should not be interpreted as a definitive determination of origin.
        </div>
      </div>
    </div>

    <!-- Disclaimer -->
    <div style="font-size: 9px; color: #9ca3af; line-height: 1.5; padding: 10px 0 0; border-top: 1px solid #f3f4f6;">
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
