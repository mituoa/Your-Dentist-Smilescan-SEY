"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";

import { YdInlineBusy } from "@/components/design-system/yd-skeleton";

interface ComposerTopBarProps {
  status: "draft" | "published";
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSavedAt: Date | null;
  saveError: string | null;
  canPublish: boolean;
  isPending: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function ComposerTopBar({
  status,
  saveStatus,
  lastSavedAt,
  saveError,
  canPublish,
  isPending,
  onPublish,
  onUnpublish,
}: ComposerTopBarProps) {
  const router = useRouter();

  const renderSaveStatus = () => {
    if (saveStatus === "saving") {
      return (
        <span className="text-xs text-slate-400 flex items-center gap-1.5">
          <YdInlineBusy inverse />
          Speichern…
        </span>
      );
    }
    if (saveStatus === "error") {
      return (
        <span className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3" strokeWidth={2} />
          Fehler: {saveError}
        </span>
      );
    }
    if (saveStatus === "saved" && lastSavedAt) {
      // Relative label; time-based read for display only.
      // eslint-disable-next-line react-hooks/purity -- intentional wall clock for "saved X ago"
      const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
      const label =
        seconds < 5
          ? "gerade eben"
          : seconds < 60
            ? `vor ${seconds}s`
            : `vor ${Math.floor(seconds / 60)}min`;
      return (
        <span className="text-xs text-green-400 flex items-center gap-1.5">
          <Check className="w-3 h-3" strokeWidth={2} />
          Gespeichert {label}
        </span>
      );
    }
    return null;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-3 sm:px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => router.push("/journal")}
            className="flex shrink-0 items-center gap-1.5 rounded-lg p-2 -m-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white sm:gap-2"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Journal</span>
          </button>
          <span className="hidden text-slate-600 sm:inline">·</span>
          <span
            className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-medium sm:px-2.5 sm:py-1 sm:text-xs ${
              status === "published"
                ? "border-green-500/20 bg-green-500/10 text-green-400"
                : "border-slate-600 bg-slate-700 text-slate-300"
            }`}
          >
            {status === "published" ? "Veröffentlicht" : "Entwurf"}
          </span>
          <span className="hidden min-w-0 truncate sm:inline">
            {renderSaveStatus()}
          </span>
        </div>

        <div className="flex shrink-0 items-center">
          {status === "published" ? (
            <button
              type="button"
              onClick={onUnpublish}
              disabled={isPending}
              className="rounded-lg bg-slate-700 px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600 sm:px-4 sm:text-sm"
            >
              Zurück in Entwurf
            </button>
          ) : (
            <button
              type="button"
              onClick={onPublish}
              disabled={isPending || !canPublish}
              className="rounded-lg bg-green-600 px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 sm:px-4 sm:text-sm"
              title={!canPublish ? "Titel, Inhalt und Thema erforderlich" : ""}
            >
              Veröffentlichen
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
