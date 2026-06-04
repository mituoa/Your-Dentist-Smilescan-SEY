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
      glow
      className="yd-tracker-v4-praxis-assistent yd-dash-surface yd-tracker-v4-rail-card p-4 md:p-5"
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
            Praxis-Assistent
          </h3>
          <p className="mt-0.5 text-[12px] font-medium" style={{ color: YD.text.muted }}>
            Vom Eingang bis zur Freigabe
          </p>
        </div>
      </div>

      <dl className="yd-tracker-v4-praxis-assistent__fields">
        <div>
          <dt>Analyse</dt>
          <dd>{model.analysis}</dd>
        </div>
        <div>
          <dt>Vorbereitung</dt>
          <dd>{model.preparation}</dd>
        </div>
        <div>
          <dt>Freigabestatus</dt>
          <dd>{model.approvalStatus}</dd>
        </div>
        <div className="yd-tracker-v4-praxis-assistent__action-block">
          <dt>Empfohlene Aktion</dt>
          <dd className="yd-tracker-v4-praxis-assistent__action">{model.recommendedAction}</dd>
        </div>
      </dl>

      <ul className="yd-tracker-v4-praxis-assistent__checks" aria-label="Assistenz-Stand">
        {model.prepChecks.map((item) => (
          <li key={item.id}>
            <Check
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                !item.done && "opacity-35"
              )}
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

      <ol className="yd-tracker-v4-command-flow yd-tracker-v4-praxis-assistent__flow" aria-label="Workflow">
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
    </HcCard>
  );
}
