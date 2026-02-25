import { Info, AlertTriangle, CheckCircle } from "lucide-react"
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

const flagStyles: Record<string, { bg: string; border: string; titleColor: string; descColor: string; iconColor: string }> = {
  red: { bg: "#FEE2E2", border: "#DC2626", titleColor: "#991B1B", descColor: "#7F1D1D", iconColor: "#DC2626" },
  amber: { bg: "#FEF3C7", border: "#F59E0B", titleColor: "#92400E", descColor: "#78350F", iconColor: "#F59E0B" },
  green: { bg: "#D1FAE5", border: "#10B981", titleColor: "#065F46", descColor: "#047857", iconColor: "#10B981" },
}

function FlagIcon({ type, iconType }: { type: "red" | "amber" | "green"; iconType: "info" | "warning" | "check" }) {
  const s = flagStyles[type]
  if (iconType === "check") return <CheckCircle size={15} color={s.iconColor} style={{ flexShrink: 0, marginTop: 1 }} />
  if (iconType === "warning") return <AlertTriangle size={15} color={s.iconColor} style={{ flexShrink: 0, marginTop: 1 }} />
  return <Info size={15} color={s.iconColor} style={{ flexShrink: 0, marginTop: 1 }} />
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
