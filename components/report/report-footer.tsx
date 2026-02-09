export function ReportFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-border pt-4">
      <p className="max-w-[60%] text-[10px] leading-relaxed text-muted-foreground">
        This report presents a probabilistic assessment of media authenticity. Confidence scores reflect algorithmic
        analysis and should be evaluated within the broader context of the investigation. Results do not constitute
        definitive proof of manipulation.
      </p>
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground/50">
        Confidential
      </span>
      <span className="text-xs text-muted-foreground">Page 1 of 3</span>
    </footer>
  )
}
