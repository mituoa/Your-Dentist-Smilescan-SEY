"use client";

import { Check, Loader2 } from "lucide-react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt: Date | null;
  errorMessage?: string | null;
}

export function AutoSaveIndicator({
  status,
  lastSavedAt,
  errorMessage,
}: AutoSaveIndicatorProps) {
  if (status === "saving") {
    return (
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
        Speichern…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-xs text-danger">
        Fehler: {errorMessage || "Speichern fehlgeschlagen"}
      </div>
    );
  }

  if (status === "saved" && lastSavedAt) {
    const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
    const label =
      seconds < 5
        ? "gerade eben"
        : seconds < 60
          ? `vor ${seconds}s`
          : `vor ${Math.floor(seconds / 60)}min`;
    return (
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <Check className="w-3 h-3" strokeWidth={2} />
        Gespeichert {label}
      </div>
    );
  }

  return null;
}
