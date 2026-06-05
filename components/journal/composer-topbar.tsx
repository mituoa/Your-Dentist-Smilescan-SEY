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
        <span className="yd-journal-composer__save flex items-center gap-1.5">
          <YdInlineBusy />
          Speichern…
        </span>
      );
    }
    if (saveStatus === "error") {
      return (
        <span className="yd-journal-composer__save flex items-center gap-1.5 text-red-600">
          <AlertCircle className="h-3 w-3" strokeWidth={2} />
          {saveError}
        </span>
      );
    }
    if (saveStatus === "saved" && lastSavedAt) {
      // eslint-disable-next-line react-hooks/purity -- wall clock for relative save label
      const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
      const label =
        seconds < 5
          ? "gerade eben"
          : seconds < 60
            ? `vor ${seconds}s`
            : `vor ${Math.floor(seconds / 60)} Min.`;
      return (
        <span className="yd-journal-composer__save flex items-center gap-1.5 text-emerald-600">
          <Check className="h-3 w-3" strokeWidth={2} />
          Gespeichert {label}
        </span>
      );
    }
    return null;
  };

  return (
    <header className="yd-journal-composer__bar">
      <div className="yd-journal-composer__bar-inner">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/journal")}
            className="yd-journal-composer__back"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Journal
          </button>
          {renderSaveStatus()}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {status === "published" ? (
            <button
              type="button"
              onClick={onUnpublish}
              disabled={isPending}
              className="yd-journal-composer__publish yd-journal-composer__publish--ghost"
            >
              Zurück in Entwurf
            </button>
          ) : (
            <button
              type="button"
              onClick={onPublish}
              disabled={isPending || !canPublish}
              className="yd-journal-composer__publish"
              title={
                !canPublish
                  ? "Titel, Inhalt und Wissensbereich erforderlich"
                  : "Für Patienten veröffentlichen"
              }
            >
              Veröffentlichen
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
