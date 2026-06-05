"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";

import { uploadLogo, removeLogo } from "@/app/(protected)/settings/actions";

type ProfileLogoUploadProps = {
  logoUrl: string | null;
  onLogoChange: (url: string | null) => void;
  disabled?: boolean;
};

export function ProfileLogoUpload({
  logoUrl,
  onLogoChange,
  disabled = false,
}: ProfileLogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadLogo(fd);
      if (result.error) setError(result.error);
      else if (result.url) onLogoChange(result.url);
    } catch {
      setError("Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  };

  const onRemove = async () => {
    setUploading(true);
    setError(null);
    try {
      const result = await removeLogo();
      if (result.error) setError(result.error);
      else onLogoChange(null);
    } catch {
      setError("Entfernen fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  };

  const locked = disabled || uploading;

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Logo</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={locked}
          onClick={() => inputRef.current?.click()}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-300/35 bg-white/80 transition hover:border-slate-400/50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={logoUrl ? "Logo ändern" : "Logo hochladen"}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-full w-full object-contain p-1.5" />
          ) : (
            <span className="text-[11px] font-semibold text-slate-500">+</span>
          )}
        </button>
        <button
          type="button"
          disabled={locked}
          onClick={() => inputRef.current?.click()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300/45 bg-white/50 text-slate-400 transition hover:border-slate-400/55 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Logo hinzufügen"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <p className="text-[11px] leading-snug text-slate-500">
          Empfohlen: 512 × 512px, PNG oder SVG.
          {uploading ? <span className="mt-1 block text-slate-400">Wird hochgeladen…</span> : null}
        </p>
      </div>
      {logoUrl ? (
        <button
          type="button"
          disabled={locked}
          onClick={() => void onRemove()}
          className="mt-2 text-[11px] text-slate-400 underline-offset-2 transition hover:text-slate-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Logo entfernen
        </button>
      ) : null}
      {error ? (
        <p className="mt-2 text-[11px] leading-relaxed text-slate-600" role="status">
          {error}
        </p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void onPick(f);
        }}
      />
    </div>
  );
}
