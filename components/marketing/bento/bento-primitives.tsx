"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function BentoPage({ children, className }: { children: ReactNode; className?: string }) {
  return <article className={cn("yd-bento-page", className)}>{children}</article>;
}

export function BentoContainer({ children }: { children: ReactNode }) {
  return <div className="yd-bento-container">{children}</div>;
}

export function BentoGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("yd-bento-grid", className)}>{children}</div>;
}

type BentoCardProps = {
  children: ReactNode;
  className?: string;
  span?: 3 | 4 | 5 | 6 | 7 | 8 | 12;
  variant?: "surface" | "elevated" | "soft" | "dark" | "gradient";
  id?: string;
};

export function BentoCard({
  children,
  className,
  span = 4,
  variant = "surface",
  id,
}: BentoCardProps) {
  return (
    <div
      id={id}
      className={cn(
        "yd-bento-card",
        `yd-bento-card--span-${span}`,
        `yd-bento-card--${variant}`,
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoBadge({ children }: { children: ReactNode }) {
  return <span className="yd-bento-badge">{children}</span>;
}

export function BentoSectionHead({
  badge,
  title,
  lead,
  action,
  className,
}: {
  badge?: string;
  title: string;
  lead?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("yd-bento-section-head", className)}>
      <div className="yd-bento-section-head__text">
        {badge ? <BentoBadge>{badge}</BentoBadge> : null}
        <h2 className="yd-bento-section-head__title">{title}</h2>
        {lead ? <p className="yd-bento-section-head__lead">{lead}</p> : null}
      </div>
      {action ? <div className="yd-bento-section-head__action">{action}</div> : null}
    </header>
  );
}

export function BentoKpi({
  value,
  label,
  trend,
  tone = "neutral",
}: {
  value: string;
  label: string;
  trend?: string;
  tone?: "primary" | "neutral" | "trust";
}) {
  return (
    <div className={cn("yd-bento-kpi", `yd-bento-kpi--${tone}`)}>
      <p className="yd-bento-kpi__value">{value}</p>
      <p className="yd-bento-kpi__label">{label}</p>
      {trend ? <p className="yd-bento-kpi__trend">{trend}</p> : null}
    </div>
  );
}

export function BentoCtaPair({
  primary,
  secondary,
  onPrimary,
  onSecondary,
  primaryHref,
  secondaryHref,
}: {
  primary: string;
  secondary: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  primaryHref?: string;
  secondaryHref?: string;
}) {
  return (
    <div className="yd-bento-cta-pair">
      {onPrimary ? (
        <button type="button" className="yd-bento-btn yd-bento-btn--primary" onClick={onPrimary}>
          {primary}
        </button>
      ) : (
        <a href={primaryHref ?? "#demo"} className="yd-bento-btn yd-bento-btn--primary">
          {primary}
        </a>
      )}
      {onSecondary ? (
        <button type="button" className="yd-bento-btn yd-bento-btn--ghost" onClick={onSecondary}>
          {secondary}
        </button>
      ) : (
        <a href={secondaryHref ?? "#plattform"} className="yd-bento-btn yd-bento-btn--ghost">
          {secondary}
        </a>
      )}
    </div>
  );
}

export function BentoScrollRow({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="yd-bento-scroll-row" aria-label={label}>
      <div className="yd-bento-scroll-row__track">{children}</div>
    </div>
  );
}
