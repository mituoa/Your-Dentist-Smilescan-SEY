import type { RelayCommandStep } from "@/lib/relay/build-relay-snapshot";
import { cn } from "@/lib/utils";

type RelayCommandFlowProps = {
  steps: RelayCommandStep[];
};

export function RelayCommandFlow({ steps }: RelayCommandFlowProps) {
  return (
    <ol className="yd-relay-v4-command-flow">
      {steps.map((step, index) => (
        <li key={step.id} className="yd-relay-v4-command-flow__step">
          <span
            className={cn(
              "yd-relay-v4-command-flow__node",
              step.state === "done" && "yd-relay-v4-command-flow__node--done",
              step.state === "active" && "yd-relay-v4-command-flow__node--active"
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-[13px] font-medium",
                step.state === "pending" ? "text-[#94A3B8]" : "text-[#334155]"
              )}
            >
              {step.label}
            </p>
            {index < steps.length - 1 ? (
              <span className="yd-relay-v4-command-flow__line" aria-hidden />
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
