import type { ReactNode } from "react";

import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

type DashboardPanelChromeProps = {
  title: string;
  hint?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** Einheitlicher Panel-Kopf — Workspace-Tiefe, warme Oberfläche. */
export function DashboardPanelChrome({
  title,
  hint,
  action,
  children,
  className,
}: DashboardPanelChromeProps) {
  return (
    <>
      <div
        className={cn(
          "yd-dash-panel-head flex items-center justify-between gap-3 px-5 py-4 md:px-6",
          className
        )}
        style={{
          background: YD.surface.tableHead,
          borderBottom: `1px solid ${YD.border.soft}`,
        }}
      >
        <div className="min-w-0">
          <p className="yd-dash-section">{title}</p>
          {hint ? (
            <p className="yd-dash-meta mt-1 normal-case tracking-normal">{hint}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children ?? null}
    </>
  );
}
