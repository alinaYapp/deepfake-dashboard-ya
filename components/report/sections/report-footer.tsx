export function ReportFooter() {
  return (
    <>
      {/* Disclaimer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "7px",
          color: "#9ca3af",
          paddingTop: "6px",
          borderTop: "1px solid #f3f4f6",
          marginTop: "auto",
        }}
      >
        <span style={{ maxWidth: "65%", lineHeight: "1.3" }}>
          This assessment is probabilistic and should be interpreted in context. It does not
          constitute legal advice or a conclusive determination of authenticity.
        </span>
        <span style={{ letterSpacing: "1px", fontWeight: 600, color: "#6b7280" }}>
          CONFIDENTIAL
        </span>
      </div>

      {/* Page footer (absolute) */}
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
        <span>DataSpike Deepfake Detection Report</span>
        <span>Page 1 of 1</span>
      </div>
    </>
  )
}
