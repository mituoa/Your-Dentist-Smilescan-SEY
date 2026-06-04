import { Check, Sparkles } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import type { TrackerPraxisAssistentModel } from "@/lib/inbox/build-tracker-workspace";
import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

type TrackerPraxisAssistentProps = {
  model: TrackerPraxisAssistentModel;
};

export function TrackerPraxisAssistent({ model }: TrackerPraxisAssistentProps) {
  return (
    <HcCard
      tone="default"
      ambient
      className="yd-tracker-v4-praxis-assistent yd-tracker-v4-praxis-assistent--phase2 yd-dash-surface yd-tracker-v4-rail-card p-4 md:p-5"
    >
      <div className="yd-tracker-v4-praxis-assistent__head">
        <span
          className="yd-tracker-v4-praxis-assistent__icon"
          style={{ background: "rgba(239,246,255,0.95)", color: YD.accent.core }}
        >
          <Sparkles className="h-[17px] w-[17px]" strokeWidth={1.9} aria-hidden />
        </span>
        <div className="min-w-0">
          <h3
            className="text-[14px] font-semibold tracking-[-0.015em] md:text-[15px]"
            style={{ color: YD.text.primary }}
          >
            Klinische Entscheidungshilfe
          </h3>
          <p className="mt-0.5 text-[12px] font-medium" style={{ color: YD.text.muted }}>
            KI bereitet Ihre Entscheidung vor
          </p>
        </div>
      </div>

      <section
        className="yd-tracker-v4-praxis-assistent__decision"
        aria-label="KI-Einschätzung und Empfehlung"
      >
        <div className="yd-tracker-v4-praxis-assistent__decision-ki">
          <p className="yd-tracker-v4-praxis-assistent__label">KI-Einschätzung</p>
          <p
            className="yd-tracker-v4-praxis-assistent__analysis"
            style={{ color: YD.text.primary }}
          >
            {model.analysis}
          </p>
          <p
            className="yd-tracker-v4-praxis-assistent__confidence"
            style={{ color: YD.text.muted }}
          >
            {model.confidence}
          </p>
        </div>

        <div className="yd-tracker-v4-praxis-assistent__decision-action">
          <p className="yd-tracker-v4-praxis-assistent__label">Empfehlung</p>
          <p
            className="yd-tracker-v4-praxis-assistent__recommendation"
            style={{ color: YD.accent.core }}
          >
            {model.recommendedAction}
          </p>
        </div>
      </section>

      <section
        className="yd-tracker-v4-praxis-assistent__response"
        aria-label="Vorbereitete Antwort"
      >
        <p className="yd-tracker-v4-praxis-assistent__label yd-tracker-v4-praxis-assistent__label--quiet">
          Vorbereitete Antwort
        </p>
        <p className="yd-tracker-v4-praxis-assistent__response-copy" style={{ color: YD.text.secondary }}>
          {model.preparation}
        </p>
        {model.draftPreview ? (
          <p
            className="yd-tracker-v4-praxis-assistent__draft-preview"
            style={{ color: YD.text.muted }}
          >
            {model.draftPreview}
          </p>
        ) : null}
      </section>

      <details className="yd-tracker-v4-praxis-assistent__tertiary">
        <summary className="yd-tracker-v4-praxis-assistent__tertiary-summary">
          Stand & Verlauf
        </summary>
        <ul className="yd-tracker-v4-praxis-assistent__checks" aria-label="Fallstand">
          {model.prepChecks.map((item) => (
            <li key={item.id}>
              <Check
                className={cn("h-3.5 w-3.5 shrink-0", !item.done && "opacity-35")}
                strokeWidth={2.5}
                style={{ color: item.done ? YD.accent.core : YD.text.muted }}
                aria-hidden
              />
              <span style={{ color: item.done ? YD.text.secondary : YD.text.muted }}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        <ol className="yd-tracker-v4-command-flow yd-tracker-v4-praxis-assistent__flow" aria-label="Verlauf">
          {model.flowSteps.map((step, index) => (
            <li key={step.id} className="yd-tracker-v4-command-flow__step">
              <span
                className={cn(
                  "yd-tracker-v4-command-flow__node",
                  step.state === "done" && "yd-tracker-v4-command-flow__node--done",
                  step.state === "active" && "yd-tracker-v4-command-flow__node--active"
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1 pb-2.5">
                <p
                  className={cn(
                    "text-[12px] font-medium",
                    step.state === "pending" ? "text-[#94A3B8]" : "text-[#334155]"
                  )}
                >
                  {step.label}
                </p>
                {index < model.flowSteps.length - 1 ? (
                  <span className="yd-tracker-v4-command-flow__connector" aria-hidden />
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </details>
    </HcCard>
  );
}
