import { YD } from "@/lib/design/yd-design-tokens";
import type { YdNavAmbientPreview } from "@/lib/ambient/nav-preview-types";

type YdNavAmbientPanelProps = {
  preview: YdNavAmbientPreview;
};

export function YdNavAmbientPanel({ preview }: YdNavAmbientPanelProps) {
  return (
    <div className="yd-nav-ambient-panel hidden md:block" role="presentation">
      <p
        className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: YD.text.muted }}
      >
        {preview.title}
      </p>
      <ul className="space-y-1.5">
        {preview.lines.map((line, i) => (
          <li
            key={`${line.label ?? ""}-${line.value}-${i}`}
            className="text-[12px] leading-snug"
            style={{
              color:
                line.tone === "urgent"
                  ? YD.status.urgent.text
                  : line.tone === "muted"
                    ? YD.text.faint
                    : YD.text.secondary,
            }}
          >
            {line.label ? (
              <span className="font-medium" style={{ color: YD.text.muted }}>
                {line.label}:{" "}
              </span>
            ) : null}
            {line.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
