type KpiHoverPreviewProps = {
  lines: string[];
};

export function KpiHoverPreview({ lines }: KpiHoverPreviewProps) {
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
