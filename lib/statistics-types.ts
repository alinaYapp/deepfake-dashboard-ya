export interface StatisticsResponse {
  total_checks: number
  total_checks_change_pct: number
  deepfakes_detected: number
  detection_rate_pct: number
  corrected_verdicts: number
  correction_rate_pct: number
  detection_trend: DetectionTrendPoint[]
  detection_by_type: DetectionByType
}

export interface DetectionTrendPoint {
  date: string
  count: number
  total_checks?: number
  deepfakes?: number
}

export interface DetectionByType {
  selfie_liveness: number
  document_id: number
  video: number
  audio: number
}
