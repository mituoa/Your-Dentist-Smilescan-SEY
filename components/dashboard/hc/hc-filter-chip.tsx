import type { ReactNode } from "react";

import { YD } from "@/lib/design/yd-design-tokens";

type HcFilterChipProps = {
  children: ReactNode;
  icon?: ReactNode;
};

export function HcFilterChip({ children, icon }: HcFilterChipProps) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium tracking-wide"
      style={{
        background: "rgba(255,255,255,0.65)",
        border: `1px solid ${YD.border.soft}`,
        color: YD.text.muted,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      {icon}
      {children}
    </span>
  );
}
