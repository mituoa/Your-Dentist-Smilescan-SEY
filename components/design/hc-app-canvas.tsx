import type { ReactNode } from "react";

import { HC } from "@/lib/design/healthcare-dashboard-tokens";
import { cn } from "@/lib/utils";

type HcAppCanvasProps = {
  children: ReactNode;
  className?: string;
};

export function HcAppCanvas({ children, className }: HcAppCanvasProps) {
  return (
    <div
      className={cn(
        "relative w-full min-w-0 overflow-hidden rounded-[28px] p-4 md:rounded-[44px] md:p-6 lg:p-7",
        className
      )}
      style={{
        background: HC.canvasGradient,
        border: HC.canvasBorder,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.75), 0 6px 28px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: HC.canvasInnerGlow }}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
