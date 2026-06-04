"use client";

import { useEffect, useRef, useState } from "react";
import {
  ImageIcon,
  Download,
  Loader2,
  Check,
  Maximize2,
  AlertCircle,
} from "lucide-react";
import { saveAs } from "file-saver";
import {
  safeSubmissionPhotoDownloadErrorMessage,
  submissionPhotoDownloadErrors,
} from "@/lib/inbox/submission-photo-download-errors";
import { cn } from "@/lib/utils";

interface Photo {
  id: string;
  sort_order: number;
  signed_url: string | null;
}

interface PhotoViewerProps {
  /** Fall-ID aus der Server-Page — eine Quelle der Wahrheit für ZIP-Download (nicht nur URL-Param). */
  submissionId: string;
  photos: Photo[];
  patientName: string;
  /** Zusätzliche Klassen am Wurzel-Container (z. B. Tracker V11). */
  className?: string;
  /** Standard `true`. In Demo-Ansichten ohne echte Submission `false` (kein Server-ZIP). */
  enableZipDownload?: boolean;
  /** Optionales `alt` für das Hauptbild (z. B. Vorschau mit neutralem Beispielbild). */
  primaryImageAlt?: string;
  /** Leerzustand ohne Fotos — Standard produktbezogen; in der Vorschau sachlich überschreiben. */
  noPhotosPrimaryText?: string;
  /** `aria-label` im Leerzustand ohne Fotos; Standard inkl. Patientenname. */
  noPhotosAriaLabel?: string;
  /** Hinweis, wenn das Hauptbild nicht geladen werden kann (z. B. Vorschau). */
  imageUnavailableText?: string;
}

type ZipDownloadStatus = "idle" | "loading" | "success" | "error";

