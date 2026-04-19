"use client";

import { useState, useRef } from "react";
import { Upload, X, User } from "lucide-react";
import {
  uploadPortraitPhoto,
  deletePortraitPhoto,
} from "@/app/(protected)/profile/editor/actions";

interface SectionPhotoProps {
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
}

export function SectionPhoto({ photoUrl, onPhotoChange }: SectionPhotoProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadPortraitPhoto(formData);
    setUploading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.url) {
      onPhotoChange(result.url);
    }
  };

  const handleDelete = async () => {
    const result = await deletePortraitPhoto();
    if (!result.error) {
      onPhotoChange(null);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">
            VI
          </span>
          <h2 className="font-serif text-3xl font-light">Portrait</h2>
        </div>
        <p className="text-sm text-text-secondary">
          Optional. Wenn leer, wird nur der Name angezeigt. JPG, PNG oder WEBP.
          Max. 10 MB.
        </p>
      </div>

      {photoUrl ? (
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt="Portrait"
            className="w-32 h-40 object-cover border border-border"
          />
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-danger hover:underline flex items-center gap-1.5"
            >
              <X className="w-3 h-3" strokeWidth={2} />
              Portrait entfernen
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-text-primary hover:underline flex items-center gap-1.5"
            >
              <Upload className="w-3 h-3" strokeWidth={2} />
              Anderes Foto hochladen
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-text-primary/50 max-w-md"
        >
          <User className="w-8 h-8 mx-auto text-text-tertiary mb-2" strokeWidth={1.5} />
          <p className="text-sm font-medium">Portrait hochladen</p>
          <p className="text-xs text-text-tertiary mt-1">Klicken zum Auswählen</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {uploading && (
        <p className="text-sm text-text-secondary">Wird hochgeladen…</p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </section>
  );
}
