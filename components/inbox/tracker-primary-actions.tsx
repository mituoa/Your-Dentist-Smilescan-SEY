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
 * Primäre Aktionen — Figma-Referenz: vertikaler Stack, feste Höhen, 9px Radius, 15px/14px Typo.
 */
export function TrackerPrimaryActions() {
  return (
    <div>
      <button
        type="button"
        onClick={() => scrollToId("tracker-termin")}
        className="flex w-full cursor-pointer items-center justify-center gap-2 border-0 transition duration-150 ease-out hover:opacity-[0.98] active:scale-[0.98]"
        style={{
          padding: "0 20px",
          height: "44px",
          background: "#2B6FE8",
          color: "#FFFFFF",
          borderRadius: "9px",
          fontSize: "15px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          marginBottom: "12px",
          boxShadow: "0 1px 2px rgba(43,111,232,0.1)",
        }}
      >
        <Calendar className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
        Termin vorschlagen
      </button>

      <button
        type="button"
        onClick={() => scrollToId("tracker-korrespondenz", true)}
        className="flex w-full cursor-pointer items-center justify-center gap-2 transition duration-150 ease-out active:scale-[0.98]"
        style={{
          padding: "0 20px",
          height: "42px",
          background: "#FFFFFF",
          color: "#2B6FE8",
          border: "1px solid #CBD5E1",
          borderRadius: "9px",
          fontSize: "15px",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          marginBottom: "8px",
        }}
      >
        <MessageSquare className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
        Rückfrage an Patient
      </button>

      <button
        type="button"
        onClick={() => scrollToId("tracker-empfehlung")}
        className="flex w-full cursor-pointer items-center justify-center gap-[7px] border-0 transition duration-150 ease-out hover:bg-[#F1F5F9] hover:text-[#64748B] hover:opacity-100 active:scale-[0.98]"
        style={{
          padding: "0 20px",
          height: "40px",
          background: "transparent",
          color: "#94A3B8",
          borderRadius: "9px",
          fontSize: "14px",
          fontWeight: 400,
          letterSpacing: "-0.005em",
          marginBottom: "16px",
          opacity: 0.75,
        }}
      >
        <Clock className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        Zunächst beobachten
      </button>
    </div>
  );
}
