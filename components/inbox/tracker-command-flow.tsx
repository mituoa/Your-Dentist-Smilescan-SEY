import { HcCard } from "@/components/design/hc-card";
import type { TrackerCommandStep } from "@/lib/inbox/build-tracker-workspace";
import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

type TrackerCommandFlowProps = {
  steps: TrackerCommandStep[];
};

export function TrackerCommandFlow({ steps }: TrackerCommandFlowProps) {
  return (
    <HcCard tone="default" className="yd-dash-surface yd-tracker-v4-rail-card p-4 md:p-5">
      <h3 className="text-[14px] font-semibold tracking-[-0.015em] md:text-[15px]" style={{ color: YD.text.primary }}>
        Command AI
      </h3>
      <p className="mt-0.5 text-[12px] font-medium" style={{ color: YD.text.muted }}>
        Vom Diktat bis zur Freigabe
      </p>
      <ol className="yd-tracker-v4-command-flow mt-3">
        {steps.map((step, index) => (
          <li key={step.id} className="yd-tracker-v4-command-flow__step">
            <span
              className={cn(
                "yd-tracker-v4-command-flow__node",
                step.state === "done" && "yd-tracker-v4-command-flow__node--done",
                step.state === "active" && "yd-tracker-v4-command-flow__node--active"
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1 pb-3">
              <p
                className={cn(
                  "text-[13px] font-medium",
                  step.state === "pending" ? "text-[#94A3B8]" : "text-[#334155]"
                )}
              >
                {step.label}
              </p>
              {index < steps.length - 1 ? (
                <span className="yd-tracker-v4-command-flow__connector" aria-hidden />
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </HcCard>
  );
}
