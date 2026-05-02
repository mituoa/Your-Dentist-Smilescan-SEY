"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, AlertCircle } from "lucide-react";

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
          <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
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
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/journal")}
            className="flex items-center gap-2 rounded-lg p-2 -m-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            Journal
          </button>
          <span className="text-slate-600">·</span>
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${
              status === "published"
                ? "border-green-500/20 bg-green-500/10 text-green-400"
                : "border-slate-600 bg-slate-700 text-slate-300"
            }`}
          >
            {status === "published" ? "Veröffentlicht" : "Entwurf"}
          </span>
          {renderSaveStatus()}
        </div>

        <div className="flex items-center gap-3">
          {status === "published" ? (
            <button
              type="button"
              onClick={onUnpublish}
              disabled={isPending}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
            >
              Zurück in Entwurf
            </button>
          ) : (
            <button
              type="button"
              onClick={onPublish}
              disabled={isPending || !canPublish}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
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
