export interface KPIData {
  totalChecks: number
  deepfakeCount: number
  deepfakeRate: number
  falsePositiveRate: number
  avgResponseTime: number
}

export interface TrendDataPoint {
  date: string
  deepfakes: number
  total: number
}

export interface DistributionData {
  selfie_liveness: number
  document_id: number
  video: number
}

export interface ProjectInfo {
  case_id: string
  examiner_name: string
  project_id: string
  date_processed: string
  verify_version: string
  reference_library_version: string
}

export interface FileSummary {
  filename: string
  format: string
  file_id: string
  date_processed: string
  date_last_updated: string
  file_checksum_sha256: string
  verify_file_signature: string
}

export interface StructuralAnalysis {
  structure_signature: string
  match_type: string
  signature_id: string
  signature_hash: string
  signature_category: string
}

export interface DeviceGeneration {
  generation: number
  brand: string
  model: string
  camera_type: string
  processing_steps: string[]
}

export interface FileSignatureStructure {
  atom: string
  percentage: number
}

export interface AttributeSimilarityAnalysis {
  brand: string | null
  last_generation: string
  model: string | null
}

export interface ForensicAnalysisMatch {
  severity: "critical" | "suspect" | "benign"
  name: string
  type: string
  found_in: string
}

export interface DecodedMetadata {
  general: {
    complete_name: string
    format: string
    format_profile: string
    codec_id: string
    file_size: string
    duration: string
    overall_bit_rate: string
    writing_application: string
  }
  video: {
    id: number
    format: string
    format_info: string
    format_profile: string
    format_settings: string
    format_settings_cabac: string
    format_settings_ref_frames: string
    codec_id: string
    codec_id_info: string
    duration: string
    bit_rate: string
    width: string
    height: string
    display_aspect_ratio: string
    frame_rate_mode: string
    frame_rate: string
    color_space: string
    chroma_subsampling: string
    bit_depth: string
    scan_type: string
    bits_per_pixel_frame: string
    stream_size: string
    writing_library: string
    encoding_settings: string
  }
  audio?: {
    id: number
    format: string
    format_info: string
    codec_id: string
    duration: string
    bit_rate_mode: string
    bit_rate: string
    channels: string
    channel_layout: string
    sampling_rate: string
    frame_rate: string
    compression_mode: string
    stream_size: string
  }
}

export interface VoiceAnalysisResult {
  speaker_id: string
  result: string
  confidence: number
  language: string
  language_confidence: number
  gender: string
  gender_confidence: number
  outlier_features: {
    jitter: { value: number; min: number; max: number }
    shimmer: { value: number; min: number; max: number }
    background_noise: { value: number; min: number; max: number }
    temporal_patterns: { value: number; min: number; max: number }
  }
}

export interface PixelAnalysisResult {
  type: "face_manipulation" | "ai_generated_content" | "eye_gaze_manipulation"
  result: "suspicious" | "valid"
  confidence: number
  manipulation_type?: string
  description: string
}

export interface CaseDetails {
  overall_verdict: "real" | "fake" | "uncertain"
  confidence_score: number
  processing_time_ms: number

  // Sensity-style project info
  project_info: ProjectInfo
  file_summary: FileSummary

  // Structural analysis
  structural_analysis: StructuralAnalysis
  device_generation_history: DeviceGeneration[]
  file_signature_structure: FileSignatureStructure[]
  attribute_similarity_analysis: AttributeSimilarityAnalysis

  // Analysis results
  pixel_analysis: PixelAnalysisResult[]
  voice_analysis?: VoiceAnalysisResult[]
  forensic_analysis: ForensicAnalysisMatch[]

  // Consistency checks
  structural_consistency: {
    modification_tests: "passed" | "failed"
    validation_tests: "passed" | "failed"
  }

  // Decoded metadata
  decoded_metadata: DecodedMetadata

  // C2PA and provenance
  c2pa_manifests: boolean
  proprietary_structural_data: { description: string; size: number; start: number; end: number }[]
  unknown_structural_data: boolean

