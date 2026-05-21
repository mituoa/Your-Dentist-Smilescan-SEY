import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardWorkzoneProps = {
  rail: string;
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

/**
 * Ruhige Arbeitszone — klare Ebene ohne CRM-Härte.
 */
export function DashboardWorkzone({
  rail,
  title,
  hint,
  children,
  className,
  bodyClassName,
}: DashboardWorkzoneProps) {
  return (
    <section className={cn("yd-dash-band", className)}>
      <header className="yd-dash-band__head">
        <span className="yd-dash-band__rail">{rail}</span>
        <div className="yd-dash-band__titles min-w-0">
          <h2 className="yd-dash-band__title">{title}</h2>
          {hint ? <p className="yd-dash-band__hint">{hint}</p> : null}
        </div>
      </header>
      <div className={cn("yd-dash-band__body", bodyClassName)}>{children}</div>
    </section>
  );
}
