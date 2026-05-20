import type { ReactNode } from "react";

import { HC } from "@/lib/design/healthcare-dashboard-tokens";

type HcFilterChipProps = {
  children: ReactNode;
  icon?: ReactNode;
};

export function HcFilterChip({ children, icon }: HcFilterChipProps) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-[12px] font-medium"
      style={{ borderColor: HC.border, color: HC.textSecondary }}
    >
      {icon}
      {children}
    </span>
  );
}
