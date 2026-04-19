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
      <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3 block">
        Cover-Foto (optional)
      </label>

      {coverUrl ? (
        <div className="relative w-full aspect-[16/9] rounded overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange(null)}
            className="absolute top-3 right-3 p-2 bg-black/70 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
          className="border border-dashed border-white/20 rounded p-8 cursor-pointer hover:border-white/40 transition-colors text-center"
        >
          {uploading ? (
            <p className="text-sm text-white/60">Wird hochgeladen…</p>
          ) : (
            <>
              <ImageIcon
                className="w-6 h-6 text-white/40 mx-auto mb-2"
                strokeWidth={1.5}
              />
              <p className="text-xs text-white/60">Cover-Foto hinzufügen · max 10 MB</p>
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

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
