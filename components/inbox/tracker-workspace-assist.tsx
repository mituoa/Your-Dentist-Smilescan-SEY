import { Check, Sparkles } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import type { TrackerAssistItem } from "@/lib/inbox/build-tracker-workspace";
import { YD } from "@/lib/design/yd-design-tokens";

type TrackerWorkspaceAssistProps = {
  items: TrackerAssistItem[];
};

export function TrackerWorkspaceAssist({ items }: TrackerWorkspaceAssistProps) {
  return (
    <HcCard tone="default" className="yd-dash-surface yd-tracker-v4-rail-card p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: "rgba(239,246,255,0.95)", color: YD.accent.core }}
        >
          <Sparkles className="h-[17px] w-[17px]" strokeWidth={1.9} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold tracking-[-0.015em] md:text-[15px]" style={{ color: YD.text.primary }}>
            Assistenz vorbereitet
          </h3>
          <ul className="mt-2.5 space-y-1.5">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 text-[13px] font-medium"
                style={{ color: item.done ? YD.text.secondary : YD.text.muted }}
              >
                <Check
                  className={cnCheck(item.done)}
                  strokeWidth={2.5}
                  style={{ color: item.done ? YD.accent.core : YD.text.muted }}
                  aria-hidden
                />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </HcCard>
  );
}

function cnCheck(done: boolean): string {
  return done ? "h-3.5 w-3.5 shrink-0" : "h-3.5 w-3.5 shrink-0 opacity-35";
}
