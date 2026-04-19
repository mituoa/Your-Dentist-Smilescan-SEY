"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, useRef } from "react";
import { Upload, Palette } from "lucide-react";
import {
  uploadLogo,
  removeLogo,
  saveAccentColor,
} from "@/app/(protected)/settings/actions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";

interface BrandingSectionProps {
  logoUrl: string | null;
  accentColor: string;
}

const PRESET_COLORS = [
  { name: "Teal (Standard)", value: "#0F6E56" },
  { name: "Navy", value: "#1E3A5F" },
  { name: "Bordeaux", value: "#6E1F2E" },
  { name: "Forest", value: "#2F4F2F" },
  { name: "Charcoal", value: "#2A2A2A" },
  { name: "Terracotta", value: "#A0532E" },
];

export function BrandingSection({ logoUrl, accentColor }: BrandingSectionProps) {
  const router = useRouter();
  const [color, setColor] = useState(accentColor);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setColor(accentColor);
  }, [accentColor]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (file: File) => {
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const result = await uploadLogo(formData);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  const handleLogoRemove = () => {
    startTransition(async () => {
      await removeLogo();
      router.refresh();
    });
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    startTransition(async () => {
      await saveAccentColor(newColor);
      router.refresh();
    });
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        number="V"
        title="Erscheinungsbild"
        description="Logo und Akzentfarbe für Ihr öffentliches Profil."
      />

      <div className="max-w-2xl space-y-8">
        <div>
          <Label>Logo</Label>
          <p className="text-xs text-text-tertiary mb-3">
            Erscheint anstelle des Praxis-Namens im Header. Optimal: rechteckig,
            min. 200×60px. PNG mit transparentem Hintergrund empfohlen.
          </p>

          {logoUrl ? (
            <div className="flex items-start gap-4">
              <div className="p-6 border border-border rounded-lg bg-paper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="max-h-16 max-w-[200px] object-contain"
                />
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs hover:underline"
                >
                  Neues Logo hochladen
                </button>
                <button
                  type="button"
                  onClick={handleLogoRemove}
                  disabled={isPending}
                  className="block text-xs text-danger hover:underline"
                >
                  Logo entfernen
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-md border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-brand/50"
            >
              <Upload
                className="w-6 h-6 mx-auto text-text-tertiary mb-2"
                strokeWidth={1.5}
              />
              <p className="text-sm">Logo hochladen</p>
              <p className="text-xs text-text-tertiary mt-1">
                PNG, JPG, WEBP, SVG · max 5 MB
              </p>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleLogoUpload(f);
            }}
          />
          {error && <p className="text-xs text-danger mt-2">{error}</p>}
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4" strokeWidth={1.75} />
            Akzentfarbe
          </Label>
          <p className="text-xs text-text-tertiary mb-3">
            Farbe für Buttons und Akzente im öffentlichen Profil. Hintergrund und
            Schrift bleiben unverändert.
          </p>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleColorChange(preset.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs border rounded-full transition-all ${
                    color === preset.value
                      ? "border-ink bg-ink text-cream"
                      : "border-border hover:border-ink/50"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.value }}
                  />
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-10 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9A-Fa-f]{6}$/.test(v)) handleColorChange(v);
                  else setColor(v);
                }}
                className="px-3 py-2 text-sm bg-surface-card border border-border rounded font-mono w-32"
                placeholder="#0F6E56"
              />
              <span className="text-xs text-text-tertiary">Eigene Farbe</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
