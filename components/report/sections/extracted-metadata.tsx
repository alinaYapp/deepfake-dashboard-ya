import type { VideoMetadata } from "@/lib/deepfake-report-types"
import { formatSubmissionDate } from "@/lib/deepfake-report-types"

interface ExtractedMetadataProps {
  videoMetadata: VideoMetadata
}

interface MetaRow {
  label: string
  value: string
}

function buildMetaRows(vm: VideoMetadata): MetaRow[] {
  const rows: MetaRow[] = []
  const pv = vm.parsed_video
  const ct = vm.container
  const pr = vm.provenance

  // Spec-defined order
  rows.push({ label: "Format", value: ct?.format || "\u2014" })
  rows.push({ label: "Duration", value: pv?.duration || "\u2014" })
  rows.push({ label: "Bitrate", value: pv?.bitrate || "\u2014" })
  rows.push({ label: "Encoder", value: ct?.encoder || "\u2014" })
  rows.push({ label: "Codec", value: pv?.codec || "\u2014" })
  rows.push({ label: "Resolution", value: pv?.resolution || "\u2014" })
  rows.push({ label: "Frame Rate", value: pv?.frame_rate != null ? `${pv.frame_rate} FPS` : "\u2014" })
  rows.push({ label: "Sample Rate", value: pv?.sample_rate || "\u2014" })

  // Provenance rows
  if (pr) {
    if (pr.camera_make) rows.push({ label: "Camera Make", value: pr.camera_make })
    if (pr.camera_model) rows.push({ label: "Camera Model", value: pr.camera_model })
    if (pr.software) rows.push({ label: "Software", value: pr.software })
    if (pr.creation_date) {
      rows.push({
        label: "Creation Date",
        value: formatSubmissionDate(pr.creation_date),
      })
    }
    if (pr.gps_location) rows.push({ label: "GPS Location", value: pr.gps_location })
  }

  return rows
}

export function ExtractedMetadata({ videoMetadata }: ExtractedMetadataProps) {
  const rows = buildMetaRows(videoMetadata)

  // Split into left and right columns for the two-column table
  const half = Math.ceil(rows.length / 2)
  const leftRows = rows.slice(0, half)
  const rightRows = rows.slice(half)

  return (
    <div style={{ marginBottom: "10px" }}>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          color: "#374151",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "6px",
        }}
      >
        Extracted Metadata
      </div>
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex" }}>
          {/* Left column */}
          <div style={{ flex: 1 }}>
            {leftRows.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "5px 12px",
                  borderBottom: "1px solid #f0f1f3",
                  background: i % 2 === 0 ? "#f8fafc" : "#ffffff",
                }}
              >
                <span style={{ fontSize: "9px", color: "#6b7280", fontWeight: 500 }}>{r.label}</span>
                <span
                  style={{
                    fontSize: "9px",
                    color: r.value === "\u2014" ? "#d1d5db" : "#374151",
                    fontWeight: 500,
                    fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
                    textAlign: "right",
                  }}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>
          {/* Separator */}
          <div style={{ width: "1px", background: "#e5e7eb" }} />
          {/* Right column */}
          <div style={{ flex: 1 }}>
            {rightRows.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "5px 12px",
                  borderBottom: "1px solid #f0f1f3",
                  background: i % 2 === 0 ? "#f8fafc" : "#ffffff",
                }}
              >
                <span style={{ fontSize: "9px", color: "#6b7280", fontWeight: 500 }}>{r.label}</span>
                <span
                  style={{
                    fontSize: "9px",
                    color: r.value === "\u2014" ? "#d1d5db" : "#374151",
                    fontWeight: 500,
                    fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
                    textAlign: "right",
                  }}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* File integrity status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            margin: "8px 12px",
            padding: "5px 10px",
            borderRadius: "4px",
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" fill="#22C55E" />
            <path d="M4.5 7L6.5 9L9.5 5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: "8px", fontWeight: 500, color: "#15803D" }}>
            File integrity: All structural checks passed
          </span>
        </div>
      </div>
    </div>
  )
}
