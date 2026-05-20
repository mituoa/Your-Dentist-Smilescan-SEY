import { Calendar } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { HcFilterChip } from "@/components/dashboard/hc/hc-filter-chip";
import { YD } from "@/lib/design/yd-design-tokens";

type DistributionArcProps = {
  unseen: number | null;
  seen: number | null;
  total: number | null;
};

const ARC_PATH = "M 24 108 A 86 86 0 0 1 196 108";
const ARC_LEN = 251;

export function HcDistributionArc({ unseen, seen, total }: DistributionArcProps) {
  const u = unseen ?? 0;
  const s = seen ?? 0;
  const t = total ?? u + s;
  const unseenPct = t > 0 ? u / t : 0;
  const seenPct = t > 0 ? s / t : 0;
  const unseenLen = Math.round(unseenPct * ARC_LEN);
  const seenLen = Math.round(seenPct * ARC_LEN);

  return (
    <HcCard
      tone="quiet"
      className="yd-awaken-chart flex min-h-[340px] min-w-0 flex-col p-6 md:p-6"
      style={{ ["--yd-chart-stagger" as string]: "140ms" }}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="yd-dash-section">Bearbeitungsstand</p>
          <p className="yd-dash-kpi-quiet mt-3">{total === null ? "—" : t}</p>
        </div>
        <HcFilterChip icon={<Calendar className="h-3.5 w-3.5" strokeWidth={1.65} />}>
          Gesamt
        </HcFilterChip>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="relative mx-auto h-[140px] w-full max-w-[220px] shrink-0">
          <svg viewBox="0 0 220 120" className="h-full w-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="ydArcGradMain" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={YD.accent.arc[0]} />
                <stop offset="50%" stopColor={YD.accent.arc[1]} />
                <stop offset="100%" stopColor={YD.accent.arc[2]} />
              </linearGradient>
              <linearGradient id="ydArcGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={YD.accent.arcSoft[0]} />
                <stop offset="100%" stopColor={YD.accent.arcSoft[1]} />
              </linearGradient>
              <filter id="ydArcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={ARC_PATH}
              fill="none"
              stroke={YD.chart.track}
              strokeWidth="14"
              strokeLinecap="round"
              opacity={0.65}
            />
            {seenLen > 0 ? (
              <path
                d={ARC_PATH}
                fill="none"
                stroke="url(#ydArcGradLight)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${seenLen} ${ARC_LEN}`}
                opacity={0.75}
              />
            ) : null}
            {unseenLen > 0 ? (
              <path
                d={ARC_PATH}
                fill="none"
                stroke="url(#ydArcGradMain)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${unseenLen} ${ARC_LEN}`}
                strokeDashoffset={-seenLen}
                filter="url(#ydArcGlow)"
              />
            ) : null}
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <p className="yd-dash-meta normal-case">Einsendungen</p>
            <p className="yd-dash-kpi-quiet mt-1 text-[1.5rem]">{total === null ? "—" : t}</p>
          </div>
        </div>

        <ul className="w-full space-y-3 text-[12px] leading-relaxed">
          <li className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: YD.accent.iconGradient }}
            />
            <span style={{ color: YD.text.secondary }}>
              Ungelesen{" "}
              <span className="font-medium" style={{ color: YD.text.primary }}>
                {total === null ? "—" : `${Math.round(unseenPct * 100)}%`}
              </span>
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: YD.accent.light }} />
            <span style={{ color: YD.text.secondary }}>
              Gelesen{" "}
              <span className="font-medium" style={{ color: YD.text.primary }}>
                {total === null ? "—" : `${Math.round(seenPct * 100)}%`}
              </span>
            </span>
          </li>
        </ul>
      </div>
    </HcCard>
  );
}
