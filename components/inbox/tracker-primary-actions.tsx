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
 * Figma-nahe primäre Aktionen: führt zur passenden Spalte / zum Entwurf (kein Auto-Versand).
 */
export function TrackerPrimaryActions() {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => scrollToId("tracker-termin")}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-[15px] font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
        style={{
          background: "#2B6FE8",
          boxShadow: "0 1px 2px rgba(43,111,232,0.1)",
          letterSpacing: "-0.01em",
        }}
      >
        <Calendar className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
        Terminlink vorbereiten
      </button>

      <button
        type="button"
        onClick={() => scrollToId("tracker-korrespondenz", true)}
        className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] border bg-white text-[15px] font-medium transition hover:bg-[#F8FAFC]"
        style={{
          borderColor: "#CBD5E1",
          color: "#2B6FE8",
          letterSpacing: "-0.01em",
        }}
      >
        <MessageSquare className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
        Rückfrage formulieren
      </button>

      <button
        type="button"
        onClick={() => scrollToId("tracker-empfehlung")}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border-0 bg-transparent text-[14px] font-normal transition hover:bg-[#F1F5F9]"
        style={{ color: "#94A3B8", letterSpacing: "-0.005em" }}
      >
        <Clock className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} />
        Zunächst beobachten
      </button>
    </div>
  );
}
