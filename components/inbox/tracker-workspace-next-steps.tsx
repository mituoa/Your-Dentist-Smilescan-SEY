import { HcCard } from "@/components/design/hc-card";
import { YD } from "@/lib/design/yd-design-tokens";

type TrackerWorkspaceNextStepsProps = {
  steps: string[];
};

export function TrackerWorkspaceNextSteps({ steps }: TrackerWorkspaceNextStepsProps) {
  return (
    <HcCard tone="default" className="yd-dash-surface yd-tracker-v4-rail-card p-4 md:p-5">
      <h3 className="text-[14px] font-semibold tracking-[-0.015em] md:text-[15px]" style={{ color: YD.text.primary }}>
        Nächste Schritte
      </h3>
      <ul className="mt-2.5 space-y-2">
        {steps.map((step) => (
          <li
            key={step}
            className="flex gap-2 text-[13px] font-medium leading-snug"
            style={{ color: YD.text.secondary }}
          >
            <span className="mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: YD.accent.core }} aria-hidden />
            {step}
          </li>
        ))}
      </ul>
    </HcCard>
  );
}
