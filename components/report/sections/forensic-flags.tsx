import type { ErrorCode, ProvenanceInfo, ContainerInfo } from "@/lib/deepfake-report-types"

interface ForensicFlagsProps {
  errors: ErrorCode[]
  provenance?: ProvenanceInfo
  container?: ContainerInfo
}

interface FlagItem {
  type: "red" | "amber" | "green"
  title: string
  description: string
}

function buildFlags(
  errors: ErrorCode[],
  provenance?: ProvenanceInfo,
  container?: ContainerInfo
): FlagItem[] {
  if (errors.length === 0) {
    return [
      {
        type: "green",
        title: "No signs of manipulation detected",
        description:
          "File structure analysis found no signatures associated with AI generation or suspicious editing tools",
      },
    ]
  }

  const flags: FlagItem[] = []

  if (errors.includes("DeepfakeDetected")) {
    flags.push({
      type: "red",
      title: "High confidence of AI-generated content detected",
      description:
        "Signatures consistent with known deepfake generation tools found in file structure",
    })
  }

  if (errors.includes("MetadataProfessionalSoftware")) {
    const sw = provenance?.software || "Professional editing software"
    flags.push({
      type: "amber",
      title: "Professional video editing software detected",
      description: sw,
    })
  }

  if (errors.includes("MetadataAiGeneratorDetected")) {
    flags.push({
      type: "red",
      title: "AI video generator signatures detected in metadata",
      description: provenance?.software || "AI generation tool signatures found",
    })
  }

  if (errors.includes("SuspiciousMetadata")) {
    const encoder = container?.encoder || "Unknown encoder"
    flags.push({
      type: "amber",
      title: "Video converter/encoder signatures detected",
      description: encoder,
    })
  }

  return flags
}

function FlagIcon({ type }: { type: "red" | "amber" | "green" }) {
  if (type === "green") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
        <circle cx="7" cy="7" r="6" fill="#10B981" />
        <path d="M4.5 7L6.5 9L9.5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (type === "amber") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
        <path d="M7 1L1 12h12L7 1z" fill="#F59E0B" stroke="#D97706" strokeWidth="0.5" />
        <text x="7" y="10.5" textAnchor="middle" fill="#78350F" fontSize="8" fontWeight="700">
          !
        </text>
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
      <circle cx="7" cy="7" r="6" fill="#DC2626" />
      <text x="7" y="10.5" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">
        i
      </text>
    </svg>
  )
}

const flagStyles: Record<string, { bg: string; border: string; titleColor: string; descColor: string }> = {
  red: { bg: "#FEE2E2", border: "#DC2626", titleColor: "#991B1B", descColor: "#7F1D1D" },
  amber: { bg: "#FEF3C7", border: "#F59E0B", titleColor: "#92400E", descColor: "#78350F" },
  green: { bg: "#D1FAE5", border: "#10B981", titleColor: "#065F46", descColor: "#047857" },
}

export function ForensicFlags({ errors, provenance, container }: ForensicFlagsProps) {
  const flags = buildFlags(errors, provenance, container)

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
        Forensic Flags
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {flags.map((flag, i) => {
          const s = flagStyles[flag.type]
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                padding: "8px 10px",
                background: s.bg,
                borderLeft: `4px solid ${s.border}`,
                borderRadius: "4px",
              }}
            >
              <FlagIcon type={flag.type} />
              <div>
                <div style={{ fontSize: "9px", fontWeight: 700, color: s.titleColor, lineHeight: "1.3" }}>
                  {flag.title}
                </div>
                <div style={{ fontSize: "8px", color: s.descColor, lineHeight: "1.4", marginTop: "2px" }}>
                  {flag.description}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