  // Legacy checks (kept for backward compatibility)
  checks: {
    face_swap: { detected: boolean; confidence: number }
    lip_sync: { detected: boolean; confidence: number }
    audio_visual_mismatch: { detected: boolean; confidence: number }
    injection_attack: { detected: boolean; confidence: number }
    replay_attack: { detected: boolean; confidence: number }
  }
  metadata: {
    file_hash: string
    resolution: string
    duration_seconds: number
    codec: string
  }
}

export interface Case {
  id: string
  status: "completed" | "pending" | "failed"
  job_type: "selfie_liveness" | "document_id" | "video"
  content_type: string
  file_size_bytes: number
  score: number
  verdict: "real" | "fake" | "uncertain"
  verdict_edited?: boolean
  verdict_reason?: string
  sandbox: boolean
  applicant_id: string
  created_at: string
  thumbnail_url: string
  details?: CaseDetails
}

export interface StreamingEvent {
  type: "deepfake_alert" | "liveness_check" | "injection_detected" | "session_start" | "session_end"
  level: "info" | "warning" | "error"
  participant_id: string
  track_id: string
  message: string
  timestamp_ms: number
  details?: {
    confidence?: number
    check_type?: string
  }
}

export const mockKPIs: KPIData = {
  totalChecks: 124853,
  deepfakeCount: 1247,
  deepfakeRate: 0.99,
  falsePositiveRate: 0.12,
  avgResponseTime: 234,
}

export const mockTrends: TrendDataPoint[] = [
  { date: "2025-03-01", deepfakes: 40, total: 3800 },
  { date: "2025-04-01", deepfakes: 48, total: 4100 },
  { date: "2025-05-01", deepfakes: 55, total: 4600 },
  { date: "2025-06-01", deepfakes: 62, total: 5000 },
  { date: "2025-07-01", deepfakes: 71, total: 5300 },
  { date: "2025-08-01", deepfakes: 78, total: 5700 },
  { date: "2025-09-01", deepfakes: 85, total: 6100 },
  { date: "2025-10-01", deepfakes: 95, total: 6500 },
  { date: "2025-11-01", deepfakes: 108, total: 7000 },
  { date: "2025-12-01", deepfakes: 120, total: 7600 },
  { date: "2026-01-01", deepfakes: 134, total: 8100 },
  { date: "2026-02-01", deepfakes: 142, total: 8500 },
]

export const mockDistribution: DistributionData = {
  selfie_liveness: 45,
  document_id: 28,
  video: 18,
}

