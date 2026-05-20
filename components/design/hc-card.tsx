import type { CSSProperties, ReactNode } from "react";

import { HC } from "@/lib/design/healthcare-dashboard-tokens";
import { cn } from "@/lib/utils";

type HcCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function HcCard({ children, className, style }: HcCardProps) {
  return (
    <div
      className={cn("relative overflow-hidden border-0", className)}
      style={{
        background: HC.cardGradient,
        borderRadius: HC.cardRadius,
        boxShadow: HC.cardShadow,
        ...style,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-[inherit] opacity-80"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, transparent 100%)",
        }}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
