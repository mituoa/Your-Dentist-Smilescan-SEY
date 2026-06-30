"use client";

import { Sparkles } from "lucide-react";

import { useAssistDispatchOptional } from "@/components/command-assist/assist-shell";
import { cn } from "@/lib/utils";

type MobileTopbarAssistButtonProps = {
  className?: string;
};

/** Mobile: KI Assistenz in der Topbar — kein schwebender FAB über der Navigation. */
export function MobileTopbarAssistButton({ className }: MobileTopbarAssistButtonProps) {
  const assist = useAssistDispatchOptional();
  if (!assist) return null;

  return (
    <button
      type="button"
      className={cn("yd-mobile-topbar-assist", className)}
      onClick={() => assist.openCommand()}
      aria-label="KI Assistenz öffnen"
      title="KI Assistenz"
    >
      <Sparkles className="h-[1.0625rem] w-[1.0625rem]" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
