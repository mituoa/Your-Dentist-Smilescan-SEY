import { YD } from "@/lib/design/yd-design-tokens";
import type { YdNavAmbientPreview } from "@/lib/ambient/nav-preview-types";

type YdNavAmbientPanelProps = {
  preview: YdNavAmbientPreview;
};

export function YdNavAmbientPanel({ preview }: YdNavAmbientPanelProps) {
  return (
    <div className="yd-nav-ambient-panel hidden md:block" role="presentation">
      <p
        className="yd-nav-preview-line mb-2.5 text-[10px] font-medium uppercase tracking-[0.1em]"
        style={{ color: YD.text.faint }}
      >
        {preview.title}
      </p>
      <ul className="space-y-2">
        {preview.lines.map((line, i) => (
          <li
            key={`${line.label ?? ""}-${line.value}-${i}`}
            className="yd-nav-preview-line text-[12px] leading-relaxed"
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
