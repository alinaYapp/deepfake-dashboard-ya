import type { ErrorCode, ProvenanceInfo, ContainerInfo } from "@/lib/deepfake-report-types"

interface ForensicFlagsProps {
  errors: ErrorCode[]
  provenance?: ProvenanceInfo
  container?: ContainerInfo
}

interface FlagItem {
  type: "red" | "amber" | "green"
  iconType: "info" | "warning" | "check"
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
        iconType: "check",
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
      iconType: "info",
      title: "High confidence of AI-generated content detected",
      description:
        "Signatures consistent with known deepfake generation tools found in file structure",
    })
  }

  if (errors.includes("MetadataAiGeneratorDetected")) {
    flags.push({
      type: "red",
      iconType: "warning",
      title: "AI video generator signatures detected in metadata",
      description: provenance?.software || "AI generation tool signatures found in metadata",
    })
  }

  if (errors.includes("MetadataProfessionalSoftware")) {
    flags.push({
      type: "amber",
      iconType: "warning",
      title: "Professional video editing software detected",
      description: provenance?.software
        ? `${provenance.software} signatures found in metadata`
        : "Professional editing software signatures found in metadata",
    })
  }

  if (errors.includes("SuspiciousMetadata")) {
    flags.push({
      type: "amber",
      iconType: "warning",
      title: "Video converter/encoder signatures detected",
      description: container?.encoder || "Unknown encoder signatures detected",
    })
  }

  return flags
}

function FlagIcon({ type, iconType }: { type: "red" | "amber" | "green"; iconType: "info" | "warning" | "check" }) {
  if (iconType === "check") {
    return (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
        <circle cx="8" cy="8" r="7" fill="#10B981" />
        <path d="M5 8L7 10L11 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (iconType === "warning") {
    const fill = type === "red" ? "#DC2626" : "#F59E0B"
    return (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
        <path d="M8 1.5L1 13.5h14L8 1.5z" fill={fill} />
        <line x1="8" y1="6.5" x2="8" y2="10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.7" fill="#fff" />
      </svg>
    )
  }
  // info
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
      <circle cx="8" cy="8" r="7" fill="#DC2626" />
      <circle cx="8" cy="5.5" r="0.7" fill="#fff" />
      <line x1="8" y1="7.5" x2="8" y2="11" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
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
          fontSize: "10px",
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
                gap: "9px",
                padding: "9px 12px",
                background: s.bg,
                borderLeft: `4px solid ${s.border}`,
                borderRadius: "4px",
              }}
            >
              <FlagIcon type={flag.type} iconType={flag.iconType} />
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: s.titleColor, lineHeight: "1.3" }}>
                  {flag.title}
                </div>
                <div style={{ fontSize: "9px", color: s.descColor, lineHeight: "1.4", marginTop: "2px" }}>
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
