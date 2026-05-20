import type { ReactNode } from "react";

import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

type YdWorkspaceCanvasProps = {
  children: ReactNode;
  className?: string;
};

/** Floating clinical island — main workspace atmosphere. */
export function YdWorkspaceCanvas({ children, className }: YdWorkspaceCanvasProps) {
  return (
    <div
      className={cn(
        "yd-awaken-canvas yd-awaken-glow-settle relative w-full min-w-0 overflow-hidden p-4 md:rounded-[48px] md:p-7 lg:p-8",
        className
      )}
      style={{
        background: YD.atmosphere.canvas,
        border: `1px solid ${YD.border.whisper}`,
        boxShadow: YD.shadow.island,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: YD.atmosphere.canvasGlow }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: YD.atmosphere.vignette }}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
