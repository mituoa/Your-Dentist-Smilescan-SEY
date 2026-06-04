"use client";

import { Check, Sparkles } from "lucide-react";

import type { RelayAssistSummary } from "@/lib/relay/build-relay-snapshot";

type RelayAssistCardProps = {
  summary: RelayAssistSummary;
};

export function RelayAssistCard({ summary }: RelayAssistCardProps) {
  const lines = [
    summary.approvalCount > 0
      ? `${summary.approvalCount} Freigabe${summary.approvalCount === 1 ? "" : "n"} offen`
      : null,
    summary.taskCount > 0
      ? `${summary.taskCount} Aufgabe${summary.taskCount === 1 ? "" : "n"} vorbereitet`
      : null,
    summary.handoffCount > 0
      ? `${summary.handoffCount} Übergabe${summary.handoffCount === 1 ? "" : "n"} ungelesen`
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="yd-relay-v4-assist-inner flex items-start gap-2.5">
      <span className="yd-relay-v4-assist-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
        <Sparkles className="h-4 w-4" strokeWidth={1.85} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        {lines.length === 0 ? (
          <p className="text-[12px] font-medium text-[#64748B]">
            Keine offenen Vorbereitungen — alles im Blick.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {lines.map((line) => (
              <li key={line} className="flex items-center gap-2 text-[12px] font-medium text-[#64748B]">
                <Check className="h-3.5 w-3.5 shrink-0 text-[#1e3a8a]" strokeWidth={2.5} aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
