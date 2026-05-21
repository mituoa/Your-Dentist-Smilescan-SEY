"use client";

import { Command } from "lucide-react";

import { useAssistUiOptional } from "@/components/command-assist/assist-shell";
import { useMobileNavOptional } from "@/components/app-shell/mobile-nav";

/** Command AI in der mobilen Navigations-Fußzeile — kein isolierter FAB. */
export function MobileCommandNavEntry() {
  const assist = useAssistUiOptional();
  const mobileNav = useMobileNavOptional();

  if (!assist) return null;

  return (
    <button
      type="button"
      className="yd-mobile-sidebar-command touch-manipulation"
      onClick={() => {
        mobileNav?.close();
        assist.openCommand();
      }}
      aria-label="Command AI öffnen"
    >
      <span className="yd-mobile-sidebar-command-icon" aria-hidden>
        <Command className="h-[17px] w-[17px]" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="yd-mobile-sidebar-command-label">Command</span>
        <span className="yd-mobile-sidebar-command-hint">Assistenz im Arbeitsfluss</span>
      </span>
    </button>
  );
}
