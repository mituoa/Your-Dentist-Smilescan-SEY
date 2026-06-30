"use client";

import * as React from "react";
import type { DragEvent } from "react";
import { Camera, Check, ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type DocStatus = "idle" | "checking" | "success" | "warn";

type RegisterLicenseSideCardProps = {
  title: string;
  sideId: string;
  file: File | null;
  preview: string | null;
  docStatus: DocStatus;
  qualityHint: string;
  sideError?: string | null;
  dragActive: boolean;
  onDragEnter: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onFilePick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
};

function cardStateClass(
  file: File | null,
  docStatus: DocStatus,
  dragActive: boolean,
  sideError: string | null | undefined
): string {
  if (sideError) return "yd-reg-proof-card--error";
  if (dragActive) return "yd-reg-proof-card--drag";
  if (!file) return "";
  if (docStatus === "checking") return "yd-reg-proof-card--checking";
  if (docStatus === "warn") return "yd-reg-proof-card--warn";
  return "yd-reg-proof-card--ready";
}

export function RegisterLicenseSideCard({
  title,
  sideId,
  file,
  preview,
  docStatus,
  qualityHint,
  sideError,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFilePick,
  onClear,
}: RegisterLicenseSideCardProps) {
  const fileInputId = `${sideId}-file`;

  return (
    <div className="min-w-0">
      <div
        className={cn("yd-reg-proof-card", cardStateClass(file, docStatus, dragActive, sideError))}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <input
          id={fileInputId}
          type="file"
          accept="image/jpeg,image/png,image/jpg,application/pdf,.pdf"
          onChange={onFilePick}
          className="sr-only"
        />

        <p className="yd-reg-proof-card__label">{title}</p>

        {file ? (
          <div className="mt-1">
            {docStatus !== "checking" ? (
              <p className="yd-reg-proof-card__status">
                <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                Dokument bereit zur Prüfung
              </p>
            ) : null}
            {preview ? (
              <div className="yd-reg-proof-card__preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt={title} />
              </div>
            ) : null}
            <p className="yd-reg-proof-card__filename">{file.name}</p>
            <p className="yd-reg-proof-card__filesize">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

            {docStatus === "checking" ? (
              <p className="yd-reg-proof-card__quality yd-reg-proof-card__quality--ok" aria-live="polite">
                <span className="yd-auth-loading-pulse !h-3 !w-3 shrink-0" aria-hidden />
                Nachweis wird geprüft…
              </p>
            ) : qualityHint ? (
              <p
                className={cn(
                  "yd-reg-proof-card__quality",
                  docStatus === "success" ? "yd-reg-proof-card__quality--ok" : "yd-reg-proof-card__quality--warn"
                )}
              >
                {docStatus === "success" ? (
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                ) : null}
                <span>{qualityHint}</span>
              </p>
            ) : null}

            <button type="button" onClick={onClear} className="yd-reg-proof-card__change">
              Andere Datei wählen
            </button>
          </div>
        ) : (
          <div className="yd-reg-proof-card__empty">
            <label htmlFor={fileInputId} className="yd-reg-proof-card__pick">
              <span className="yd-reg-proof-card__pick-icon" aria-hidden>
                <Camera className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              Dokument auswählen
            </label>
            <p className="yd-reg-proof-card__hint">
              <ImageIcon className="mr-1 inline h-3 w-3 -translate-y-px opacity-70" strokeWidth={2} aria-hidden />
              Foto, Kamera oder PDF — über die Auswahl Ihres Geräts (max. 10 MB)
            </p>
          </div>
        )}
      </div>
      {sideError ? (
        <p className="mt-2 text-[12px] leading-relaxed text-amber-900" role="alert">
          {sideError}
        </p>
      ) : null}
    </div>
  );
}
