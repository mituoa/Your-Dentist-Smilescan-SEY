import type { ReactNode } from "react";

import { YD } from "@/lib/design/yd-design-tokens";

type YdSectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function YdSectionHeader({ title, subtitle, action }: YdSectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2
          className="text-[15px] font-semibold tracking-[-0.01em]"
          style={{ color: YD.text.primary }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-[13px]" style={{ color: YD.text.muted }}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
