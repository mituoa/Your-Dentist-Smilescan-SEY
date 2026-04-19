"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

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
        <span className="text-xs text-white/40 flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
          Speichern…
        </span>
      );
    }
    if (saveStatus === "error") {
      return <span className="text-xs text-red-400">Fehler: {saveError}</span>;
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
        <span className="text-xs text-white/40 flex items-center gap-1.5">
          <Check className="w-3 h-3" strokeWidth={2} />
          Gespeichert {label}
        </span>
      );
    }
    return null;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-black/90 backdrop-blur border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/journal")}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            Journal
          </button>
          <span className="text-white/20">·</span>
          <span className="text-xs uppercase tracking-wider text-white/40">
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
              className="px-4 py-2 text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors disabled:opacity-50"
            >
              Zurück in Entwurf
            </button>
          ) : (
            <button
              type="button"
              onClick={onPublish}
              disabled={isPending || !canPublish}
              className="px-5 py-2 bg-white text-black text-xs uppercase tracking-wider font-medium rounded hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
