"use client";

import { useState } from "react";
import { ImageIcon, Download, Loader2, Check } from "lucide-react";
import { saveAs } from "file-saver";
import { downloadSubmissionPhotos } from "@/app/(protected)/inbox/[id]/actions";
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
        className="bg-surface-card border border-border rounded-lg overflow-hidden"
        aria-label={`Fotos: ${patientName}`}
      >
        <div className="aspect-[4/3] bg-surface-sunken flex flex-col items-center justify-center gap-3">
          <ImageIcon
            className="w-16 h-16 text-text-tertiary/40"
            strokeWidth={1}
          />
          <p className="text-sm text-text-tertiary">Keine Fotos vorhanden</p>
          <p className="text-xs text-text-tertiary/70 max-w-xs text-center px-6">
            Sobald Patienten Fotos hochladen, erscheinen sie hier.
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
          result.error || "Download nicht möglich, bitte erneut versuchen"
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
      setDownloadError("Download nicht möglich, bitte erneut versuchen");
    }
  }

  return (
    <div className="space-y-4" aria-label={`Fotos: ${patientName}`}>
      <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
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
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-surface-page/90 backdrop-blur rounded px-3 py-2">
            <span className="text-xs font-mono text-text-secondary">
              Foto {selectedIndex + 1} von {photos.length}
            </span>
            <button
              type="button"
              onClick={handleDownloadAllPhotos}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-border bg-surface-card text-text-secondary hover:text-text-primary hover:border-brand/40 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.75} />
              ) : downloadStatus === "success" ? (
                <Check className="w-3 h-3" strokeWidth={1.75} />
              ) : (
                <Download className="w-3 h-3" strokeWidth={1.75} />
              )}
              {isLoading
                ? "Wird vorbereitet…"
                : downloadStatus === "success"
                  ? "Heruntergeladen"
                  : downloadStatus === "error"
                    ? "Fehler"
                    : "Alle Fotos laden"}
            </button>
          </div>
        </div>
      </div>
      {downloadStatus === "error" && (
        <p className="text-xs text-danger">
          {downloadError || "Download nicht möglich, bitte erneut versuchen"}
        </p>
      )}

      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative aspect-square bg-surface-sunken rounded border-2 transition-colors overflow-hidden flex items-center justify-center ${
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
