import Link from "next/link";
import { Sparkles } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { YD } from "@/lib/design/yd-design-tokens";

type DashboardCommandStripProps = {
  hints: string[];
};

/** Ruhige Command-AI-Orientierung — kein AI-Marketing. */
export function DashboardCommandStrip({ hints }: DashboardCommandStripProps) {
  return (
    <HcCard tone="quiet" className="p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <div className="flex shrink-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(145deg, rgba(167,139,250,0.15) 0%, rgba(47,128,237,0.12) 100%)",
              border: `1px solid ${YD.border.soft}`,
            }}
          >
            <Sparkles className="h-4 w-4" style={{ color: YD.text.muted }} strokeWidth={1.65} />
          </span>
          <div>
            <p className="yd-dash-section">Command AI</p>
            <p className="yd-dash-meta mt-0.5 normal-case tracking-normal">Leise Assistenz</p>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-2">
          {hints.map((hint) => (
            <li
              key={hint}
              className="text-[13px] leading-relaxed"
              style={{ color: YD.text.secondary }}
            >
              {hint}
            </li>
          ))}
        </ul>
        <Link
          href="/inbox"
          className="shrink-0 self-start text-[12px] font-medium no-underline md:self-center"
          style={{ color: YD.accent.core }}
        >
          Im Arbeitsfluss
        </Link>
      </div>
    </HcCard>
  );
}
