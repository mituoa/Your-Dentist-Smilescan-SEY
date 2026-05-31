"use client";

import { Mic } from "lucide-react";

import { useAssistContextOptional } from "@/components/command-assist/assist-shell";

/** Subtle Relay execution hint — no new nav, uses existing Command AI. */
export function RelayAssistHint() {
  const ctx = useAssistContextOptional();

  return (
    <div
      className="yd-relay-assist-hint mb-5 flex flex-col gap-2 rounded-2xl border border-[rgba(180,198,218,0.28)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5"
      role="status"
    >
      <p className="text-[13px] leading-relaxed text-[#475569]">
        <span className="font-medium text-[#334155]">Assistenz bereit</span>
        {" — "}
        Diktat oder{" "}
        <kbd className="rounded border border-[rgba(15,23,42,0.1)] bg-[#F8FAFC] px-1.5 py-0.5 text-[11px] font-medium text-[#64748B]">
          ⌘K
        </kbd>{" "}
        für Aufgaben, Erinnerungen und Telefonnotizen.
      </p>
      {ctx ? (
        <button
          type="button"
          onClick={ctx.openCommand}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] px-3 py-2 text-[12px] font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.28)]"
        >
          <Mic className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Vorbereiten
        </button>
      ) : null}
    </div>
  );
}
