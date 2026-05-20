import { Calendar } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { HcFilterChip } from "@/components/dashboard/hc/hc-filter-chip";
import { HC } from "@/lib/design/healthcare-dashboard-tokens";

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
    <HcCard className="flex min-h-[320px] min-w-0 flex-col overflow-hidden p-5 md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold" style={{ color: HC.text }}>
            Bearbeitungsstand
          </p>
          <p className="mt-2 text-[32px] font-bold leading-none tracking-[-0.03em]" style={{ color: HC.text }}>
            {total === null ? "—" : t}
          </p>
        </div>
        <HcFilterChip icon={<Calendar className="h-3.5 w-3.5" />}>Gesamt</HcFilterChip>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative mx-auto h-[150px] w-full max-w-[240px] shrink-0">
          <svg viewBox="0 0 220 120" className="h-full w-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="hcArcGradMain" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={HC.arcGradientMain[0]} />
                <stop offset="50%" stopColor={HC.arcGradientMain[1]} />
                <stop offset="100%" stopColor={HC.arcGradientMain[2]} />
              </linearGradient>
              <linearGradient id="hcArcGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={HC.arcGradientLight[0]} />
                <stop offset="100%" stopColor={HC.arcGradientLight[1]} />
              </linearGradient>
              <filter id="hcArcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={ARC_PATH}
              fill="none"
              stroke={HC.arcTrack}
              strokeWidth="16"
              strokeLinecap="round"
            />
            {seenLen > 0 ? (
              <path
                d={ARC_PATH}
                fill="none"
                stroke="url(#hcArcGradLight)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${seenLen} ${ARC_LEN}`}
                strokeDashoffset={0}
                opacity={0.85}
              />
            ) : null}
            {unseenLen > 0 ? (
              <path
                d={ARC_PATH}
                fill="none"
                stroke="url(#hcArcGradMain)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${unseenLen} ${ARC_LEN}`}
                strokeDashoffset={-seenLen}
                filter="url(#hcArcGlow)"
              />
            ) : null}
          </svg>
          <div className="absolute inset-x-0 bottom-1 text-center">
            <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: HC.textMuted }}>
              Einsendungen
            </p>
            <p className="text-[24px] font-bold leading-tight" style={{ color: HC.text }}>
              {total === null ? "—" : `${t}+`}
            </p>
          </div>
        </div>

        <ul className="space-y-4 text-[13px]">
          <li className="flex items-center gap-2.5">
            <span
              className="h-3 w-3 rounded-full shadow-sm"
              style={{ background: HC.primaryIconGradient }}
            />
            <span style={{ color: HC.textSecondary }}>
              Ungelesen{" "}
              <strong className="font-semibold" style={{ color: HC.text }}>
                {total === null ? "—" : `${Math.round(unseenPct * 100)}%`}
              </strong>
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: HC.primaryLight }}
            />
            <span style={{ color: HC.textSecondary }}>
              Gelesen{" "}
              <strong className="font-semibold" style={{ color: HC.text }}>
                {total === null ? "—" : `${Math.round(seenPct * 100)}%`}
              </strong>
            </span>
          </li>
        </ul>
      </div>
    </HcCard>
  );
}
