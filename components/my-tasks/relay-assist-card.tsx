"use client";

import { Check, Sparkles } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import type { RelayAssistSummary } from "@/lib/relay/build-relay-snapshot";
import { YD } from "@/lib/design/yd-design-tokens";

type RelayAssistCardProps = {
  summary: RelayAssistSummary;
};

export function RelayAssistCard({ summary }: RelayAssistCardProps) {
  const lines = [
    summary.approvalCount > 0
      ? `${summary.approvalCount} Freigabe${summary.approvalCount === 1 ? "" : "n"}`
      : null,
    summary.taskCount > 0
      ? `${summary.taskCount} Aufgabe${summary.taskCount === 1 ? "" : "n"}`
      : null,
    summary.handoffCount > 0
      ? `${summary.handoffCount} Übergabe${summary.handoffCount === 1 ? "" : "n"}`
      : null,
  ].filter(Boolean) as string[];

  return (
    <section className="min-w-0" aria-labelledby="yd-relay-assist-title">
      <HcCard tone="default" className="yd-dash-surface yd-relay-assist-card p-4 md:p-5">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: "rgba(239,246,255,0.95)", color: YD.accent.core }}
          >
            <Sparkles className="h-[17px] w-[17px]" strokeWidth={1.9} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="yd-relay-assist-title"
              className="text-[14px] font-semibold tracking-[-0.015em] md:text-[15px]"
              style={{ color: YD.text.primary }}
            >
              Assistenz
            </h2>
            <p className="mt-0.5 text-[12px] font-medium" style={{ color: YD.text.muted }}>
              Heute vorbereitet
            </p>
            {lines.length === 0 ? (
              <p className="mt-2 text-[13px]" style={{ color: YD.text.secondary }}>
                Keine offenen Vorbereitungen — alles im Blick.
              </p>
            ) : (
              <ul className="mt-2.5 space-y-1.5">
                {lines.map((line) => (
                  <li
                    key={line}
                    className="flex items-center gap-2 text-[13px] font-medium"
                    style={{ color: YD.text.secondary }}
                  >
                    <Check
                      className="h-3.5 w-3.5 shrink-0"
                      strokeWidth={2.5}
                      style={{ color: YD.accent.core }}
                      aria-hidden
                    />
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </HcCard>
    </section>
  );
}
