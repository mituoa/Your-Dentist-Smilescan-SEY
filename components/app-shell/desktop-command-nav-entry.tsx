"use client";

import { Sparkles } from "lucide-react";

import { useAssistUiOptional } from "@/components/command-assist/assist-shell";
import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

/** Desktop rail — Command als Icon-Navigation. */
export function DesktopCommandNavEntry() {
  const assist = useAssistUiOptional();
  if (!assist) return null;

  return (
    <button
      type="button"
      title="Command AI"
      className={cn(
        "yd-ambient-nav-link group relative flex w-full touch-manipulation items-center transition-[filter] duration-700",
        "md:min-h-0 md:w-11 md:flex-col md:justify-center md:rounded-none md:bg-transparent md:px-0 md:py-0"
      )}
      onClick={() => assist.openCommand()}
      aria-label="Command AI öffnen"
    >
      <span className="yd-nav-icon-shell flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:h-11 md:w-11">
        <Sparkles
          className="h-5 w-5 md:h-[22px] md:w-[22px]"
          strokeWidth={1.55}
          style={{ color: YD.sidebar.iconIdle }}
        />
      </span>
      <span className="sr-only">Command AI</span>
    </button>
  );
}
