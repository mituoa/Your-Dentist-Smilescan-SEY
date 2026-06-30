"use client";

import * as React from "react";
import type { DragEvent } from "react";

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

function borderClass(
  file: File | null,
  docStatus: DocStatus,
  dragActive: boolean,
  sideError: string | null | undefined
): string {
  if (sideError) return "border-amber-200/90 bg-amber-50/35";
  if (dragActive) return "border-[#0284C7]/40 bg-[#0284C7]/5";
  if (!file) return "border-slate-200/90 bg-slate-50/35";
  if (docStatus === "checking") return "border-slate-200/90 bg-slate-50/50";
  if (docStatus === "warn") return "border-amber-200/90 bg-amber-50/35";
  return "border-green-200/90 bg-green-50/45";
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
        className={`relative rounded-xl border border-dashed px-4 py-4 transition-colors duration-200 max-md:min-h-[148px] sm:px-5 sm:py-5 ${borderClass(file, docStatus, dragActive, sideError)}`}
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

        <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-600">{title}</p>

        {file ? (
          <div className="mt-3">
            {docStatus !== "checking" ? (
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-green-800">
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Dokument bereit zur Prüfung
              </p>
            ) : null}
            {preview ? (
              <div className="mb-3 mt-3 overflow-hidden rounded-lg border border-green-200/70 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt={title} className="h-28 w-full object-cover" />
              </div>
            ) : null}
            <p className="truncate text-[13px] font-medium text-gray-900">{file.name}</p>
            <p className="mt-0.5 text-[12px] text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

            {docStatus === "checking" ? (
              <p className="mt-2 flex items-center gap-1.5 text-[12px] text-slate-600" aria-live="polite">
                <span className="yd-auth-loading-pulse !h-3 !w-3" aria-hidden />
                Nachweis wird geprüft…
              </p>
            ) : qualityHint ? (
              <p
                className={`mt-2 flex items-start gap-1.5 text-[12px] ${
                  docStatus === "success" ? "font-medium text-green-700" : "text-amber-800"
                }`}
              >
                {docStatus === "success" ? (
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : null}
                <span>{qualityHint}</span>
              </p>
            ) : null}

            <button
              type="button"
              onClick={onClear}
              className="mt-3 text-[13px] font-medium yd-auth-link hover:text-[#0369A1]"
            >
              Andere Datei wählen
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            <label
              htmlFor={fileInputId}
              className="inline-flex h-[44px] cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Dokument auswählen
            </label>
            <p className="text-[11px] leading-relaxed text-gray-500">
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
