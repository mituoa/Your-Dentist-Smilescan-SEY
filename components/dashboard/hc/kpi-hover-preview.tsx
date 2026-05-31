type KpiHoverPreviewProps = {
  lines?: string[];
  /** Einzeiliger Tooltip — bevorzugt für KPI-Karten */
  hint?: string;
};

export function KpiHoverPreview({ lines, hint }: KpiHoverPreviewProps) {
  if (hint) {
    return (
      <p className="py-0.5 text-[11px] font-medium leading-snug" style={{ color: "#5e7389" }}>
        {hint}
      </p>
    );
  }

  if (!lines?.length) return null;

  return (
    <ul className="space-y-1.5 py-0.5">
      {lines.map((line) => (
        <li
          key={line}
          className="flex gap-2 text-[11px] font-normal leading-snug"
          style={{ color: "#5e7389" }}
        >
          <span className="shrink-0" style={{ color: "#94a3b8" }}>
            •
          </span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}
