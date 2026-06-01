import Link from "next/link";
import { Check } from "lucide-react";

import type { PracticeBriefing } from "@/lib/command-ai/practice-intelligence";
import { cn } from "@/lib/utils";

type MorningBriefingProps = {
  briefing: PracticeBriefing;
};

export function MorningBriefing({ briefing }: MorningBriefingProps) {
  return (
    <section
      className="yd-morning-briefing yd-command-prepared mb-5 min-w-0 rounded-[20px] border border-[rgba(180,198,218,0.28)] bg-white px-5 py-4 md:px-6 md:py-5"
      aria-label="Tagesüberblick Assistenz"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold tracking-[-0.02em] text-[#152a45]">
            Heute vorbereitet
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-[#5e7389]">{briefing.subline}</p>

          <ul className="mt-3 space-y-1.5">
            {briefing.checks.map((check) => (
              <li
                key={check.id}
                className="flex items-start gap-2 text-[13px] leading-snug text-[#334155]"
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                    check.done ? "text-[#16a34a]" : "text-[#94a3b8]"
                  )}
                  aria-hidden
                >
                  {check.done ? (
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  ) : (
                    <span className="text-[11px]">○</span>
                  )}
                </span>
                <span>{check.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/inbox"
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[rgba(22,61,122,0.2)] bg-gradient-to-b from-[#2a5f9e] to-[#163d7a] px-4 py-2.5 text-[13px] font-medium text-white shadow-[0_2px_10px_rgba(22,61,122,0.22)] transition-[box-shadow,filter] hover:brightness-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(22,61,122,0.28)]"
        >
          Überblick öffnen
        </Link>
      </div>
    </section>
  );
}
