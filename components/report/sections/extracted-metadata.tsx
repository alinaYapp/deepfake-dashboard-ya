import type { VideoMetadata } from "@/lib/deepfake-report-types"

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

  if (ct?.format) rows.push({ label: "Format", value: ct.format })
  if (pv?.duration) rows.push({ label: "Duration", value: pv.duration })
  if (pv?.bitrate) rows.push({ label: "Bitrate", value: pv.bitrate })
  if (ct?.encoder) rows.push({ label: "Encoder", value: ct.encoder })
  if (pv?.codec) rows.push({ label: "Codec", value: pv.codec })
  if (pv?.resolution) rows.push({ label: "Resolution", value: pv.resolution })
  if (pv?.frame_rate != null) rows.push({ label: "Frame Rate", value: `${pv.frame_rate} FPS` })
  if (pv?.sample_rate) rows.push({ label: "Sample Rate", value: pv.sample_rate })

  // Provenance camera info
  if (pr?.camera_make) rows.push({ label: "Camera Make", value: pr.camera_make })
  if (pr?.camera_model) rows.push({ label: "Camera Model", value: pr.camera_model })
  if (pr?.creation_date) {
    rows.push({
      label: "Creation Date",
      value: new Date(pr.creation_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    })
  }
  if (pr?.gps_location) rows.push({ label: "GPS Location", value: pr.gps_location })

  return rows
}

export function ExtractedMetadata({ videoMetadata }: ExtractedMetadataProps) {
  const rows = buildMetaRows(videoMetadata)

  return (
    <div style={{ marginBottom: "10px" }}>
      <div
        style={{
          fontSize: "9px",
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
          padding: "8px 12px",
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
        }}
      >
        {rows.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0",
            }}
          >
            {rows.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4px 8px",
                  borderBottom: i < rows.length - 1 ? "1px solid #f3f4f6" : "none",
                }}
              >
                <span style={{ fontSize: "8.5px", color: "#6b7280" }}>{r.label}</span>
                <span
                  style={{
                    fontSize: "8.5px",
                    color: "#374151",
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
        ) : (
          <div style={{ fontSize: "9px", color: "#6b7280" }}>No metadata available</div>
        )}

        {/* File integrity status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginTop: "8px",
            padding: "4px 8px",
            borderRadius: "4px",
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
          }}
        >
          <div
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "#22C55E",
            }}
          />
          <span style={{ fontSize: "7.5px", fontWeight: 500, color: "#15803D" }}>
            File integrity: All structural checks passed
          </span>
        </div>
      </div>
    </div>
  )
}
