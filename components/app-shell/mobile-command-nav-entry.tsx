"use client";

import { Sparkles } from "lucide-react";

import { useAssistUiOptional } from "@/components/command-assist/assist-shell";
import { useMobileNavOptional } from "@/components/app-shell/mobile-nav";

/** Command AI — kompakte Zeile in der mobilen Navigation. */
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
      aria-label="Assistenz öffnen"
    >
      <Sparkles className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.65} aria-hidden />
      <span className="yd-mobile-sidebar-command-label">Assistenz</span>
    </button>
  );
}
