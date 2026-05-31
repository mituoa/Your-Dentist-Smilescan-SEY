import Link from "next/link";
import { Sparkles } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { WORKSPACE_COPY } from "@/lib/dashboard/workspace-copy";
import { YD } from "@/lib/design/yd-design-tokens";

type DashboardCommandStripProps = {
  hints: string[];
};

export function DashboardCommandStrip({ hints }: DashboardCommandStripProps) {
  return (
    <HcCard tone="quiet" className="yd-dash-panel yd-dash-panel--assist h-full p-5 md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(145deg, rgba(167,139,250,0.12) 0%, rgba(47,128,237,0.1) 100%)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" style={{ color: YD.text.muted }} strokeWidth={1.65} />
          </span>
          <p className="text-[13px] font-semibold tracking-[-0.02em]" style={{ color: YD.text.primary }}>
            Command
          </p>
        </div>
        <ul className="yd-command-hint-list">
          {hints.map((hint) => (
            <li key={hint} className="yd-command-hint-item">
              {hint}
            </li>
          ))}
        </ul>
        <Link
          href="/inbox"
          className="text-[12px] font-semibold no-underline"
          style={{ color: YD.accent.core }}
        >
          {WORKSPACE_COPY.command.open}
        </Link>
      </div>
    </HcCard>
  );
}
