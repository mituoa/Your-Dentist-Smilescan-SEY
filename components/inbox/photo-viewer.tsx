"use client";

import { useState } from "react";
import { ImageIcon, Download } from "lucide-react";

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

export function PhotoViewer({ photos, patientName }: PhotoViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

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
            {selectedUrl ? (
              <a
                href={selectedUrl}
                download
                className="text-xs text-brand flex items-center gap-1.5 hover:underline"
              >
                <Download className="w-3 h-3" strokeWidth={1.75} />
                Download
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="text-xs text-text-tertiary flex items-center gap-1.5"
                title="Vorschau nicht verfügbar"
              >
                <Download className="w-3 h-3" strokeWidth={1.75} />
                Download
              </button>
            )}
          </div>
        </div>
      </div>

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
