import { Check } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

type PracticeStatusProps = {
  unseen: number | null;
  seen: number | null;
  openTaskCount: number;
  nextTaskLabel?: string | null;
};

function StatusLine({
  ok,
  label,
  hint,
}: {
  ok: boolean;
  label: string;
  hint?: string;
}) {
  return (
    <li className="yd-dash-practice-status__line">
      <span
        className={cn(
          "yd-dash-practice-status__mark",
          ok ? "yd-dash-practice-status__mark--ok" : "yd-dash-practice-status__mark--action"
        )}
        aria-hidden
      >
        {ok ? <Check className="h-3 w-3" strokeWidth={2.5} /> : "→"}
      </span>
      <span className="min-w-0">
        <span className="yd-dash-practice-status__label">{label}</span>
        {hint ? <span className="yd-dash-practice-status__hint">{hint}</span> : null}
      </span>
    </li>
  );
}

export function HcPracticeStatus({
  unseen,
  seen,
  openTaskCount,
  nextTaskLabel,
}: PracticeStatusProps) {
  const u = unseen ?? 0;
  const s = seen ?? 0;
  const needsAttention = u > 0 || openTaskCount > 0;
  const headline = needsAttention ? "Handlungsbedarf" : "Praxis läuft ruhig";
  const headlineTone = needsAttention ? YD.text.primary : "#166534";

  return (
    <HcCard
      tone="quiet"
      ambient={false}
      className="yd-dash-surface yd-dash-practice-status flex min-w-0 flex-col p-5 md:p-6"
    >
      <div className="mb-4">
        <p className="yd-dash-section yd-dash-section--secondary">Praxisstatus</p>
        <p className="mt-2 text-[15px] font-semibold tracking-[-0.02em]" style={{ color: headlineTone }}>
          {headline}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-5">
        <div>
          <p className="yd-dash-practice-status__group">Patienten</p>
          <ul className="mt-2 space-y-2">
            <StatusLine
              ok={u === 0}
              label={
                u === 0
                  ? "Keine Patienten warten auf Durchsicht"
                  : `${u} ${u === 1 ? "Patient wartet" : "Patienten warten"} auf Durchsicht`
              }
            />
            <StatusLine
              ok={s > 0 || u === 0}
              label={s > 0 ? `${s} ${s === 1 ? "Fall aktiv" : "Fälle aktiv"}` : "Keine aktiven Fälle"}
            />
            <StatusLine
              ok={u === 0}
              label={u === 0 ? "Alle Antworten vorbereitet" : "Antworten warten auf Freigabe"}
            />
          </ul>
        </div>

        <div>
          <p className="yd-dash-practice-status__group">Aufgaben</p>
          <ul className="mt-2 space-y-2">
            <StatusLine
              ok={openTaskCount === 0}
              label={
                openTaskCount === 0
                  ? "Keine offenen Aufgaben"
                  : `${openTaskCount} ${openTaskCount === 1 ? "Aufgabe offen" : "Aufgaben offen"}`
              }
              hint={
                openTaskCount > 0 && nextTaskLabel
                  ? `Nächste: ${nextTaskLabel.length > 42 ? `${nextTaskLabel.slice(0, 41)}…` : nextTaskLabel}`
                  : undefined
              }
            />
          </ul>
        </div>
      </div>
    </HcCard>
  );
}
