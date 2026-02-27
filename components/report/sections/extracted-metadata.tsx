import type { VideoMetadata } from "@/lib/deepfake-report-types"
import { formatSubmissionDate } from "@/lib/deepfake-report-types"

interface ExtractedMetadataProps {
  videoMetadata: VideoMetadata
}

interface MetaRow {
  label: string
  value: string
}

interface MetaSection {
  heading: string
  rows: MetaRow[]
}

function buildSections(vm: VideoMetadata): MetaSection[] {
  const sections: MetaSection[] = []
  const pv = vm.parsed_video
  const ct = vm.container
  const pr = vm.provenance

  // Video Stream
  sections.push({
    heading: "Video Stream",
    rows: [
      { label: "Codec", value: pv?.codec || "\u2014" },
      { label: "Resolution", value: pv?.resolution || "\u2014" },
      { label: "Frame Rate", value: pv?.frame_rate != null ? `${pv.frame_rate} FPS` : "\u2014" },
      { label: "Bitrate", value: pv?.bitrate || "\u2014" },
      { label: "Duration", value: pv?.duration || "\u2014" },
      { label: "Sample Rate", value: pv?.sample_rate || "\u2014" },
    ],
  })

  // Container
  sections.push({
    heading: "Container",
    rows: [
      { label: "Format", value: ct?.format || "\u2014" },
      { label: "Encoder", value: ct?.encoder || "\u2014" },
    ],
  })

  // Provenance — only if at least one field exists
  if (pr) {
    const provRows: MetaRow[] = [
      { label: "Camera Make", value: pr.camera_make || "\u2014" },
      { label: "Camera Model", value: pr.camera_model || "\u2014" },
      { label: "Software", value: pr.software || "\u2014" },
      {
        label: "Creation Date",
        value: pr.creation_date ? formatSubmissionDate(pr.creation_date) : "\u2014",
      },
    ]
    const hasAnyValue = provRows.some((r) => r.value !== "\u2014")
    if (hasAnyValue) {
      sections.push({ heading: "Provenance", rows: provRows })
    }
  }

  return sections
}

function SectionTable({ section, isLast }: { section: MetaSection; isLast: boolean }) {
  return (
    <div style={{ marginBottom: isLast ? 0 : "2px" }}>
      <div
        style={{
          fontSize: "8px",
          fontWeight: 700,
          color: "#9CA3AF",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          padding: "6px 12px 3px",
          background: "#f8fafc",
        }}
      >
        {section.heading}
      </div>
      {section.rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px 12px",
            borderBottom: i < section.rows.length - 1 ? "1px solid #f0f1f3" : "none",
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
  )
}

export function ExtractedMetadata({ videoMetadata }: ExtractedMetadataProps) {
  const sections = buildSections(videoMetadata)

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
        {sections.map((section, i) => (
          <SectionTable key={section.heading} section={section} isLast={i === sections.length - 1} />
        ))}
      </div>
    </div>
  )
}
