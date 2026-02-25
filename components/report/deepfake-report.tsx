"use client"

import { useEffect, useState } from "react"
import { Shield, FileText } from "lucide-react"

export interface DeepfakeReportData {
  report_id: string
  user_name: string
  submission_date: string
  engine_version: string
  errors: (
    | "DeepfakeDetected"
    | "MetadataProfessionalSoftware"
    | "MetadataAiGeneratorDetected"
    | "SuspiciousMetadata"
  )[]
  overall_score: number
}

type Status = "AUTHENTIC" | "SUSPICIOUS" | "UNCERTAIN"

function getStatus(errors: DeepfakeReportData["errors"]): Status {
  if (errors.length === 0) return "AUTHENTIC"
  if (
    errors.includes("DeepfakeDetected") ||
    errors.includes("MetadataAiGeneratorDetected")
  )
    return "SUSPICIOUS"
  return "UNCERTAIN"
}

function getScoreColor(score: number): string {
  if (score < 0.4) return "#15803D"
  if (score < 0.7) return "#B45309"
  return "#B91C1C"
}

function getScoreBg(score: number): string {
  if (score < 0.4) return "#F0FDF4"
  if (score < 0.7) return "#FFFBEB"
  return "#FEF2F2"
}

function getStatusColor(status: Status): string {
  if (status === "AUTHENTIC") return "#15803D"
  if (status === "SUSPICIOUS") return "#B91C1C"
  return "#B45309"
}

function getStatusBadgeBg(status: Status): string {
  if (status === "AUTHENTIC") return "#DCFCE7"
  if (status === "SUSPICIOUS") return "#FEE2E2"
  return "#FEF3C7"
}

function getStatusLabel(status: Status): string {
  if (status === "AUTHENTIC") return "Authentic"
  if (status === "SUSPICIOUS") return "Suspicious"
  return "Uncertain"
}

function formatSubmissionDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) +
    ", " +
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
}

function hasMetadataIssues(errors: DeepfakeReportData["errors"]): boolean {
  return (
    errors.includes("MetadataProfessionalSoftware") ||
    errors.includes("MetadataAiGeneratorDetected") ||
    errors.includes("SuspiciousMetadata")
  )
}

// Circular gauge SVG component
function ScoreGauge({
  score,
  animate,
}: {
  score: number
  animate: boolean
}) {
  const percentage = (score * 100).toFixed(1)
  const color = getScoreColor(score)
  const radius = 58
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius
  const progress = animate ? score * circumference : 0
  const trackColor = "#e5e7eb"

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="144" height="144" viewBox="0 0 144 144">
        {/* Track */}
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform="rotate(-90 72 72)"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        {/* Center text */}
        <text
          x="72"
          y="68"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          style={{
            fontSize: "28px",
            fontWeight: 700,
            fontFamily: "var(--font-jetbrains)",
          }}
        >
          {percentage}%
        </text>
      </svg>
    </div>
  )
}