function PhotoViewerMainImage({
  imageUrl,
  altText,
  unavailableText,
}: {
  imageUrl: string;
  altText: string;
  unavailableText: string;
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  if (loadFailed) {
    return (
      <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 px-4">
        <ImageIcon className="h-14 w-14 text-[#94A3B8]/45" strokeWidth={1} aria-hidden />
        <p className="text-center text-[13px] font-medium" style={{ color: "#64748B" }}>
          {unavailableText}
        </p>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URLs / Demo-Assets
    <img
      src={imageUrl}
      alt={altText}
      className="block w-full object-cover"
      style={{
        maxHeight: "220px",
        filter: "saturate(0.92) contrast(0.96)",
      }}
      onError={() => setLoadFailed(true)}
    />
  );
}

function PhotoViewerThumb({
  imageUrl,
}: {
  imageUrl: string;
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  if (loadFailed || !imageUrl) {
    return <ImageIcon className="m-auto h-5 w-5 text-[#94A3B8]/50" strokeWidth={1} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt=""
      className="h-full w-full object-cover"
      onError={() => setLoadFailed(true)}
    />
  );
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Bildbereich — Figma: maxHeight 220px. **Leerzustände:** keine Fotos = sachlicher Hinweis (optional
 * für Vorschau überschreibbar); fehlende URL am Hauptbild = derselbe Hinweis wie bei Ladefehler.
 * **Ladefehler:** Hauptbild per `onError` wie fehlende URL.
 * **ZIP:** `downloadSubmissionPhotos` nur per dynamischem Import beim Klick (geschützte Inbox);
 * `enableZipDownload={false}` lädt das Modul nicht und blendet ZIP aus.
 * **Vorschau:** ohne ZIP kein `cursor-pointer` auf der Bildfläche — Vergrößern nur über das Symbol oben rechts.
 * **ZIP-Fehler** nur über `safeSubmissionPhotoDownloadErrorMessage`. **Daten:** an den Client nur
 * `id` / `sort_order` / `signed_url` — kein Storage-Pfad im Props-Bundle.
 */
export function PhotoViewer({
  submissionId,
  photos,
  patientName,
  className,
  enableZipDownload = true,
  primaryImageAlt,
  noPhotosPrimaryText,
  noPhotosAriaLabel,
  imageUnavailableText,
}: PhotoViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<ZipDownloadStatus>("idle");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [hoverImage, setHoverImage] = useState(false);
  const prevSubmissionIdRef = useRef(submissionId);

  /* ZIP-/Download-UI und Thumbnail-Auswahl bei Submission-Wechsel zurücksetzen. */
  /* eslint-disable react-hooks/set-state-in-effect -- bewusst bei submissionId neu initialisieren */
  useEffect(() => {
    setDownloadStatus("idle");
    setDownloadError(null);
    if (prevSubmissionIdRef.current !== submissionId) {
      prevSubmissionIdRef.current = submissionId;
      setSelectedIndex(0);
    }
  }, [submissionId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const hasPhotos = photos.length > 0;
  const idx = hasPhotos
    ? Math.min(Math.max(0, selectedIndex), photos.length - 1)
    : 0;
  const selectedUrlForReset = hasPhotos ? photos[idx]?.signed_url ?? null : null;
  const mainImageMountKey = `${submissionId}:${selectedUrlForReset ?? ""}`;

  if (!hasPhotos) {
    const emptyTitle =
      noPhotosPrimaryText?.trim() || "Keine Fotos bei dieser Einsendung.";
    const emptyAria =
      noPhotosAriaLabel?.trim() ||
      `Keine Fotos bei dieser Einsendung — ${patientName}`;
    return (
      <div
        className="flex flex-col items-center justify-center rounded-[12px] bg-[#F1F5F9]"
        style={{ maxHeight: "220px", minHeight: "160px" }}
        role="status"
        aria-live="polite"
        aria-label={emptyAria}
      >
        <ImageIcon className="h-12 w-12 text-[#94A3B8]/50" strokeWidth={1} aria-hidden />
        <p className="mt-2 text-center text-[14px] font-medium" style={{ color: "#64748B" }}>
          {emptyTitle}
        </p>
      </div>
    );
  }

  const selected = photos[idx];
  const selectedUrl = selected?.signed_url;
  const isLoading = downloadStatus === "loading";

  async function handleDownloadAllPhotos() {
    if (!enableZipDownload || isLoading || photos.length === 0 || !submissionId.trim()) return;
    setDownloadStatus("loading");
    setDownloadError(null);

    try {
      const { downloadSubmissionPhotos } = await import(
        "@/app/(protected)/inbox/[id]/actions"
      );
      const result = await downloadSubmissionPhotos(submissionId);
      if (result.error || !result.zipBase64 || !result.filename) {
        setDownloadStatus("error");
        setDownloadError(safeSubmissionPhotoDownloadErrorMessage(result.error));
        return;
      }

      const bytes = base64ToBytes(result.zipBase64);
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      const blob = new Blob([buffer], { type: "application/zip" });
      saveAs(blob, result.filename);

      setDownloadStatus("success");
      window.setTimeout(() => {
        setDownloadStatus("idle");
      }, 1800);
    } catch {
      setDownloadStatus("error");
      setDownloadError(submissionPhotoDownloadErrors.generic);
    }
  }

  function openFullscreen() {
    if (selectedUrl && typeof window !== "undefined") {
      window.open(selectedUrl, "_blank", "noopener,noreferrer");
    }
  }

  const mainUnavailable =
    imageUnavailableText?.trim() || "Für dieses Bild liegt keine Vorschau vor.";

  return (
    <div
      className={cn("yd-tracker-v14-photo space-y-4 overflow-x-hidden", className)}
      aria-label={`Fotos: ${patientName}`}
    >
      <div
        className={enableZipDownload ? "relative cursor-pointer" : "relative cursor-default"}
        onMouseEnter={() => setHoverImage(true)}
        onMouseLeave={() => setHoverImage(false)}
      >
        <div
          className="overflow-hidden bg-[#EEF2F6]"
          style={{
            borderRadius: "12px",
            maxHeight: "220px",
          }}
        >
          {selectedUrl ? (
            <PhotoViewerMainImage
              key={mainImageMountKey}
              imageUrl={selectedUrl}
              altText={
                primaryImageAlt?.trim() ||
                `Klinisches Bild ${idx + 1} von ${photos.length}`
              }
              unavailableText={mainUnavailable}
            />
          ) : (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 px-4">
              <ImageIcon className="h-14 w-14 text-[#94A3B8]/45" strokeWidth={1} aria-hidden />
              <p className="text-center text-[13px] font-medium" style={{ color: "#64748B" }}>
                {mainUnavailable}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openFullscreen();
          }}
          disabled={!selectedUrl}
          className="absolute flex cursor-pointer items-center justify-center transition duration-160 ease-out disabled:pointer-events-none disabled:opacity-0"
          style={{
            top: "10px",
            right: "10px",
            width: "44px",
            height: "44px",
            borderRadius: "8px",
            background: "rgba(255, 255, 255, 0.95)",
            opacity: hoverImage && selectedUrl ? 1 : 0,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
            backdropFilter: "blur(8px)",
          }}
          aria-label={
            enableZipDownload
              ? "Bild vergrößern"
              : "Beispielbild in neuem Tab (nur Darstellung, keine Bearbeitung)"
          }
        >
          <Maximize2 className="h-[18px] w-[18px]" style={{ color: "#64748B" }} strokeWidth={1.75} />
        </button>
      </div>

      <div className="yd-tracker-v14-photo__footer flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="yd-tracker-v14-photo__counter text-[12px] font-medium text-[#94A3B8]">
          {photos.length > 1 ? `${idx + 1} / ${photos.length}` : null}
        </p>
        {enableZipDownload ? (
        <button
          type="button"
          onClick={handleDownloadAllPhotos}
          disabled={isLoading}
          aria-busy={isLoading}
          aria-label={
            isLoading
              ? "Bilderexport wird vorbereitet"
              : downloadStatus === "error"
                ? "Bilderexport erneut versuchen"
                : "Klinische Bilder als ZIP exportieren"
          }
          className="yd-tracker-v14-photo__export inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 self-start rounded-md border-0 bg-transparent px-2 py-0.5 text-[12px] font-medium text-[rgba(12,25,41,0.38)] underline-offset-2 transition hover:text-[rgba(12,25,41,0.58)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(12,25,41,0.12)] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
          ) : downloadStatus === "success" ? (
            <Check className="h-3.5 w-3.5 text-[#047857]" strokeWidth={2} />
          ) : (
            <Download className="h-3.5 w-3.5 opacity-60" strokeWidth={1.75} />
          )}
          {isLoading
            ? "Export…"
            : downloadStatus === "success"
              ? "Gestartet"
              : downloadStatus === "error"
                ? "Erneut"
                : "Bilder exportieren"}
        </button>
        ) : null}
      </div>

      {enableZipDownload && downloadStatus === "error" && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="flex items-start gap-2 rounded-[10px] bg-[#FEF2F2] px-3 py-2.5 text-[14px] leading-relaxed text-[#B91C1C]"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={2} aria-hidden />
          <span>
            {downloadError || submissionPhotoDownloadErrors.generic}
          </span>
        </div>
      )}

      {photos.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(12,25,41,0.15)] ${
                i === idx
                  ? "border-[#1A4F9C] ring-1 ring-[#1A4F9C]/25"
                  : "border-transparent hover:border-[#E2E8F0]"
              }`}
            >
              {photo.signed_url ? (
                <PhotoViewerThumb
                  key={`${photo.id}:${photo.signed_url}`}
                  imageUrl={photo.signed_url}
                />
              ) : (
                <ImageIcon className="m-auto h-5 w-5 text-[#94A3B8]/50" strokeWidth={1} />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
