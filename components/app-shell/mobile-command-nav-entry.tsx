"use client";

import { Sparkles } from "lucide-react";

import { useAssistUiOptional } from "@/components/command-assist/assist-shell";
import { useMobileNavOptional } from "@/components/app-shell/mobile-nav";

/** Command AI — Navigationszeile im mobilen Drawer (nicht im Footer). */
export function MobileCommandNavEntry() {
  const assist = useAssistUiOptional();
  const mobileNav = useMobileNavOptional();

  if (!assist) return null;

  return (
    <button
      type="button"
      className="yd-mobile-nav-command-row yd-ambient-nav-link touch-manipulation"
      onClick={() => {
        mobileNav?.close();
        assist.openCommand();
      }}
      aria-label="Command AI öffnen"
    >
      <span className="yd-nav-icon-shell yd-nav-icon-shell--secondary">
        <Sparkles className="h-[17px] w-[17px]" strokeWidth={1.65} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="yd-nav-label block">Command</span>
      </span>
    </button>
  );
}
