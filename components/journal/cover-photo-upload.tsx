"use client";

import { useState, useRef } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { uploadCoverPhoto } from "@/app/(protected)/journal/actions";

interface CoverPhotoUploadProps {
  coverUrl: string | null;
  onChange: (url: string | null) => void;
}

export function CoverPhotoUpload({ coverUrl, onChange }: CoverPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadCoverPhoto(fd);
    setUploading(false);
    if (result.error) {
      setError(result.error);
    } else if (result.url) {
      onChange(result.url);
    }
  };

  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-slate-900 dark:text-white">
        Cover-Foto (optional)
      </label>

      {coverUrl ? (
        <div className="group relative h-28 w-full overflow-hidden rounded-lg border border-slate-200 sm:h-32 md:h-36 dark:border-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 rounded-lg bg-red-600 p-2 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100"
            type="button"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
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
          className="w-full cursor-pointer rounded-lg border-2 border-dashed border-slate-300 px-4 py-8 text-center text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800/50"
        >
          {uploading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">Wird hochgeladen…</p>
          ) : (
            <>
              <ImageIcon
                className="mx-auto mb-2 h-6 w-6 text-slate-500 dark:text-slate-400"
                strokeWidth={1.5}
              />
              <p className="text-sm font-medium">Foto hochladen</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                JPG, PNG oder WebP, max. 10MB
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
