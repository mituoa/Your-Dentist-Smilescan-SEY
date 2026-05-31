import Link from "next/link";

import { YD } from "@/lib/design/yd-design-tokens";

export type KpiWorkContextItem = {
  name: string;
  detail: string;
};

export type KpiWorkContextData = {
  heading: string;
  items: KpiWorkContextItem[];
  emptyMessage: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type KpiWorkContextPreviewProps = {
  data: KpiWorkContextData;
};

export function KpiWorkContextPreview({ data }: KpiWorkContextPreviewProps) {
  return (
    <div className="yd-dash-kpi-work-preview">
      <p className="yd-dash-kpi-work-preview__heading">{data.heading}</p>
      {data.items.length === 0 ? (
        <p className="yd-dash-kpi-work-preview__empty">{data.emptyMessage}</p>
      ) : (
        <ul className="yd-dash-kpi-work-preview__list">
          {data.items.map((item) => (
            <li key={`${item.name}-${item.detail}`} className="yd-dash-kpi-work-preview__item">
              <span className="yd-dash-kpi-work-preview__bullet" aria-hidden>
                •
              </span>
              <span className="min-w-0">
                <span className="yd-dash-kpi-work-preview__name">{item.name}</span>
                <span className="yd-dash-kpi-work-preview__detail">{item.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {data.items.length > 0 && data.ctaLabel && data.ctaHref ? (
        <Link href={data.ctaHref} className="yd-dash-kpi-work-preview__cta" style={{ color: YD.accent.core }}>
          {data.ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