export function DeepfakeReport({ data }: { data: DeepfakeReportData }) {
  const [animate, setAnimate] = useState(false)
  const status = getStatus(data.errors)
  const statusColor = getStatusColor(status)
  const statusLabel = getStatusLabel(status)
  const scoreColor = getScoreColor(data.overall_score)
  const metadataSuspicious = hasMetadataIssues(data.errors)

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="mx-auto w-full max-w-[900px] rounded-lg bg-[#ffffff] p-8 shadow-sm"
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      {/* Section 1 - Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#4A7BF7]">
            <span
              className="text-xs font-bold text-[#ffffff]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              DS
            </span>
          </div>
          <span
            className="text-lg font-semibold text-[#4A7BF7]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            DataSpike
          </span>
        </div>
        <span
          className="text-xs tracking-widest text-[#9ca3af]"
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontVariant: "all-small-caps",
            letterSpacing: "0.12em",
          }}
        >
          Deepfake Detection Report
        </span>
      </div>

      {/* Section 2 - Report Info Card */}
      <div className="mb-6 flex overflow-hidden rounded-lg border border-[#e5e7eb]">
        {/* Left side - Info table */}
        <div className="flex-1 p-5">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {/* Report Status */}
              <tr>
                <td
                  className="w-[140px] border-b border-[#f3f4f6] py-3 pr-4 align-middle font-medium text-[#6b7280]"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  Report Status
                </td>
                <td className="border-b border-[#f3f4f6] py-3 align-middle">
                  <span
                    className="inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-semibold"
                    style={{
                      background: getStatusBadgeBg(status),
                      color: statusColor,
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {status === "SUSPICIOUS" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <circle
                          cx="6"
                          cy="6"
                          r="5"
                          stroke={statusColor}
                          strokeWidth="1.5"
                        />
                        <line
                          x1="4"
                          y1="4"
                          x2="8"
                          y2="8"
                          stroke={statusColor}
                          strokeWidth="1.5"
                        />
                        <line
                          x1="8"
                          y1="4"
                          x2="4"
                          y2="8"
                          stroke={statusColor}
                          strokeWidth="1.5"
                        />
                      </svg>
                    )}
                    {status === "AUTHENTIC" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <circle
                          cx="6"
                          cy="6"
                          r="5"
                          stroke={statusColor}
                          strokeWidth="1.5"
                        />
                        <path
                          d="M3.5 6L5.5 8L8.5 4"
                          stroke={statusColor}
                          strokeWidth="1.5"
                        />
                      </svg>
                    )}
                    {status === "UNCERTAIN" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <circle
                          cx="6"
                          cy="6"
                          r="5"
                          stroke={statusColor}
                          strokeWidth="1.5"
                        />
                        <line
                          x1="4"
                          y1="6"
                          x2="8"
                          y2="6"
                          stroke={statusColor}
                          strokeWidth="1.5"
                        />
                      </svg>
                    )}
                    {status}
                  </span>
                </td>
              </tr>
              {/* User Name */}
              <tr>
                <td
                  className="w-[140px] border-b border-[#f3f4f6] py-3 pr-4 align-middle font-medium text-[#6b7280]"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  User Name
                </td>
                <td className="border-b border-[#f3f4f6] py-3 align-middle">
                  <span
                    className="font-medium text-[#374151]"
                    style={{ fontFamily: "var(--font-jetbrains)", fontSize: "13px" }}
                  >
                    {data.user_name}
                  </span>
                </td>
              </tr>
              {/* Submission Date */}
              <tr>
                <td
                  className="w-[140px] border-b border-[#f3f4f6] py-3 pr-4 align-middle font-medium text-[#6b7280]"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  Submission Date
                </td>
                <td className="border-b border-[#f3f4f6] py-3 align-middle">
                  <span
                    className="font-medium text-[#374151]"
                    style={{ fontFamily: "var(--font-jetbrains)", fontSize: "13px" }}
                  >
                    {formatSubmissionDate(data.submission_date)}
                  </span>
                </td>
              </tr>
              {/* Report ID */}
              <tr>
                <td
                  className="w-[140px] py-3 pr-4 align-middle font-medium text-[#6b7280]"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  Report ID
                </td>
                <td className="py-3 align-middle">
                  <span
                    className="font-semibold text-[#374151]"
                    style={{ fontFamily: "var(--font-jetbrains)", fontSize: "13px" }}
                  >
                    {data.report_id}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right side - Circular gauge */}
        <div
          className="flex w-[220px] flex-col items-center justify-center border-l border-[#e5e7eb] px-4 py-6"
          style={{ background: getScoreBg(data.overall_score) }}
        >
          <div
            className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#6b7280]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Overall Confidence
          </div>
          <ScoreGauge score={data.overall_score} animate={animate} />
          <div
            className="mt-3 flex h-7 items-center justify-center rounded px-4 text-xs font-semibold uppercase tracking-wide text-[#ffffff]"
            style={{
              background: scoreColor,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {statusLabel}
          </div>
        </div>
      </div>

      {/* Section 3 - Score overview strip */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        {/* Card 1: Overall Score */}
        <div
          className="flex items-center gap-3 rounded-lg border px-4 py-3"
          style={{
            background:
              data.overall_score < 0.4
                ? "#F0FDF4"
                : data.overall_score < 0.7
                  ? "#FFFBEB"
                  : "#FEF2F2",
            borderColor:
              data.overall_score < 0.4
                ? "#BBF7D0"
                : data.overall_score < 0.7
                  ? "#FDE68A"
                  : "#FECACA",
          }}
        >
          <Shield
            className="h-5 w-5 shrink-0"
            style={{ color: scoreColor }}
          />
          <div className="flex-1">
            <div
              className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Overall Score
            </div>
            <div
              className="text-lg font-bold leading-tight"
              style={{
                color: scoreColor,
                fontFamily: "var(--font-jetbrains)",
              }}
            >
              {(data.overall_score * 100).toFixed(1)}%
            </div>
          </div>
          {data.overall_score < 0.4 && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <circle
                cx="9"
                cy="9"
                r="8"
                fill="#DCFCE7"
                stroke="#22C55E"
                strokeWidth="1.2"
              />
              <path
                d="M5.5 9l2.5 2.5 4.5-5"
                stroke="#15803D"
                strokeWidth="1.8"
                fill="none"
              />
            </svg>
          )}
          {data.overall_score >= 0.4 && data.overall_score < 0.7 && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <circle
                cx="9"
                cy="9"
                r="8"
                fill="#FEF3C7"
                stroke="#F59E0B"
                strokeWidth="1.2"
              />
              <line
                x1="5.5"
                y1="9"
                x2="12.5"
                y2="9"
                stroke="#B45309"
                strokeWidth="1.8"
              />
            </svg>
          )}
          {data.overall_score >= 0.7 && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <circle
                cx="9"
                cy="9"
                r="8"
                fill="#FEE2E2"
                stroke="#EF4444"
                strokeWidth="1.2"
              />
              <line
                x1="6"
                y1="6"
                x2="12"
                y2="12"
                stroke="#B91C1C"
                strokeWidth="1.8"
              />
              <line
                x1="12"
                y1="6"
                x2="6"
                y2="12"
                stroke="#B91C1C"
                strokeWidth="1.8"
              />
            </svg>
          )}
        </div>

        {/* Card 2: File Metadata */}
        <div
          className="flex items-center gap-3 rounded-lg border px-4 py-3"
          style={{
            background: metadataSuspicious ? "#FEF2F2" : "#F0FDF4",
            borderColor: metadataSuspicious ? "#FECACA" : "#BBF7D0",
          }}
        >
          <FileText
            className="h-5 w-5 shrink-0"
            style={{ color: metadataSuspicious ? "#B91C1C" : "#15803D" }}
          />
          <div className="flex-1">
            <div
              className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              File Metadata
            </div>
            <div
              className="text-lg font-bold leading-tight"
              style={{
                color: metadataSuspicious ? "#B91C1C" : "#15803D",
                fontFamily: "var(--font-jetbrains)",
              }}
            >
              {metadataSuspicious ? "Suspicious" : "Consistent"}
            </div>
          </div>
          {metadataSuspicious ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <circle
                cx="9"
                cy="9"
                r="8"
                fill="#FEE2E2"
                stroke="#EF4444"
                strokeWidth="1.2"
              />
              <line
                x1="6"
                y1="6"
                x2="12"
                y2="12"
                stroke="#B91C1C"
                strokeWidth="1.8"
              />
              <line
                x1="12"
                y1="6"
                x2="6"
                y2="12"
                stroke="#B91C1C"
                strokeWidth="1.8"
              />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <circle
                cx="9"
                cy="9"
                r="8"
                fill="#DCFCE7"
                stroke="#22C55E"
                strokeWidth="1.2"
              />
              <path
                d="M5.5 9l2.5 2.5 4.5-5"
                stroke="#15803D"
                strokeWidth="1.8"
                fill="none"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Legend strip */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4 text-[11px] text-[#9ca3af]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-[#15803D]" />
            {"0\u201339% Authentic"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-[#B45309]" />
            {"40\u201369% Uncertain"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-[#B91C1C]" />
            {"70\u2013100% Suspicious"}
          </span>
        </div>
        <span
          className="text-[11px] text-[#9ca3af]"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Engine {data.engine_version}
        </span>
      </div>
    </div>
  )
}
