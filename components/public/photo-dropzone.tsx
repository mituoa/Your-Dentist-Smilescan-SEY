"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import {
  MAX_PHOTOS,
  MAX_PHOTO_SIZE_MB,
  validatePhoto,
} from "@/lib/upload/validation";

interface PhotoDropzoneProps {
  onFilesChange: (files: File[]) => void;
}

interface FilePreview {
  file: File;
  preview: string;
}

export function PhotoDropzone({ onFilesChange }: PhotoDropzoneProps) {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles = Array.from(fileList);
    const combined = [...previews.map((p) => p.file), ...newFiles];

    if (combined.length > MAX_PHOTOS) {
      setError(`Maximal ${MAX_PHOTOS} Fotos erlaubt.`);
      return;
    }

    for (const file of newFiles) {
      const result = validatePhoto(file);
      if (!result.valid) {
        setError(result.error || "Ungültige Datei.");
        return;
      }
    }

    setError(null);

    const newPreviews = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    const updated = [...previews, ...newPreviews];
    setPreviews(updated);
    onFilesChange(updated.map((p) => p.file));
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index].preview);
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onFilesChange(updated.map((p) => p.file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-brand/50 hover:bg-surface-sunken/30 transition-colors"
      >
        <Upload
          className="w-8 h-8 text-text-tertiary mx-auto mb-3"
          strokeWidth={1.5}
        />
        <p className="text-sm text-text-primary font-medium mb-1">
          Fotos hochladen
        </p>
        <p className="text-xs text-text-tertiary">
          Klicken oder per Drag & Drop — bis zu {MAX_PHOTOS} Fotos, max.{" "}
          {MAX_PHOTO_SIZE_MB} MB pro Foto
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-xs text-danger mt-2">{error}</p>}

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {previews.map((p, i) => (
            <div
              key={`${p.preview}-${i}`}
              className="relative aspect-square bg-surface-sunken rounded overflow-hidden group"
            >
              <img
                src={p.preview}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Foto entfernen"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <p className="text-xs text-text-tertiary mt-2">
          {previews.length} / {MAX_PHOTOS} Fotos ausgewählt
        </p>
      )}
    </div>
  );
}