export const mockCases: Case[] = [
  {
    id: "chk_8f7a2b4c1d3e",
    status: "completed",
    job_type: "selfie_liveness",
    content_type: "video/mp4",
    file_size_bytes: 2457600,
    score: 0.94,
    verdict: "fake",
    sandbox: false,
    applicant_id: "app_usr_12345",
    created_at: "2026-02-10T14:32:00Z",
    thumbnail_url: "/thumbnails/selfie-1.jpg",
    details: {
      overall_verdict: "fake",
      confidence_score: 0.94,
      processing_time_ms: 1247,

      project_info: {
        case_id: "443b8c20-8d7d-4b7c-945f-f36bfb9d7de0",
        examiner_name: "582d2b9f-eb6d-43ad-b481-73cb5aab4e6b",
        project_id: "59229",
        date_processed: "2024-03-18T14:32:00Z",
        verify_version: "2.374",
        reference_library_version: "2.2.187",
      },

      file_summary: {
        filename: "367c118f-89aa-4a26-959e-fc29dd0bb098.mp4",
        format: "MPEG-4 Media File",
        file_id: "161515",
        date_processed: "2024-03-18T14:32:00Z",
        date_last_updated: "2024-03-18T14:33:13Z",
        file_checksum_sha256: "6D82354B4AEA838EB5F8BD5654B447F18ED624F0D584303AAABBF2456FE4855F",
        verify_file_signature: "rl.1047",
      },

      structural_analysis: {
        structure_signature: "Full Signature Match",
        match_type: "rl.1047",
        signature_id: "-1640103650",
        signature_hash: "Uncategorized",
        signature_category: "AI Generator",
      },

      device_generation_history: [
        {
          generation: 1,
          brand: "Apple",
          model: "iPhone 11",
          camera_type: "Device Camera",
          processing_steps: ["Front Camera", "GPS On", "Rear Camera", "Time-Lapse"],
        },
        {
          generation: 2,
          brand: "FFmpeg",
          model: "Re-wrap",
          camera_type: "Encoder",
          processing_steps: ["Save", "Save As New", "Trim"],
        },
        {
          generation: 3,
          brand: "Haiper AI",
          model: "Image To Video",
          camera_type: "AI Generator",
          processing_steps: ["In-app File Creation"],
        },
      ],

      file_signature_structure: [
        { atom: "ftyp", percentage: 100.0 },
        { atom: "free", percentage: 29.45 },
        { atom: "mdat", percentage: 30.07 },
        { atom: "moov", percentage: 30.09 },
        { atom: "mvhd", percentage: 30.09 },
        { atom: "trak", percentage: 28.67 },
        { atom: "tkhd", percentage: 28.67 },
        { atom: "edts", percentage: 27.56 },
        { atom: "elst", percentage: 27.56 },
        { atom: "mdia", percentage: 28.01 },
        { atom: "mdhd", percentage: 28.01 },
        { atom: "hdlr", percentage: 28.01 },
        { atom: "minf", percentage: 27.96 },
        { atom: "vmhd", percentage: 24.25 },
        { atom: "stbl", percentage: 27.86 },
        { atom: "stsd", percentage: 27.82 },
        { atom: "stts", percentage: 28.04 },
      ],

      attribute_similarity_analysis: {
        brand: null,
        last_generation: "Haiper AI",
        model: null,
      },

      pixel_analysis: [
        {
          type: "face_manipulation",
          result: "suspicious",
          confidence: 0.942,
          manipulation_type: "face_swap",
          description:
            "Our proprietary algorithm checks for facial manipulations by learning to recognize visual artifacts and inconsistencies commonly introduced by AI generators.",
        },
        {
          type: "ai_generated_content",
          result: "valid",
          confidence: 0.15,
          description:
            "Our proprietary algorithm checks for AI-generated content by identifying low-level artifacts left by image and video generators.",
        },
        {
          type: "eye_gaze_manipulation",
          result: "suspicious",
          confidence: 0.746,
          manipulation_type: "eye_gaze_manipulation",
          description:
            "Our proprietary algorithm checks for eye gaze manipulations by learning to recognize visual artifacts and inconsistencies commonly introduced by AI generators.",
        },
      ],

      voice_analysis: [
        {
          speaker_id: "Speaker 1",
          result: "Suspicious",
          confidence: 0.948,
          language: "English (EN)",
          language_confidence: 0.99,
          gender: "Male",
          gender_confidence: 0.99,
          outlier_features: {
            jitter: { value: 2.68, min: 0.0, max: 25.79 },
            shimmer: { value: 15.94, min: 2.09, max: 95.46 },
            background_noise: { value: 0.73, min: -0.07, max: 1.0 },
            temporal_patterns: { value: 0.26, min: -0.74, max: 1.0 },
          },
        },
      ],

      forensic_analysis: [
        {
          severity: "critical",
          name: "Signature Consistent With: Deepbrain AI, Deepfakes Web, Faceswap, Hedra, HeyGen, Reface, Roop, Runway, Synthesia",
          type: "AI Generator",
          found_in: "File Structural Signature",
        },
        {
          severity: "suspect",
          name: "Signature Consistent With: Any Video Converter, Bluesky, FFmpeg, Shutter Encoder",
          type: "Encoder, Social Platform",
          found_in: "File Structural Signature",
        },
      ],

      structural_consistency: {
        modification_tests: "passed",
        validation_tests: "passed",
      },

      decoded_metadata: {
        general: {
          complete_name: "/tmp/2e499/367c118f-89aa-4a26-959e-fc29dd0bb098.mp4",
          format: "MPEG-4",
          format_profile: "Base Media",
          codec_id: "isom (isom/iso2/avc1/mp41)",
          file_size: "1.20 MiB",
          duration: "5 s 875 ms",
          overall_bit_rate: "1 720 kb/s",
          writing_application: "Lavf58.76.100",
        },
        video: {
          id: 1,
          format: "AVC",
          format_info: "Advanced Video Codec",
          format_profile: "High@L3.2",
          format_settings: "CABAC / 4 Ref Frames",
          format_settings_cabac: "Yes",
          format_settings_ref_frames: "4 frames",
          codec_id: "avc1",
          codec_id_info: "Advanced Video Coding",
          duration: "5 s 875 ms",
          bit_rate: "1 716 kb/s",
          width: "768 pixels",
          height: "1 362 pixels",
          display_aspect_ratio: "0.564",
          frame_rate_mode: "Constant",
          frame_rate: "24.000 FPS",
          color_space: "YUV",
          chroma_subsampling: "4:2:0",
          bit_depth: "8 bits",
          scan_type: "Progressive",
          bits_per_pixel_frame: "0.068",
          stream_size: "1.20 MiB (100%)",
          writing_library: "x264 core 163 r3060 5db6aa6",
          encoding_settings:
            "cabac=1 / ref=3 / deblock=1:0:0 / analyse=0x3:0x113 / me=hex / subme=7 / psy=1 / psy_rd=1.00:0.00 / mixed_ref=1 / me_range=16 / chroma_me=1 / trellis=1 / 8x8dct=1 / cqm=0 / deadzone=21,11 / fast_pskip=1 / chroma_qp_offset=-2 / threads=43 / lookahead_threads=7",
        },
        audio: {
          id: 2,
          format: "AAC LC",
          format_info: "Advanced Audio Codec Low Complexity",
          codec_id: "mp4a-40-2",
          duration: "7 s 744 ms",
          bit_rate_mode: "Variable",
          bit_rate: "69.0 kb/s",
          channels: "1 channel",
          channel_layout: "C",
          sampling_rate: "16.0 kHz",
          frame_rate: "15.625 FPS (1024 SPF)",
          compression_mode: "Lossy",
          stream_size: "65.4 KiB (17%)",
        },
      },

      c2pa_manifests: false,
      proprietary_structural_data: [
        { description: "sgpd", size: 26, start: 388038, end: 388063 },
        { description: "sbgp", size: 28, start: 388064, end: 388091 },
      ],
      unknown_structural_data: false,

      checks: {
        face_swap: { detected: true, confidence: 0.92 },
        lip_sync: { detected: true, confidence: 0.88 },
        audio_visual_mismatch: { detected: false, confidence: 0.15 },
        injection_attack: { detected: false, confidence: 0.05 },
        replay_attack: { detected: false, confidence: 0.08 },
      },
      metadata: {
        file_hash: "6D82354B4AEA838EB5F8BD5654B447F18ED624F0D584303AAABBF2456FE4855F",
        resolution: "768x1362",
        duration_seconds: 5.875,
        codec: "H.264",
      },
    },
  },
  {
    id: "chk_9e8d7c6b5a4f",
    status: "completed",
    job_type: "document_id",
    content_type: "image/jpeg",
    file_size_bytes: 524288,
    score: 0.12,
    verdict: "real",
    sandbox: false,
    applicant_id: "app_usr_67890",
    created_at: "2026-02-08T13:45:00Z",
    thumbnail_url: "/thumbnails/document-1.jpg",
  },
  {
    id: "chk_3a2b1c4d5e6f",
    status: "pending",
    job_type: "video",
    content_type: "video/webm",
    file_size_bytes: 8912345,
    score: 0,
    verdict: "uncertain",
    sandbox: true,
    applicant_id: "app_usr_11223",
    created_at: "2026-02-05T14:55:00Z",
    thumbnail_url: "/thumbnails/video-1.jpg",
  },
  {
    id: "chk_1a2b3c4d5e6f",
    status: "failed",
    job_type: "selfie_liveness",
    content_type: "video/mp4",
    file_size_bytes: 3456789,
    score: 0,
    verdict: "uncertain",
    sandbox: false,
    applicant_id: "app_usr_77889",
    created_at: "2026-01-20T11:00:00Z",
    thumbnail_url: "/thumbnails/selfie-2.jpg",
  },
  {
    id: "chk_2b3c4d5e6f7g",
    status: "completed",
    job_type: "selfie_liveness",
    content_type: "video/mp4",
    file_size_bytes: 1987654,
    score: 0.08,
    verdict: "real",
    sandbox: true,
    applicant_id: "app_usr_99001",
    created_at: "2026-01-15T10:30:00Z",
    thumbnail_url: "/thumbnails/selfie-3.jpg",
    details: {
      overall_verdict: "real",
      confidence_score: 0.08,
      processing_time_ms: 1156,

      project_info: {
        case_id: "2b3c4d5e-6f7g-8h9i-0j1k-l2m3n4o5p6q7",
        examiner_name: "auto-examiner-video",
        project_id: "59231",
        date_processed: "2024-03-18T10:30:00Z",
        verify_version: "2.374",
        reference_library_version: "2.2.187",
      },

      file_summary: {
        filename: "selfie-verification-real.mp4",
        format: "MPEG-4 Media File",
        file_id: "161517",
        date_processed: "2024-03-18T10:30:00Z",
        date_last_updated: "2024-03-18T10:31:10Z",
        file_checksum_sha256: "B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2",
        verify_file_signature: "camera.1234",
      },

      structural_analysis: {
        structure_signature: "Camera Original",
        match_type: "camera.1234",
        signature_id: "1234567890",
        signature_hash: "Camera",
        signature_category: "Benign",
      },

      device_generation_history: [
        {
          generation: 1,
          brand: "Apple",
          model: "iPhone 14 Pro",
          camera_type: "Device Camera",
          processing_steps: ["Front Camera", "GPS On", "Live Photo"],
        },
      ],

      file_signature_structure: [
        { atom: "ftyp", percentage: 100.0 },
        { atom: "moov", percentage: 98.5 },
        { atom: "mdat", percentage: 97.2 },
      ],

      attribute_similarity_analysis: {
        brand: "Apple",
        last_generation: "iPhone 14 Pro",
        model: "Device Camera",
      },

      pixel_analysis: [
        {
          type: "face_manipulation",
          result: "valid",
          confidence: 0.08,
          description: "No facial manipulation detected. The face appears authentic.",
        },
        {
          type: "ai_generated_content",
          result: "valid",
          confidence: 0.05,
          description: "No AI-generated content detected.",
        },
      ],

      voice_analysis: [],

      forensic_analysis: [
        {
          severity: "benign",
          name: "Camera Original - Apple iPhone 14 Pro",
          type: "Device Camera",
          found_in: "File Structural Signature",
        },
      ],

      structural_consistency: {
        modification_tests: "passed",
        validation_tests: "passed",
      },

      decoded_metadata: {
        general: {
          complete_name: "/tmp/selfie-verification.mp4",
          format: "MPEG-4",
          format_profile: "Base Media / Version 2",
          codec_id: "isom (isom/iso2/avc1/mp41/qt)",
          file_size: "1.9 MiB",
          duration: "8 s 234 ms",
          overall_bit_rate: "1 950 kb/s",
          writing_application: "Apple iPhone 14 Pro",
        },
        video: {
          id: 1,
          format: "HEVC",
          format_info: "High Efficiency Video Coding",
          format_profile: "Main@L4@Main",
          format_settings: "N/A",
          format_settings_cabac: "N/A",
          format_settings_ref_frames: "N/A",
          codec_id: "hvc1",
          codec_id_info: "High Efficiency Video Coding",
          duration: "8 s 234 ms",
          bit_rate: "1 850 kb/s",
          width: "1920 pixels",
          height: "1080 pixels",
          display_aspect_ratio: "16:9",
          frame_rate_mode: "Variable",
          frame_rate: "30.000 FPS",
          color_space: "YUV",
          chroma_subsampling: "4:2:0",
          bit_depth: "10 bits",
          scan_type: "Progressive",
          bits_per_pixel_frame: "0.030",
          stream_size: "1.8 MiB (95%)",
          writing_library: "Apple",
          encoding_settings: "N/A",
        },
        audio: {
          id: 2,
          format: "AAC LC",
          format_info: "Advanced Audio Codec Low Complexity",
          codec_id: "mp4a-40-2",
          duration: "8 s 234 ms",
          bit_rate_mode: "Variable",
          bit_rate: "96 kb/s",
          channels: "2 channels",
          channel_layout: "L R",
          sampling_rate: "48.0 kHz",
          frame_rate: "46.875 FPS (1024 SPF)",
          compression_mode: "Lossy",
          stream_size: "96 KiB (5%)",
        },
      },

      c2pa_manifests: false,
      proprietary_structural_data: [],
      unknown_structural_data: false,

      checks: {
        face_swap: { detected: false, confidence: 0.05 },
        lip_sync: { detected: false, confidence: 0.03 },
        audio_visual_mismatch: { detected: false, confidence: 0.02 },
        injection_attack: { detected: false, confidence: 0.01 },
        replay_attack: { detected: false, confidence: 0.02 },
      },
      metadata: {
        file_hash: "B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2",
        resolution: "1920x1080",
        duration_seconds: 8.234,
        codec: "HEVC",
      },
    },
  },
  {
    id: "chk_4d5e6f7g8h9i",
    status: "completed",
    job_type: "document_id",
    content_type: "image/png",
    file_size_bytes: 876543,
    score: 0.65,
    verdict: "uncertain",
    sandbox: false,
    applicant_id: "app_usr_22334",
    created_at: "2025-12-17T16:45:00Z",
    thumbnail_url: "/thumbnails/document-2.jpg",
  },
  {
    id: "chk_5e6f7g8h9i0j",
    status: "completed",
    job_type: "video",
    content_type: "video/mp4",
    file_size_bytes: 15678901,
    score: 0.89,
    verdict: "fake",
    sandbox: false,
    applicant_id: "app_usr_55667",
    created_at: "2025-11-20T14:20:00Z",
    thumbnail_url: "/thumbnails/video-2.jpg",
  },
]

