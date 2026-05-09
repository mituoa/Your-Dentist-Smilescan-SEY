"use client";

import { Calendar, Clock, MessageSquare } from "lucide-react";

function scrollToId(id: string, focusDraft?: boolean) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (focusDraft) {
    window.setTimeout(() => {
      const ta = document.querySelector<HTMLTextAreaElement>("[data-tracker-draft]");
      ta?.focus({ preventScroll: true });
    }, 380);
  }
}

/**
 * Primäre Aktionen — horizontaler Workspace: zwei Hauptaktionen nebeneinander, wo Breite reicht.
 */
export function TrackerPrimaryActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
      <button
        type="button"
        onClick={() => scrollToId("tracker-termin")}
        className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold text-white transition hover:opacity-95 disabled:opacity-50 sm:min-h-11 sm:text-[14px]"
        style={{
          background: "#2B6FE8",
          boxShadow: "0 1px 2px rgba(43,111,232,0.1)",
          letterSpacing: "-0.01em",
        }}
      >
        <Calendar className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} />
        <span className="text-center leading-snug">Terminlink vorbereiten</span>
      </button>

      <button
        type="button"
        onClick={() => scrollToId("tracker-korrespondenz", true)}
        className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border bg-white px-3 text-[13px] font-medium transition hover:bg-slate-50 sm:min-h-11 sm:text-[14px]"
        style={{
          borderColor: "#CBD5E1",
          color: "#1D4ED8",
          letterSpacing: "-0.01em",
        }}
      >
        <MessageSquare className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} />
        <span className="text-center leading-snug">Rückfrage formulieren</span>
      </button>

      <button
        type="button"
        onClick={() => scrollToId("tracker-empfehlung")}
        className="flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border-0 bg-transparent text-[13px] font-normal text-slate-500 transition hover:bg-slate-100/80 sm:col-span-2 sm:min-h-10"
      >
        <Clock className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={1.75} />
        Zunächst beobachten
      </button>
    </div>
  );
}
