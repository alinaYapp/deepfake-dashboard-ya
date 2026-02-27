interface ReportPageThreeProps {
  isEnterprise?: boolean
}

export function ReportPageThree({ isEnterprise = true }: ReportPageThreeProps) {
  const referencesWithLinks = [
    {
      text: 'Rössler, A., Cozzolino, D., Verdoliva, L., Riess, C., Thies, J., & Nießner, M. (2019). FaceForensics++: Learning to Detect Manipulated Facial Images. IEEE/CVF International Conference on Computer Vision (ICCV).',
      url: 'https://doi.org/10.1109/ICCV.2019.00009',
    },
    {
      text: 'Selvaraju, R. R., Cogswell, M., Das, A., Vedantam, R., Parikh, D., & Batra, D. (2017). Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization. IEEE/CVF International Conference on Computer Vision (ICCV).',
      url: 'https://doi.org/10.1109/ICCV.2017.74',
    },
    {
      text: 'Verdoliva, L. (2020). Media Forensics and DeepFakes: An Overview. IEEE Journal of Selected Topics in Signal Processing, 14(5), 910–932.',
      url: 'https://doi.org/10.1109/JSTSP.2020.3002101',
    },
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
      <div style={{ padding: "28px 40px 80px" }}>
        {/* References */}
        <div style={{ marginBottom: "40px" }}>
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
            {referencesWithLinks.map((ref, i) => (
              <li key={i} style={{ marginBottom: "6px" }}>
                {ref.text}{" "}
                <a href={ref.url} style={{ color: "#2563eb", textDecoration: "underline" }} target="_blank" rel="noopener noreferrer">
                  {ref.url}
                </a>
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
        <span>Page 3 of 3</span>
        <span>© 2025 DataSpike. All rights reserved.</span>
      </div>
    </div>
  )
}
