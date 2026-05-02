"use client";

import { useState } from "react";
import { ImageIcon, Download, Loader2, Check } from "lucide-react";
import { saveAs } from "file-saver";
import { downloadSubmissionPhotos } from "@/app/(protected)/inbox/[id]/actions";
import { pilotGlassPanel } from "@/lib/pilot-surface";
import { useParams } from "next/navigation";

interface Photo {
  id: string;
  storage_path: string;
  sort_order: number;
  signed_url: string | null;
}

interface PhotoViewerProps {
  photos: Photo[];
  patientName: string;
}

type ZipDownloadStatus = "idle" | "loading" | "success" | "error";

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function PhotoViewer({
  photos,
  patientName,
}: PhotoViewerProps) {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id || "";
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<ZipDownloadStatus>("idle");
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (photos.length === 0) {
    return (
      <div
        className={`overflow-hidden ${pilotGlassPanel}`}
        aria-label={`Fotos: ${patientName}`}
      >
        <div className="aspect-[4/3] bg-surface-sunken flex flex-col items-center justify-center gap-3">
          <ImageIcon
            className="w-16 h-16 text-text-tertiary/40"
            strokeWidth={1}
          />
          <p className="text-sm font-medium leading-6 text-text-tertiary">
            Noch keine Fotos vorhanden
          </p>
          <p className="max-w-xs px-6 text-center text-sm leading-6 text-text-tertiary/80">
            Sobald der Patient Fotos hochlädt, sehen Sie sie hier.
          </p>
        </div>
      </div>
    );
  }

  const selected = photos[selectedIndex];
  const selectedUrl = selected?.signed_url;
  const isLoading = downloadStatus === "loading";

  async function handleDownloadAllPhotos() {
    if (isLoading || photos.length === 0 || !submissionId) return;
    setDownloadStatus("loading");
    setDownloadError(null);

    try {
      const result = await downloadSubmissionPhotos(submissionId);
      if (result.error || !result.zipBase64 || !result.filename) {
        setDownloadStatus("error");
        setDownloadError(
          result.error || "Download nicht möglich. Bitte erneut versuchen."
        );
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
    } catch (error) {
      console.error("[PhotoViewer] ZIP download failed", error);
      setDownloadStatus("error");
      setDownloadError("Download nicht möglich. Bitte erneut versuchen.");
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5" aria-label={`Fotos: ${patientName}`}>
      <div className={`overflow-hidden ${pilotGlassPanel}`}>
        <div className="aspect-[4/3] bg-surface-sunken flex items-center justify-center relative">
          {selectedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URLs
            <img
              src={selectedUrl}
              alt={`Foto ${selectedIndex + 1}`}
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <ImageIcon
              className="w-24 h-24 text-text-tertiary/40"
              strokeWidth={1}
            />
          )}
          <div className="absolute bottom-3 left-3 right-3 flex min-h-12 flex-col items-stretch gap-2.5 rounded-lg border border-border/70 bg-surface-page/90 px-3 py-2.5 backdrop-blur sm:bottom-4 sm:left-4 sm:right-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
                Fotoübersicht
              </p>
              <span className="text-sm font-medium tabular-nums text-text-secondary">
                {selectedIndex + 1} / {photos.length}
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadAllPhotos}
              disabled={isLoading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md border border-border bg-surface-card px-2.5 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-brand/40 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-0 sm:w-auto sm:shrink-0 sm:py-1.5"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.75} />
              ) : downloadStatus === "success" ? (
                <Check className="w-3 h-3" strokeWidth={1.75} />
              ) : (
                <Download className="w-3 h-3" strokeWidth={1.75} />
              )}
              {isLoading
                ? "ZIP wird erstellt…"
                : downloadStatus === "success"
                  ? "Download gestartet"
                  : downloadStatus === "error"
                    ? "Erneut versuchen"
                    : "Alle Fotos laden"}
            </button>
          </div>
        </div>
      </div>
      {downloadStatus === "error" && (
        <p className="text-sm leading-5 text-danger">
          {downloadError || "Download nicht möglich. Bitte erneut versuchen."}
        </p>
      )}

      {photos.length > 1 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-4 lg:gap-3">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative aspect-square bg-surface-sunken rounded-md border-2 transition-colors overflow-hidden flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                i === selectedIndex
                  ? "border-brand"
                  : "border-transparent hover:border-border"
              }`}
            >
              {photo.signed_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.signed_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <ImageIcon
                  className="w-6 h-6 text-text-tertiary/50"
                  strokeWidth={1}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