export const mockStreamingEvents: StreamingEvent[] = [
  {
    type: "session_start",
    level: "info",
    participant_id: "part_abc123",
    track_id: "track_video_001",
    message: "Streaming session started",
    timestamp_ms: Date.now() - 120000,
  },
  {
    type: "liveness_check",
    level: "info",
    participant_id: "part_abc123",
    track_id: "track_video_001",
    message: "Liveness check passed",
    timestamp_ms: Date.now() - 95000,
    details: { confidence: 0.98, check_type: "blink_detection" },
  },
  {
    type: "deepfake_alert",
    level: "error",
    participant_id: "part_xyz789",
    track_id: "track_video_002",
    message: "Potential face swap detected",
    timestamp_ms: Date.now() - 60000,
    details: { confidence: 0.87, check_type: "face_swap" },
  },
  {
    type: "injection_detected",
    level: "warning",
    participant_id: "part_def456",
    track_id: "track_video_003",
    message: "Virtual camera injection attempt blocked",
    timestamp_ms: Date.now() - 30000,
    details: { confidence: 0.95, check_type: "injection_attack" },
  },
  {
    type: "liveness_check",
    level: "info",
    participant_id: "part_ghi789",
    track_id: "track_video_004",
    message: "Head turn challenge completed",
    timestamp_ms: Date.now() - 15000,
    details: { confidence: 0.92, check_type: "head_pose" },
  },
]

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
