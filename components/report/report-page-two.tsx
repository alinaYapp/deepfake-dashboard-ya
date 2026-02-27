interface ReportPageTwoProps {
  isEnterprise?: boolean
}

export function ReportPageTwo({ isEnterprise = true }: ReportPageTwoProps) {
  const definitions = [
    {
      term: "Overall Score",
      definition:
        "The maximum smoothed frame-level manipulation probability across the analyzed video. Calculated as max(smoothed frame-level probabilities). Higher values indicate stronger likelihood of synthetic or manipulated content.",
    },
    {
      term: "Verdict",
      definition:
        "Derived from predefined decision thresholds applied to the Overall Score. Classification levels: Authentic (0–39%) — no significant indicators of manipulation detected. Uncertain (40–69%) — mixed or inconclusive signals; manual review recommended. Suspicious (70–100%) — strong indicators of synthetic or manipulated content detected. The Verdict is an interpretation of the Overall Score and is not a separate metric.",
    },
    {
      term: "File Metadata",
      definition:
        "Structural and embedded information extracted from the file. Possible automated signals include: DeepfakeDetected, MetadataProfessionalSoftware, MetadataAiGeneratorDetected, SuspiciousMetadata. Metadata flags indicate anomalies but do not independently constitute definitive proof of manipulation.",
    },
    {
      term: "Heatmap",
      definition:
        "A Grad-CAM visualization showing which spatial regions of a frame contributed most to the model's prediction. Red areas indicate highest model attention.",
    },
    {
      term: "Top Frames",
      definition:
        "The three frames with the highest individual manipulation probability, selected with a minimum 0.5-second interval to ensure independent sampling.",
    },
  ]

  const references = [
    'Rössler, A., Cozzolino, D., Verdoliva, L., Riess, C., Thies, J., & Nießner, M. (2019). FaceForensics++: Learning to Detect Manipulated Facial Images. IEEE/CVF International Conference on Computer Vision (ICCV).',
    'Selvaraju, R. R., Cogswell, M., Das, A., Vedantam, R., Parikh, D., & Batra, D. (2017). Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization. IEEE/CVF International Conference on Computer Vision (ICCV).',
    'Verdoliva, L. (2020). Media Forensics and DeepFakes: An Overview. IEEE Journal of Selected Topics in Signal Processing, 14(5), 910–932.',
  ]

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        padding: "0",
        position: "relative",
        background: "#ffffff",
        boxSizing: "border-box",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#1a1a1a",
        fontSize: "11px",
        lineHeight: "1.5",
      }}
    >
      {/* HEADER BAR */}
      <div
        style={{
          background: "#1a1f36",
          padding: "16px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              background: "#4A7BF7",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "9px",
            }}
          >
            DS
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>DataSpike</span>
        </div>
        <span style={{ fontSize: "12px", fontWeight: 500, color: "#94a3b8", letterSpacing: "0.5px" }}>
          Methodology & Scope
        </span>
      </div>

      {/* BODY CONTENT */}
      <div style={{ padding: "28px 40px 60px" }}>
        {/* Section 1: How to Read This Report */}
        <div
          style={{
            background: "#f0f4f8",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "16px 20px",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Interpreting the Results
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <tbody>
              {definitions.map((item, i) => (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? "#ffffff" : "#f8fafc",
                  }}
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      fontWeight: 600,
                      color: "#374151",
                      width: "180px",
                      verticalAlign: "top",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {item.term}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "#4b5563",
                      lineHeight: "1.5",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {item.definition}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 2: Detection Methodology */}
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Detection Methodology
          </h2>
          <div style={{ fontSize: "10px", color: "#374151", lineHeight: "1.7" }}>
            <p style={{ marginBottom: "10px" }}>
              DataSpike's deepfake detection pipeline combines frame-level deep neural network analysis with temporal
              smoothing and metadata forensics. Each video frame is independently evaluated by a CNN-based classifier
              trained on diverse manipulation techniques including face-swap, face-reenactment, and fully synthetic
              generation. Frame-level probabilities are temporally smoothed to reduce noise and produce a robust overall
              score.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Metadata analysis examines container-level, encoding, and provenance information extracted via FFprobe and
              EXIF/XMP parsers. Flags are generated when signatures of professional editing software, AI generation
              tools, or encoding inconsistencies are detected.
            </p>
            <p>
              Visual interpretability is provided through Grad-CAM heatmaps, which highlight spatial regions that most
              influenced the model's prediction for a given frame.
            </p>
          </div>
        </div>

        {/* Section 3: Scope & Limitations */}
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Scope & Limitations
          </h2>
          <div style={{ fontSize: "10px", color: "#374151", lineHeight: "1.7" }}>
            <p style={{ marginBottom: "10px" }}>
              This analysis is automated and probabilistic. Results reflect the model's assessment based on the
              submitted media file and should not be treated as a definitive legal determination of authenticity or
              manipulation.
            </p>
            <p style={{ marginBottom: "8px", fontWeight: 600 }}>Limitations to consider:</p>
            <ul style={{ marginLeft: "16px", marginBottom: "10px" }}>
              <li style={{ marginBottom: "4px" }}>
                Detection accuracy depends on input quality, resolution, and encoding. Re-encoded or heavily compressed
                media may yield lower confidence scores.
              </li>
              <li style={{ marginBottom: "4px" }}>
                The model is optimized for face-based manipulation detection. Non-facial manipulations (e.g., background
                editing, object insertion) may not be detected.
              </li>
              <li style={{ marginBottom: "4px" }}>
                Metadata flags rely on available container and encoding information. Files that have been stripped of
                metadata or re-packaged may not trigger forensic flags.
              </li>
              <li style={{ marginBottom: "4px" }}>
                Novel manipulation techniques not represented in training data may evade detection.
              </li>
            </ul>
            <p style={{ fontWeight: 600, color: "#1e293b" }}>
              Final determination of content authenticity remains the sole responsibility of the reviewing party.{" "}
              <span style={{ fontWeight: 400, color: "#374151" }}>
                This report is intended as supporting evidence for compliance and investigative workflows.
              </span>
            </p>
          </div>
        </div>

        {/* Section 4: References */}
        <div style={{ marginBottom: "16px" }}>
          <h2
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            References
          </h2>
          <ol style={{ fontSize: "9px", color: "#4b5563", lineHeight: "1.6", marginLeft: "16px" }}>
            {references.map((ref, i) => (
              <li key={i} style={{ marginBottom: "6px" }}>
                {ref}
              </li>
            ))}
          </ol>
          <p style={{ fontSize: "8px", color: "#9ca3af", fontStyle: "italic", marginTop: "10px" }}>
            Full technical documentation and model specifications available upon request.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "40px",
          right: "40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "8px",
          color: "#9ca3af",
          paddingTop: "6px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <span style={{ letterSpacing: "1px", fontWeight: 600, color: "#6b7280" }}>CONFIDENTIAL</span>
        <span>Page 2 of 2</span>
        <span>© 2025 DataSpike. All rights reserved.</span>
      </div>
    </div>
  )
}
