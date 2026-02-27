interface ReportFooterProps {
  pageNumber?: number
  totalPages?: number
}

export function ReportFooter({ pageNumber = 1, totalPages = 2 }: ReportFooterProps) {
  return (
    <>
      {/* Disclaimer + CONFIDENTIAL */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          fontSize: "7.5px",
          color: "#9ca3af",
          paddingTop: "8px",
          borderTop: "1px solid #f3f4f6",
          marginTop: "auto",
        }}
      >
        <span style={{ maxWidth: "68%", lineHeight: "1.4" }}>
          This assessment is probabilistic and should be interpreted in context. It does not
          constitute legal advice or a conclusive determination of authenticity.
        </span>
        <span
          style={{
            letterSpacing: "1.5px",
            fontWeight: 600,
            color: "#6b7280",
            fontSize: "8px",
          }}
        >
          CONFIDENTIAL
        </span>
      </div>

      {/* Page footer bar (absolute bottom) */}
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
        <span>Page {pageNumber} of {totalPages}</span>
      </div>
    </>
  )
}
