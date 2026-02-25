// ── DeepfakeReport data model ─────────────────────────────────────

export type ErrorCode =
  | "DeepfakeDetected"
  | "MetadataProfessionalSoftware"
  | "MetadataAiGeneratorDetected"
  | "SuspiciousMetadata"

export interface TopScoreFrame {
  s3_url: string
  timestamp_seconds: number
  frame_index: number
  score: number
}

export interface HeatmapFrame {
  frame: TopScoreFrame
  heatmap_s3_url: string
}

export interface ParsedVideo {
  codec?: string
  resolution?: string
  frame_rate?: number
  bitrate?: string
  duration?: string
  sample_rate?: string
}

export interface ContainerInfo {
  format?: string
  encoder?: string
}

export interface ProvenanceInfo {
  camera_make?: string
  camera_model?: string
  software?: string
  creation_date?: string
  gps_location?: string
}

export interface VideoMetadata {
  raw_ffprobe_json?: object
  raw_exif_json?: object
  parsed_video?: ParsedVideo
  container?: ContainerInfo
  provenance?: ProvenanceInfo
}

export interface DeepfakeReport {
  report_id: string
  user_name: string
  submission_date: string
  engine_version: string
  errors: ErrorCode[]
  overall_score: number
  top_score_frames?: TopScoreFrame[]
  heatmap_frame?: HeatmapFrame
  video_metadata: VideoMetadata
}

// ── Verdict derivation ────────────────────────────────────────────
// Spec:
// errors empty → "AUTHENTIC" (green)
// errors contains only "SuspiciousMetadata" → "UNCERTAIN" (amber)
// errors contains "DeepfakeDetected" or "MetadataAiGeneratorDetected" → "SUSPICIOUS" (red)
// errors contains "MetadataProfessionalSoftware" (without deepfake) → "UNCERTAIN" (amber)

export type Verdict = "AUTHENTIC" | "UNCERTAIN" | "SUSPICIOUS"

export function deriveVerdict(errors: ErrorCode[]): Verdict {
  if (errors.length === 0) return "AUTHENTIC"
  if (errors.includes("DeepfakeDetected") || errors.includes("MetadataAiGeneratorDetected")) {
    return "SUSPICIOUS"
  }
  // Remaining: MetadataProfessionalSoftware and/or SuspiciousMetadata
  return "UNCERTAIN"
}

export function verdictColor(verdict: Verdict): string {
  switch (verdict) {
    case "SUSPICIOUS":
      return "#EF4444"
    case "UNCERTAIN":
      return "#F59E0B"
    case "AUTHENTIC":
      return "#10B981"
  }
}

export function verdictDarkColor(verdict: Verdict): string {
  switch (verdict) {
    case "SUSPICIOUS":
      return "#B91C1C"
    case "UNCERTAIN":
      return "#B45309"
    case "AUTHENTIC":
      return "#15803D"
  }
}

export function verdictBg(verdict: Verdict): string {
  switch (verdict) {
    case "SUSPICIOUS":
      return "#FEF2F2"
    case "UNCERTAIN":
      return "#FFFBEB"
    case "AUTHENTIC":
      return "#F0FDF4"
  }
}

export function verdictBadgeBg(verdict: Verdict): string {
  switch (verdict) {
    case "SUSPICIOUS":
      return "#FEE2E2"
    case "UNCERTAIN":
      return "#FEF3C7"
    case "AUTHENTIC":
      return "#DCFCE7"
  }
}

// ── Score color helpers ───────────────────────────────────────────
// 0-39 green, 40-69 amber, 70-100 red

export function scoreColor(score: number): string {
  if (score >= 0.7) return "#EF4444"
  if (score >= 0.4) return "#F59E0B"
  return "#10B981"
}

export function scoreDarkColor(score: number): string {
  if (score >= 0.7) return "#B91C1C"
  if (score >= 0.4) return "#B45309"
  return "#15803D"
}

// ── Formatting helpers ────────────────────────────────────────────

export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const whole = Math.floor(secs)
  const frac = Math.round((secs - whole) * 10)
  return `${String(mins).padStart(2, "0")}:${String(whole).padStart(2, "0")}.${frac}`
}

export function formatSubmissionDate(iso: string): string {
  const d = new Date(iso)
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ]
  const month = months[d.getUTCMonth()]
  const day = d.getUTCDate()
  const year = d.getUTCFullYear()
  const h = d.getUTCHours()
  const m = d.getUTCMinutes()
  const ampm = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 || 12
  return `${month} ${day}, ${year}, ${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`
}

// ── Mock datasets ─────────────────────────────────────────────────

export const mockSuspiciousReport: DeepfakeReport = {
  report_id: "#8F7A2B4C1D3E",
  user_name: "app_usr_12345",
  submission_date: "2025-02-10T09:32:00Z",
  engine_version: "v2.374",
  errors: ["DeepfakeDetected", "SuspiciousMetadata"],
  overall_score: 0.94,
  top_score_frames: [
    { s3_url: "", timestamp_seconds: 15.4, frame_index: 42, score: 0.974 },
    { s3_url: "", timestamp_seconds: 28.9, frame_index: 87, score: 0.94 },
    { s3_url: "", timestamp_seconds: 37.2, frame_index: 113, score: 0.88 },
  ],
  heatmap_frame: {
    frame: { s3_url: "", timestamp_seconds: 15.4, frame_index: 42, score: 0.974 },
    heatmap_s3_url: "",
  },
  video_metadata: {
    parsed_video: {
      codec: "AVC (avc1)",
      resolution: "768 x 1362 pixels",
      frame_rate: 24.0,
      bitrate: "1 720 kb/s",
      duration: "5 s 875 ms",
      sample_rate: "16.0 kHz",
    },
    container: {
      format: "MPEG-4 (Base Media)",
      encoder: "Lavf58.76.100",
    },
  },
}

export const mockAuthenticReport: DeepfakeReport = {
  report_id: "#A1B2C3D4E5F6",
  user_name: "app_usr_67890",
  submission_date: "2025-02-11T14:15:00Z",
  engine_version: "v2.374",
  errors: [],
  overall_score: 0.12,
  video_metadata: {
    parsed_video: {
      codec: "H.264 (avc1)",
      resolution: "1920 x 1080 pixels",
      frame_rate: 30.0,
      bitrate: "4 500 kb/s",
      duration: "12 s 340 ms",
      sample_rate: "44.1 kHz",
    },
    container: {
      format: "MPEG-4 (Base Media)",
      encoder: "Lavf59.27.100",
    },
    provenance: {
      camera_make: "Apple",
      camera_model: "iPhone 15 Pro",
      creation_date: "2025-02-11T14:10:00Z",
    },
  },
}

export const mockUncertainReport: DeepfakeReport = {
  report_id: "#C3D4E5F6A1B2",
  user_name: "app_usr_33333",
  submission_date: "2025-02-12T11:00:00Z",
  engine_version: "v2.374",
  errors: ["MetadataProfessionalSoftware"],
  overall_score: 0.28,
  video_metadata: {
    parsed_video: {
      codec: "H.265 (hevc)",
      resolution: "1920 x 1080 pixels",
      frame_rate: 60.0,
      bitrate: "8 200 kb/s",
      duration: "45 s 120 ms",
    },
    container: {
      format: "MPEG-4 (Base Media)",
      encoder: "Lavf60.3.100",
    },
    provenance: {
      software: "Adobe After Effects 2024",
    },
  },
}
