import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

import type { PracticeBriefing } from "@/lib/command-ai/practice-intelligence";
import { cn } from "@/lib/utils";

type MorningBriefingProps = {
  briefing: PracticeBriefing;
};

export function MorningBriefing({ briefing }: MorningBriefingProps) {
  return (
    <section
      className="yd-morning-briefing yd-command-prepared mb-5 min-w-0 rounded-[20px] border border-[rgba(180,198,218,0.32)] bg-white px-5 py-4 md:px-6 md:py-5"
      aria-label="Tagesüberblick Assistenz"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2F80ED] to-[#1B6FD4] text-white shadow-[0_2px_8px_rgba(47,128,237,0.28)]"
              aria-hidden
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              {briefing.headline}
            </p>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#475569]">{briefing.subline}</p>

          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
            Heute vorbereitet
          </p>
          <ul className="mt-2 space-y-1.5">
            {briefing.checks.map((check) => (
              <li
                key={check.id}
                className="flex items-start gap-2 text-[13px] leading-snug text-[#334155]"
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                    check.done ? "text-[#16a34a]" : "text-[#F59E0B]"
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
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#0F172A] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,23,42,0.35)]"
        >
          Überblick öffnen
        </Link>
      </div>
    </section>
  );
}
