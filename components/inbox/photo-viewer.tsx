"use client";

import { useState } from "react";
import { ImageIcon, Download, Loader2, Check, Maximize2 } from "lucide-react";
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

/**
 * Bildbereich — Figma-Referenz: maxHeight 220px, radius 12px, Hover-Expand-Chrome.
 */
export function PhotoViewer({ photos, patientName }: PhotoViewerProps) {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id || "";
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<ZipDownloadStatus>("idle");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [hoverImage, setHoverImage] = useState(false);

  if (photos.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-[12px] bg-[#F1F5F9]"
        style={{ maxHeight: "220px", minHeight: "160px" }}
        aria-label={`Fotos: ${patientName}`}
      >
        <ImageIcon className="h-12 w-12 text-[#94A3B8]/50" strokeWidth={1} />
        <p className="mt-2 text-[14px] font-medium" style={{ color: "#64748B" }}>
          Noch keine Fotos
        </p>
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

  function openFullscreen() {
    if (selectedUrl && typeof window !== "undefined") {
      window.open(selectedUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="space-y-4" aria-label={`Fotos: ${patientName}`}>
      <div
        className="relative cursor-pointer"
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
            // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URLs
            <img
              src={selectedUrl}
              alt={`Klinisches Bild ${selectedIndex + 1} von ${photos.length}`}
              className="block w-full object-cover"
              style={{
                maxHeight: "220px",
                filter: "saturate(0.92) contrast(0.96)",
              }}
            />
          ) : (
            <div className="flex min-h-[160px] items-center justify-center">
              <ImageIcon className="h-14 w-14 text-[#94A3B8]/45" strokeWidth={1} />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openFullscreen();
          }}
          className="absolute flex cursor-pointer items-center justify-center transition duration-160 ease-out"
          style={{
            top: "12px",
            right: "12px",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(255, 255, 255, 0.95)",
            opacity: hoverImage ? 1 : 0,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
            backdropFilter: "blur(8px)",
          }}
          aria-label="Bild vergrößern"
        >
          <Maximize2 className="h-[18px] w-[18px]" style={{ color: "#64748B" }} strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px]" style={{ color: "#64748B" }}>
          Bild {selectedIndex + 1} von {photos.length}
        </p>
        <button
          type="button"
          onClick={handleDownloadAllPhotos}
          disabled={isLoading}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium transition hover:border-[#2B6FE8]/40 hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.2)] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          style={{ color: "#475569" }}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
          ) : downloadStatus === "success" ? (
            <Check className="h-4 w-4 text-[#047857]" strokeWidth={2} />
          ) : (
            <Download className="h-4 w-4 opacity-70" strokeWidth={1.75} />
          )}
          {isLoading
            ? "ZIP wird erstellt…"
            : downloadStatus === "success"
              ? "Download gestartet"
              : downloadStatus === "error"
                ? "Erneut versuchen"
                : "Alle Fotos laden (ZIP)"}
        </button>
      </div>

      {downloadStatus === "error" && (
        <p className="text-[14px] leading-relaxed text-red-700">
          {downloadError || "Download nicht möglich. Bitte erneut versuchen."}
        </p>
      )}

      {photos.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.35)] ${
                i === selectedIndex
                  ? "border-[#2B6FE8] ring-1 ring-[#2B6FE8]/30"
                  : "border-transparent hover:border-[#E2E8F0]"
              }`}
            >
              {photo.signed_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.signed_url}
                  alt=""
                  className="h-full w-full object-cover"
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
