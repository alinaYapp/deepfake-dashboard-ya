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

  // Analysis results for the table (still used on Page 2)
  const analysisResults = [
    {
      check: "Face Manipulation",
      result: details?.pixel_analysis?.find((p) => p.type === "face_manipulation")?.result === "suspicious" ? "suspicious" : "valid",
      confidence: details?.pixel_analysis?.find((p) => p.type === "face_manipulation")?.confidence || 0,
    },
    {
      check: "AI-Generated Content",
      result: details?.pixel_analysis?.find((p) => p.type === "ai_generated_content")?.result === "suspicious" ? "suspicious" : "valid",
      confidence: details?.pixel_analysis?.find((p) => p.type === "ai_generated_content")?.confidence || 0,
    },
    {
      check: "Eye Gaze Analysis",
      result: details?.pixel_analysis?.find((p) => p.type === "eye_gaze_manipulation")?.result === "suspicious" ? "suspicious" : "valid",
      confidence: details?.pixel_analysis?.find((p) => p.type === "eye_gaze_manipulation")?.confidence || 0,
    },
    {
      check: "Voice Analysis",
      result: details?.voice_analysis?.[0]?.result?.toLowerCase() === "suspicious" ? "suspicious" : "valid",
      confidence: details?.voice_analysis?.[0]?.confidence || 0,
    },
    {
      check: "Forensic Signatures",
      result: details?.forensic_analysis?.some((f) => f.severity === "critical") ? "critical" : "valid",
      confidence: details?.forensic_analysis?.some((f) => f.severity === "critical") ? 0.94 : 0,
    },
  ]

  // Key metrics for Page 1 (max 4, plain language)
  const totalFlags = criticalCount + suspectCount
  const faceResult = details?.pixel_analysis?.find((p: { type: string }) => p.type === "face_manipulation")
  const voiceResult = details?.voice_analysis?.[0]

  type Metric = { label: string; value: string; status: "alert" | "warn" | "ok" }
  const metrics: Metric[] = []
  if (faceResult) {
    metrics.push({
      label: "Face Analysis",
      value: faceResult.result === "suspicious" ? `${(faceResult.confidence * 100).toFixed(0)}% suspicious` : "No issues found",
      status: faceResult.result === "suspicious" ? "alert" : "ok",
    })
  }
  if (voiceResult) {
    const voiceSus = voiceResult.result?.toLowerCase() === "suspicious"
    metrics.push({
      label: "Voice Analysis",
      value: voiceSus ? `${(voiceResult.confidence * 100).toFixed(0)}% suspicious` : "No issues found",
      status: voiceSus ? "alert" : "ok",
    })
  }
  metrics.push(totalFlags > 0
    ? { label: "Forensic Flags", value: `${totalFlags} signature${totalFlags !== 1 ? "s" : ""} flagged`, status: criticalCount > 0 ? "alert" as const : "warn" as const }
    : { label: "Forensic Flags", value: "None identified", status: "ok" as const }
  )
  metrics.push({
    label: "Processing Pipeline",
    value: pipeline.length > 1 ? `${pipeline.length} stages detected` : pipeline.length === 1 ? `Single source: ${pipeline[0]?.brand}` : "Unknown",
    status: pipeline.length > 2 ? "warn" : "ok",
  })

  const metricColor = (s: string) => s === "alert" ? "#B91C1C" : s === "warn" ? "#B45309" : "#15803D"
  const metricBg = (s: string) => s === "alert" ? "#FEF2F2" : s === "warn" ? "#FFFBEB" : "#F0FDF4"
  const metricBorder = (s: string) => s === "alert" ? "#FECACA" : s === "warn" ? "#FDE68A" : "#BBF7D0"

  // Key findings (plain language, what not how)
  const keyFindings: string[] = []
  if (isSuspicious) {
    if (faceResult?.result === "suspicious") {
      keyFindings.push("Facial features show signs consistent with synthetic manipulation")
    }
    const eyeResult = details?.pixel_analysis?.find((p: { type: string }) => p.type === "eye_gaze_manipulation")
    if (eyeResult?.result === "suspicious") {
      keyFindings.push("Eye gaze patterns appear inconsistent with natural movement")
    }
    if (voiceResult?.result?.toLowerCase() === "suspicious") {
      keyFindings.push("Audio track contains patterns associated with voice synthesis")
    }
    if (criticalCount > 0) {
      keyFindings.push("File structure matches signatures of known AI generation tools")
    }
    if (pipeline.length > 2) {
      keyFindings.push("Media has passed through multiple processing stages")
    }
  } else {
    keyFindings.push("No indicators of facial manipulation were identified")
    if (voiceResult && voiceResult.result?.toLowerCase() !== "suspicious") {
      keyFindings.push("Voice patterns are consistent with natural speech")
    }
    keyFindings.push("File structure is consistent with authentic capture devices")
    if (pipeline.length <= 1) {
      keyFindings.push("Media appears to originate from a single source")
    }
  }

  // Voice analysis data
  const voiceData = details?.voice_analysis?.[0] || {
    speaker_id: "Speaker 1",
    result: isSuspicious ? "Suspicious" : "Valid",
    confidence: isSuspicious ? 0.948 : 0.05,
    language: "English",
    language_confidence: 0.99,
    gender: "Male",
    gender_confidence: 0.99,
    outlier_features: {
      jitter: { value: 2.68, min: 0, max: 25, is_outlier: false },
      shimmer: { value: 15.94, min: 2, max: 95, is_outlier: true },
      background_noise: { value: 0.73, min: -0.07, max: 1.0, is_outlier: true },
      temporal_patterns: { value: 0.26, min: -0.74, max: 1.0, is_outlier: true },
    },
  }

  // Forensic findings
  const forensicFindings = details?.forensic_analysis || [
    { severity: "critical", name: "Deepbrain AI, HeyGen, Runway, Synthesia", type: "AI Generator" },
    { severity: "suspect", name: "FFmpeg, Shutter Encoder", type: "Encoder" },
  ]

  return `<!DOCTYPE html>
<html>
<head>
  <title>DataSpike Report #${reportNumber}</title>
  <style>
    @page { margin: 0; size: A4; }
    @media print {
      .page { page-break-after: always; }
      .page:last-child { page-break-after: auto; }
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
    
    /* Confidence bar (used on Page 2) */
    .confidence-section {
      margin-top: 16px;
    }
    .confidence-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 6px;
    }
    .confidence-bar {
      height: 10px;
      background: #e5e7eb;
      border-radius: 5px;
      overflow: hidden;
    }
    .confidence-fill {
      height: 100%;
      background: ${isSuspicious ? "#DC2626" : "#16A34A"};
      border-radius: 5px;
    }
    
    /* Analysis Results Table */
    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .results-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .results-table th {
      background: #f8fafc;
      padding: 10px 14px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      color: #4b5563;
      border: 1px solid #e5e7eb;
    }
    .results-table td {
      padding: 10px 14px;
      border: 1px solid #e5e7eb;
      font-size: 11px;
    }
    .result-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
    .result-badge.suspicious { background: #FEE2E2; color: #DC2626; }
    .result-badge.valid { background: #DCFCE7; color: #16A34A; }
    .result-badge.critical { background: #FEE2E2; color: #DC2626; }
    .result-badge.suspect { background: #FEF3C7; color: #D97706; }
    
    /* Page 2: Detection Details */
    .detection-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .detection-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .detection-title {
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detection-type {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .detection-type strong {
      color: #1a1a1a;
    }
    .what-this-means {
      background: #f8fafc;
      border-radius: 6px;
      padding: 12px 14px;
      margin: 14px 0;
    }
    .what-this-means-title {
      font-size: 10px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 6px;
    }
    .what-this-means-text {
      font-size: 11px;
      color: #4b5563;
      line-height: 1.6;
    }
    .image-placeholders {
      display: flex;
      gap: 16px;
      margin-top: 14px;
    }
    .image-placeholder {
      flex: 1;
    }
    .placeholder-box {
      width: 100%;
      height: 120px;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 11px;
    }
    .placeholder-caption {
      font-size: 10px;
      color: #6b7280;
      text-align: center;
      margin-top: 6px;
    }
    
    /* Page 3: Voice Analysis */
    .speaker-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .speaker-table th, .speaker-table td {
      padding: 10px 12px;
      border: 1px solid #e5e7eb;
      font-size: 11px;
    }
    .speaker-table th {
      background: #f8fafc;
      font-weight: 600;
      color: #4b5563;
    }
    
    /* Audio Feature Gauges */
    .gauge-container {
      margin-bottom: 20px;
      padding: 14px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .gauge-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    .gauge-label {
      font-size: 12px;
      font-weight: 600;
      color: #1a1a1a;
    }
    .gauge-desc {
      font-size: 10px;
      color: #6b7280;
      margin-top: 2px;
    }
    .gauge-value {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .gauge-bar {
      position: relative;
      height: 24px;
      background: #e5e7eb;
      border-radius: 4px;
      margin: 8px 0;
    }
    .gauge-range {
      position: absolute;
      top: 4px;
      height: 16px;
      background: #DBEAFE;
      border: 1px solid #93C5FD;
      border-radius: 3px;
    }
    .gauge-marker {
      position: absolute;
      top: 2px;
      width: 6px;
      height: 20px;
      background: #4A7BF7;
      border-radius: 3px;
      transform: translateX(-50%);
    }
    .gauge-marker.warning {
      background: #DC2626;
    }
    .gauge-labels {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #9ca3af;
    }
    .gauge-interpretation {
      font-size: 10px;
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .gauge-interpretation.normal {
      color: #16A34A;
    }
    .gauge-interpretation.anomaly {
      color: #F59E0B;
    }
    
    /* Page 4: Forensic Analysis */
    .origin-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .origin-table th, .origin-table td {
      padding: 12px 14px;
      border: 1px solid #e5e7eb;
      font-size: 11px;
    }
    .origin-table th {
      background: #f8fafc;
      font-weight: 600;
      width: 120px;
    }
    
    /* Pipeline Visualization */
    .pipeline-section {
      margin-top: 24px;
    }
    .pipeline-title {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 16px;
    }
    .pipeline-flow {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .pipeline-card {
      flex: 1;
      max-width: 180px;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 14px;
      text-align: center;
    }
    .pipeline-gen {
      font-size: 10px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 6px;
    }
    .pipeline-brand {
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    .pipeline-model {
      font-size: 10px;
      color: #4b5563;
      margin-bottom: 2px;
    }
    .pipeline-type {
      font-size: 9px;
      color: #9ca3af;
    }
    .pipeline-arrow {
      font-size: 18px;
      color: #9ca3af;
    }
    
    .interpretation-box {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-top: 20px;
    }
    .interpretation-text {
      font-size: 11px;
      color: #4b5563;
      line-height: 1.7;
    }
    
    /* Page 5: Technical Appendix */
    .tech-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .tech-table th {
      background: #f8fafc;
      padding: 10px 14px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      color: #4b5563;
      border: 1px solid #e5e7eb;
      width: 180px;
    }
    .tech-table td {
      padding: 10px 14px;
      border: 1px solid #e5e7eb;
      font-size: 11px;
      font-family: monospace;
    }
    
    /* Page 6: Legal */
    .legal-section {
      margin-bottom: 20px;
    }
    .legal-title {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .legal-subtitle {
      font-size: 11px;
      font-weight: 600;
      color: #374151;
      margin: 14px 0 8px 0;
    }
    .legal-text {
      font-size: 10px;
      color: #4b5563;
      line-height: 1.7;
      text-align: justify;
    }
    
    /* Glossary */
    .glossary-table {
      width: 100%;
      border-collapse: collapse;
    }
    .glossary-table td {
      padding: 6px 10px;
      border: 1px solid #e5e7eb;
      font-size: 9px;
      vertical-align: top;
    }
    .glossary-table td:first-child {
      font-weight: 600;
      width: 130px;
      background: #fafafa;
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
  <!-- Page 1: Executive Summary -->
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
            ${isSuspicious ? 'Potential Manipulation Detected' : isUncertain ? 'Inconclusive Analysis Results' : 'No Manipulation Detected'}
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

    <!-- 4. Suspicious Frame Highlight -->
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="padding: 10px 16px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; font-size: 11px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.3px;">
        Analyzed Frame &mdash; Heat Map Overlay
      </div>
      <div style="height: 160px; background: #f9fafb; display: flex; align-items: center; justify-content: center; gap: 32px;">
        <div style="text-align: center;">
          <div style="width: 100px; height: 120px; background: #f3f4f6; border: 1px dashed #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
          <div style="font-size: 9px; color: #9ca3af; margin-top: 6px;">Original Frame</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 100px; height: 120px; background: ${isSuspicious ? 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.15) 100%)' : '#f3f4f6'}; border: 1px dashed ${isSuspicious ? '#fca5a5' : '#d1d5db'}; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${isSuspicious ? '#ef4444' : '#9ca3af'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </div>
          <div style="font-size: 9px; color: ${isSuspicious ? '#B91C1C' : '#9ca3af'}; margin-top: 6px;">Heat Map Overlay</div>
        </div>
        <div style="max-width: 260px; font-size: 10px; color: #6b7280; line-height: 1.6;">
          ${isSuspicious
            ? 'Highlighted regions indicate areas where the analysis detected anomalies consistent with synthetic generation or manipulation. Red intensity corresponds to confidence level.'
            : 'No significant anomalies were detected. The frame analysis did not identify regions of concern.'}
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
          <div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Primary Match</div>
          <div style="font-size: 15px; font-weight: 700; color: #1a1a1a;">${primaryMatch}</div>
          <div style="font-size: 10px; color: #6b7280;">${primaryType}</div>
        </div>
        ${pipeline.length > 1 ? `
        <div style="margin-top: 10px;">
          <div style="font-size: 10px; color: #6b7280; margin-bottom: 6px;">Media Pipeline</div>
          <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
            ${pipeline.map((p, i) => `<span style="display: inline-block; padding: 2px 7px; border-radius: 3px; font-size: 9px; font-weight: 600; background: ${p.camera_type === 'AI Generator' ? '#FEE2E2' : p.camera_type === 'Encoder' ? '#FEF3C7' : '#DCFCE7'}; color: ${p.camera_type === 'AI Generator' ? '#B91C1C' : p.camera_type === 'Encoder' ? '#B45309' : '#15803D'};">${p.brand}</span>${i < pipeline.length - 1 ? '<span style="color: #9ca3af; font-size: 10px;">&#8250;</span>' : ''}`).join('')}
          </div>
        </div>` : ''}
        <div style="margin-top: 12px; padding: 8px 10px; background: white; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 9px; color: #9ca3af; line-height: 1.5; font-style: italic;">
          Attribution is based on structural signature matching and does not constitute a definitive identification of origin.
        </div>
      </div>
    </div>

    <!-- Disclaimer -->
    <div style="font-size: 9px; color: #9ca3af; line-height: 1.5; padding: 10px 0 0; border-top: 1px solid #f3f4f6;">
      This report was generated automatically by DataSpike v${details?.project_info?.verify_version || '2.374'}.
      Results should be interpreted alongside additional investigative context. This document does not constitute legal advice.
    </div>

    <div class="page-footer">
      <span>DataSpike Deepfake Detection Report</span>
      <span style="letter-spacing: 1px; font-weight: 600;">CONFIDENTIAL</span>
      <span>Page 1 of 6</span>
    </div>
  </div>
  
  <!-- Page 2: Detection Details -->
  <div class="page">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">DS</div>
        <div class="logo-text">DataSpike</div>
      </div>
      <div class="header-right">
        <div class="report-id">#${reportNumber}</div>
        <div>${reportDate}</div>
      </div>
    </div>
    
    <div class="detection-card">
      <div class="detection-header">
        <div class="detection-title">Face Manipulation</div>
        <span class="result-badge ${analysisResults[0].result}">${analysisResults[0].result === "suspicious" ? "Suspicious" : "Valid"}</span>
      </div>
      <div class="detection-type">Detected type: <strong>${isSuspicious ? "face_swap" : "none"}</strong></div>
      <div class="confidence-section" style="margin-top: 12px;">
        <div class="confidence-label">Confidence: ${(analysisResults[0].confidence * 100).toFixed(1)}%</div>
        <div class="confidence-bar" style="height: 8px; margin-top: 6px;">
          <div class="confidence-fill" style="width: ${analysisResults[0].confidence * 100}%; background: ${analysisResults[0].result === "suspicious" ? "#DC2626" : "#16A34A"};"></div>
        </div>
      </div>
      <div class="what-this-means">
        <div class="what-this-means-title">What this means:</div>
        <div class="what-this-means-text">
          ${
            analysisResults[0].result === "suspicious"
              ? "The analysis detected visual artifacts consistent with face swapping or facial reenactment techniques. The model identified inconsistencies in facial boundaries, skin texture, and lighting that are characteristic of synthetic manipulation."
              : "No significant indicators of face manipulation were detected. The facial features, boundaries, and lighting appear consistent with authentic video capture."
          }
        </div>
      </div>
      <div class="image-placeholders">
        <div class="image-placeholder">
          <div class="placeholder-box">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
              </svg>
              <span style="font-size: 9px; text-align: center;">Frame capture from<br/>source video</span>
            </div>
          </div>
          <div class="placeholder-caption">Source frame from video</div>
        </div>
        <div class="image-placeholder">
          <div class="placeholder-box">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
              </svg>
              <span style="font-size: 9px; text-align: center;">Heatmap visualization<br/>available in web dashboard</span>
            </div>
          </div>
          <div class="placeholder-caption">Areas of detected manipulation</div>
        </div>
      </div>
    </div>
    
    <div class="detection-card">
      <div class="detection-header">
        <div class="detection-title">Eye Gaze Manipulation</div>
        <span class="result-badge ${analysisResults[2].result}">${analysisResults[2].result === "suspicious" ? "Suspicious" : "Valid"}</span>
      </div>
      <div class="detection-type">Analysis type: <strong>gaze_direction_consistency</strong></div>
      <div class="confidence-section" style="margin-top: 12px;">
        <div class="confidence-label">Confidence: ${(analysisResults[2].confidence * 100).toFixed(1)}%</div>
        <div class="confidence-bar" style="height: 8px; margin-top: 6px;">
          <div class="confidence-fill" style="width: ${analysisResults[2].confidence * 100}%; background: ${analysisResults[2].result === "suspicious" ? "#DC2626" : "#16A34A"};"></div>
        </div>
      </div>
      <div class="what-this-means">
        <div class="what-this-means-title">What this means:</div>
        <div class="what-this-means-text">
          ${
            analysisResults[2].result === "suspicious"
              ? "Eye gaze patterns show inconsistencies that may indicate manipulation. The direction and movement of the eyes do not align naturally with head position and facial orientation."
              : "Eye gaze patterns appear natural and consistent with authentic video. No manipulation indicators detected in eye movement or direction."
          }
        </div>
      </div>
      <div class="image-placeholders">
        <div class="image-placeholder">
          <div class="placeholder-box">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span style="font-size: 9px; text-align: center;">Eye region capture<br/>from source video</span>
            </div>
          </div>
          <div class="placeholder-caption">Eye region analysis</div>
        </div>
        <div class="image-placeholder">
          <div class="placeholder-box">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
              </svg>
              <span style="font-size: 9px; text-align: center;">Gaze heatmap available<br/>in web dashboard</span>
            </div>
          </div>
          <div class="placeholder-caption">Gaze inconsistency areas</div>
        </div>
      </div>
    </div>
    
    <div class="page-footer">
      <span>DataSpike Deepfake Detection Report</span>
      <span>Page 2 of 6</span>
    </div>
  </div>
  
  <!-- Page 3: Voice Analysis -->
  <div class="page">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">DS</div>
        <div class="logo-text">DataSpike</div>
      </div>
      <div class="header-right">
        <div class="report-id">#${reportNumber}</div>
        <div>${reportDate}</div>
      </div>
    </div>
    
    <div class="section-title">Voice Analysis</div>
    <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
      <span class="result-badge ${voiceData.result.toLowerCase() === "suspicious" ? "suspicious" : "valid"}">${voiceData.result}</span>
    </div>
    
    <table class="speaker-table">
      <thead>
        <tr>
          <th>Speaker</th>
          <th>Result</th>
          <th>Language</th>
          <th>Gender</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${voiceData.speaker_id}</strong></td>
          <td><span class="result-badge ${voiceData.result.toLowerCase() === "suspicious" ? "suspicious" : "valid"}">${voiceData.result} ${(voiceData.confidence * 100).toFixed(1)}%</span></td>
          <td>${voiceData.language} (${(voiceData.language_confidence * 100).toFixed(0)}%)</td>
          <td>${voiceData.gender} (${(voiceData.gender_confidence * 100).toFixed(0)}%)</td>
        </tr>
      </tbody>
    </table>
    
    <div class="what-this-means" style="margin-bottom: 20px;">
      <div class="what-this-means-title">What this means:</div>
      <div class="what-this-means-text">
        This analysis highlights potential indications of AI-generated or manipulated audio. The following features extracted from the input audio are compared to the distribution of natural human speech based on a collection of samples of ${voiceData.gender} speech in ${voiceData.language.split(" ")[0]} language. Each box plot represents the 10 and 90 quantiles of the natural distribution.
      </div>
    </div>
    
    <div class="section-title">Outlier Audio Features</div>
    
    <!-- Jitter Gauge -->
    <div class="gauge-container">
      <div class="gauge-header">
        <div>
          <div class="gauge-label">Jitter</div>
          <div class="gauge-desc">Variation in frequency between consecutive vocal cycles</div>
        </div>
        <div class="gauge-value">${voiceData.outlier_features.jitter.value.toFixed(2)}%</div>
      </div>
      <div class="gauge-bar">
        <div class="gauge-range" style="left: 20%; width: 40%;"></div>
        <div class="gauge-marker" style="left: ${Math.min(Math.max((voiceData.outlier_features.jitter.value / 25) * 100, 5), 95)}%;"></div>
      </div>
      <div class="gauge-labels">
        <span>0%</span>
        <span>25%</span>
      </div>
      <div class="gauge-interpretation normal" style="color: #16A34A;">
        → Within normal range ✓
      </div>
    </div>
    
    <!-- Shimmer Gauge -->
    <div class="gauge-container">
      <div class="gauge-header">
        <div>
          <div class="gauge-label">Shimmer</div>
          <div class="gauge-desc">Small variations in loudness across vocal cycles</div>
        </div>
        <div class="gauge-value">${voiceData.outlier_features.shimmer.value.toFixed(2)}%</div>
      </div>
      <div class="gauge-bar">
        <div class="gauge-range" style="left: 10%; width: 50%;"></div>
        <div class="gauge-marker warning" style="left: ${Math.min(Math.max((voiceData.outlier_features.shimmer.value / 95) * 100, 5), 95)}%;"></div>
      </div>
      <div class="gauge-labels">
        <span>2%</span>
        <span>95%</span>
      </div>
      <div class="gauge-interpretation anomaly" style="color: #F59E0B;">
        → ANOMALY: Below expected variation ⚠
      </div>
    </div>
    
    <!-- Background Noise Gauge -->
    <div class="gauge-container">
      <div class="gauge-header">
        <div>
          <div class="gauge-label">Background Noise</div>
          <div class="gauge-desc">Ambient, unintended sound present in a recording</div>
        </div>
        <div class="gauge-value">${voiceData.outlier_features.background_noise.value.toFixed(2)}</div>
      </div>
      <div class="gauge-bar">
        <div class="gauge-range" style="left: 15%; width: 45%;"></div>
        <div class="gauge-marker warning" style="left: ${Math.min(Math.max(((voiceData.outlier_features.background_noise.value + 0.07) / 1.07) * 100, 5), 95)}%;"></div>
      </div>
      <div class="gauge-labels">
        <span>-0.07</span>
        <span>1.00</span>
      </div>
      <div class="gauge-interpretation anomaly" style="color: #F59E0B;">
        → ANOMALY: Elevated noise level ⚠
      </div>
    </div>
    
    <!-- Temporal Patterns Gauge -->
    <div class="gauge-container">
      <div class="gauge-header">
        <div>
          <div class="gauge-label">Temporal Patterns</div>
          <div class="gauge-desc">Timing, rhythm, and flow of speech</div>
        </div>
        <div class="gauge-value">${voiceData.outlier_features.temporal_patterns.value.toFixed(2)}</div>
      </div>
      <div class="gauge-bar">
        <div class="gauge-range" style="left: 20%; width: 40%;"></div>
        <div class="gauge-marker warning" style="left: ${Math.min(Math.max(((voiceData.outlier_features.temporal_patterns.value + 0.74) / 1.74) * 100, 5), 95)}%;"></div>
      </div>
      <div class="gauge-labels">
        <span>-0.74</span>
        <span>1.00</span>
      </div>
      <div class="gauge-interpretation anomaly" style="color: #F59E0B;">
        → ANOMALY: Irregular speech rhythm ⚠
      </div>
    </div>
    
    <div class="page-footer">
      <span>DataSpike Deepfake Detection Report</span>
      <span>Page 3 of 6</span>
    </div>
  </div>
  
  <!-- Page 4: Forensic Analysis -->
  <div class="page">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">DS</div>
        <div class="logo-text">DataSpike</div>
      </div>
      <div class="header-right">
        <div class="report-id">#${reportNumber}</div>
        <div>${reportDate}</div>
      </div>
    </div>
    
    <div class="section-title">Forensic Analysis</div>
    
    <div class="legal-subtitle">File Origin</div>
    <table class="origin-table">
      <thead>
        <tr>
          <th>Severity</th>
          <th>Finding</th>
          <th style="width: 80px;">Confidence</th>
        </tr>
      </thead>
      <tbody>
        ${forensicFindings
          .slice(0, 4)
          .map(
            (f, idx) => `
        <tr>
          <td><span class="result-badge ${f.severity}">${f.severity.charAt(0).toUpperCase() + f.severity.slice(1)}</span></td>
          <td>Signature matches ${f.type}: <strong>${f.name}</strong></td>
          <td style="font-weight: 600; color: ${f.severity === "critical" ? "#DC2626" : "#D97706"};">${f.severity === "critical" ? "94%" : "78%"}</td>
        </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    
    <div class="pipeline-section">
      <div class="pipeline-title">Processing Pipeline Visualization</div>
      <div class="pipeline-flow">
        ${pipeline
          .slice(0, 3)
          .map(
            (p, i) => `
          <div class="pipeline-card">
            <div class="pipeline-gen">Generation ${p.generation}</div>
            <div class="pipeline-brand">${p.brand}</div>
            <div class="pipeline-model">${p.model}</div>
            <div class="pipeline-type">${p.camera_type}</div>
          </div>
          ${i < Math.min(pipeline.length, 3) - 1 ? '<div class="pipeline-arrow">→</div>' : ""}
        `
          )
          .join("")}
      </div>
    </div>
    
    <div class="interpretation-box">
      <div class="interpretation-text">
        <strong>Interpretation:</strong> Structural analysis of this file indicates that the content has gone through multiple processing stages. The file shows signatures consistent with AI-based generation tools, followed by re-encoding with common video processing software. This processing chain is characteristic of synthetic media that has been prepared for distribution. The presence of Libavformat signatures suggests the file was re-wrapped, which can obscure original source indicators.
      </div>
    </div>
    
    <div class="page-footer">
      <span>DataSpike Deepfake Detection Report</span>
      <span>Page 4 of 6</span>
    </div>
  </div>
  
  <!-- Page 5: Technical Appendix -->
  <div class="page">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">DS</div>
        <div class="logo-text">DataSpike</div>
      </div>
      <div class="header-right">
        <div class="report-id">#${reportNumber}</div>
        <div>${reportDate}</div>
      </div>
    </div>
    
    <div class="section-title">Technical Appendix</div>
    
    <div class="legal-subtitle">File Details</div>
    <table class="tech-table">
      <tr>
        <th>Filename</th>
        <td>${details?.file_summary?.filename || "media_" + reportNumber + ".mp4"}</td>
      </tr>
      <tr>
        <th>Format</th>
        <td>${details?.file_summary?.format || caseData.content_type}</td>
      </tr>
      <tr>
        <th>File ID</th>
        <td>${details?.file_summary?.file_id || caseData.id}</td>
      </tr>
      <tr>
        <th>Date Processed</th>
        <td>${formatDate(details?.file_summary?.date_processed || caseData.created_at)}</td>
      </tr>
      <tr>
        <th>Checksum (SHA-256)</th>
        <td style="font-size: 8px; word-break: break-all;">${details?.file_summary?.file_checksum_sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}</td>
      </tr>
    </table>
    
    <div class="legal-subtitle">Video Specifications</div>
    <table class="tech-table">
      <tr>
        <th>Codec</th>
        <td>${details?.decoded_metadata?.video?.format || "H.264"}</td>
      </tr>
      <tr>
        <th>Resolution</th>
        <td>${details?.decoded_metadata?.video?.width || "768"} × ${details?.decoded_metadata?.video?.height || "1362"}</td>
      </tr>
      <tr>
        <th>Duration</th>
        <td>${details?.decoded_metadata?.video?.duration || "00:05"}</td>
      </tr>
      <tr>
        <th>Bitrate</th>
        <td>${details?.decoded_metadata?.video?.bit_rate || "2.5 Mb/s"}</td>
      </tr>
      <tr>
        <th>Frame Rate</th>
        <td>${details?.decoded_metadata?.video?.frame_rate || "30 fps"}</td>
      </tr>
    </table>
    
    ${
      details?.decoded_metadata?.audio
        ? `
    <div class="legal-subtitle">Audio Specifications</div>
    <table class="tech-table">
      <tr>
        <th>Codec</th>
        <td>${details.decoded_metadata.audio.format}</td>
      </tr>
      <tr>
        <th>Channels</th>
        <td>${details.decoded_metadata.audio.channels}</td>
      </tr>
      <tr>
        <th>Sample Rate</th>
        <td>${details.decoded_metadata.audio.sampling_rate}</td>
      </tr>
      <tr>
        <th>Bitrate</th>
        <td>${details.decoded_metadata.audio.bit_rate}</td>
      </tr>
    </table>
    `
        : ""
    }
    
    <div class="page-footer">
      <span>DataSpike Deepfake Detection Report</span>
      <span>Page 5 of 6</span>
    </div>
  </div>
  
  <!-- Page 6: Compliance & Legal -->
  <div class="page">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">DS</div>
        <div class="logo-text">DataSpike</div>
      </div>
      <div class="header-right">
        <div class="report-id">#${reportNumber}</div>
        <div>${reportDate}</div>
      </div>
    </div>
    
    <div class="legal-section">
      <div class="legal-title">Scope and Conditions</div>
      <p class="legal-text">
        This document has been automatically generated to provide a technical assessment of submitted media. The report aims to identify signs of synthetic media manipulation or other digital alterations in support of threat intelligence, evidentiary documentation, or expert review.
      </p>
      <p class="legal-text" style="margin-top: 8px;">
        The accuracy and reliability of this report are dependent on the integrity of the submitted media. We assume that the file was provided in its original state and has not been altered prior to submission.
      </p>
    </div>
    
    <div class="legal-section">
      <div class="legal-title">Legal Declarations</div>
      
      <div class="legal-subtitle">GDPR Compliance</div>
      <p class="legal-text">
        All processing of personal data within our systems complies with the requirements of the General Data Protection Regulation (EU) 2016/679.
      </p>
      
      <div class="legal-subtitle">Statement of Impartiality</div>
      <p class="legal-text">
        This report has been generated using automated tools and standardized procedures without bias or influence.
      </p>
      
      <div class="legal-subtitle">Statement of Integrity</div>
      <p class="legal-text">
        No modifications have been made to the original media during analysis. Cryptographic hash values have been computed to support data integrity verification.
      </p>
      
      <div class="legal-subtitle">Statement of Limitations</div>
      <p class="legal-text">
        This report is generated by automated analysis and is intended to support, not replace, expert forensic evaluation.
      </p>
    </div>
    
    <div class="legal-section">
      <div class="legal-title">Glossary</div>
      <table class="glossary-table">
        <tr>
          <td>Deepfake</td>
          <td>AI-generated synthetic media that manipulates or replaces a person's likeness</td>
        </tr>
        <tr>
          <td>Confidence Score</td>
          <td>Numerical value indicating the system's certainty in its detection outcome</td>
        </tr>
        <tr>
          <td>Face Manipulation</td>
          <td>Alteration of facial features using AI techniques such as face swapping</td>
        </tr>
        <tr>
          <td>AI-Generated</td>
          <td>Content produced using artificial intelligence models</td>
        </tr>
        <tr>
          <td>Heatmap</td>
          <td>Visual representation highlighting areas of detected manipulation</td>
        </tr>
        <tr>
          <td>Jitter</td>
          <td>Variations in voice frequency that may indicate synthetic speech</td>
        </tr>
        <tr>
          <td>Shimmer</td>
          <td>Variations in voice amplitude that synthetic voices often exhibit abnormally</td>
        </tr>
        <tr>
          <td>C2PA</td>
          <td>Coalition for Content Provenance and Authenticity standard</td>
        </tr>
      </table>
    </div>
    
    <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; font-size: 9px; color: #6b7280;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <div style="width: 18px; height: 18px; background: #4A7BF7; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px; font-weight: bold;">DS</div>
        <span style="font-weight: 600; color: #4A7BF7;">DataSpike</span>
      </div>
      <p>Contact: support@dataspike.io</p>
      <p style="margin-top: 4px;">Copyright © ${new Date().getFullYear()} DataSpike. All rights reserved.</p>
    </div>
    
    <div class="page-footer">
      <span>DataSpike Deepfake Detection Report</span>
      <span>Page 6 of 6</span>
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
