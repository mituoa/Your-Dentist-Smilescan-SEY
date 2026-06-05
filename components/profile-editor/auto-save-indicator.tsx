"use client";

import { Check } from "lucide-react";

import { YdInlineBusy } from "@/components/design-system/yd-skeleton";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt: Date | null;
  errorMessage?: string | null;
  warningMessage?: string | null;
  isDirty?: boolean;
}

export function AutoSaveIndicator({
  status,
  lastSavedAt,
  errorMessage,
  warningMessage,
  isDirty = false,
}: AutoSaveIndicatorProps) {
  if (status === "saving") {
    return (
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <YdInlineBusy />
        <span>Speichern…</span>
      </div>
    );
  }

  if (status === "error") {
    const raw = (errorMessage || "").trim();
    const detail =
      raw === "Nicht angemeldet."
        ? "Bitte melden Sie sich erneut an, um fortzufahren."
        : raw || undefined;
    const isGenericSave = !detail || detail === "Speichern fehlgeschlagen.";

    return (
      <div className="max-w-md text-xs leading-relaxed" role="alert">
        <p className="font-medium text-text-primary">Speichern derzeit nicht möglich.</p>
        <p className="mt-1 text-text-secondary">
          {isGenericSave
            ? "Bitte prüfen Sie die Verbindung und versuchen Sie es in einem Moment erneut."
            : detail}
        </p>
      </div>
    );
  }

  if (warningMessage?.trim()) {
    return (
      <div className="max-w-md text-xs leading-relaxed" role="status">
        <p className="font-medium text-amber-900">Teilweise gespeichert</p>
        <p className="mt-1 text-amber-800/90">{warningMessage.trim()}</p>
      </div>
    );
  }

  if (isDirty) {
    return (
      <p className="text-xs leading-relaxed text-slate-500" role="status">
        Ungespeicherte Änderungen — bitte Speichern klicken, bevor Sie die Seite verlassen.
      </p>
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
        <Check className="h-3 w-3" strokeWidth={2} aria-hidden />
        <span>Zuletzt gespeichert {label}</span>
      </div>
    );
  }

  return null;
}
