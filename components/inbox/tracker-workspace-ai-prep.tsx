import { Check, Sparkles } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import type { TrackerAssistItem } from "@/lib/inbox/build-tracker-workspace";
import { YD } from "@/lib/design/yd-design-tokens";

type TrackerWorkspaceAiPrepProps = {
  assistItems: TrackerAssistItem[];
  nextSteps: string[];
};

/** KI-Vorbereitung — Assistenz-Checkliste und empfohlene nächste Schritte. */
export function TrackerWorkspaceAiPrep({
  assistItems,
  nextSteps,
}: TrackerWorkspaceAiPrepProps) {
  return (
    <section className="yd-tracker-workspace-section" aria-labelledby="tracker-ai-prep-title">
      <h3 id="tracker-ai-prep-title" className="yd-tracker-workspace-section__title">
        KI-Vorbereitung
      </h3>
      <HcCard tone="default" className="yd-dash-surface yd-tracker-workspace-section__card p-4 md:p-5">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: "rgba(239,246,255,0.95)", color: YD.accent.core }}
          >
            <Sparkles className="h-[17px] w-[17px]" strokeWidth={1.9} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] leading-relaxed" style={{ color: YD.text.secondary }}>
              Strukturierte Einordnung für Ihre Entscheidung — nichts wird automatisch versendet.
            </p>
            <ul className="mt-3 space-y-1.5">
              {assistItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 text-[13px] font-medium"
                  style={{ color: item.done ? YD.text.secondary : YD.text.muted }}
                >
                  <Check
                    className="h-3.5 w-3.5 shrink-0"
                    strokeWidth={2.5}
                    style={{ color: item.done ? YD.accent.core : YD.text.muted, opacity: item.done ? 1 : 0.35 }}
                    aria-hidden
                  />
                  {item.label}
                </li>
              ))}
            </ul>
            {nextSteps.length > 0 ? (
              <div className="mt-4 border-t pt-4" style={{ borderColor: YD.border.soft }}>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: YD.text.muted }}
                >
                  Empfohlen als Nächstes
                </p>
                <ul className="mt-2 space-y-2">
                  {nextSteps.map((step) => (
                    <li
                      key={step}
                      className="flex gap-2 text-[13px] font-medium leading-snug"
                      style={{ color: YD.text.secondary }}
                    >
                      <span
                        className="mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: YD.accent.core }}
                        aria-hidden
                      />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </HcCard>
    </section>
  );
}
