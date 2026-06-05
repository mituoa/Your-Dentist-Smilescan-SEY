import type { CSSProperties } from "react";

/** Kuratierte Grundfarben für die öffentliche Profilbühne (Patientenbereich). */

export const DEFAULT_PROFILE_BACKGROUND = "#F2EFE9";

export type ProfileBackgroundPreset = {
  name: string;
  value: string;
  gold: string;
};

export const PROFILE_BACKGROUND_PRESETS: ProfileBackgroundPreset[] = [
  { name: "Creme", value: "#F2EFE9", gold: "#9A7B4F" },
  { name: "Warmweiß", value: "#F5F0E8", gold: "#9A7550" },
  { name: "Stein", value: "#EDEAE4", gold: "#8A7560" },
  { name: "Perle", value: "#F0F2F1", gold: "#7A8580" },
  { name: "Rosé", value: "#F3EBE8", gold: "#9A7068" },
  { name: "Nebelblau", value: "#E8EEF0", gold: "#6E8088" },
  { name: "Salbei", value: "#EBF0EA", gold: "#6E8578" },
  { name: "Sand", value: "#F2EDE4", gold: "#9A8268" },
];

export type CarreeTheme = {
  cream: string;
  gold: string;
  ink: string;
  muted: string;
  faint: string;
  uploadBg: string;
  portraitMid: string;
};

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export function normalizeProfileBackgroundHex(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!HEX_RE.test(trimmed)) return null;
  return trimmed.toUpperCase();
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((c) => clampByte(c).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  const srgb = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0]! + 0.7152 * srgb[1]! + 0.0722 * srgb[2]!;
}

function shade(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  const mix = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  return toHex(r + (mix - r) * t, g + (mix - g) * t, b + (mix - b) * t);
}

function deriveGoldFromCream(cream: string): string {
  const { r, g, b } = parseHex(cream);
  return toHex(r * 0.58 + 74, g * 0.52 + 58, b * 0.45 + 38);
}

export function resolveCarreeTheme(background: string | null | undefined): CarreeTheme {
  const cream = normalizeProfileBackgroundHex(background) ?? DEFAULT_PROFILE_BACKGROUND;
  const preset = PROFILE_BACKGROUND_PRESETS.find(
    (p) => p.value.toUpperCase() === cream.toUpperCase()
  );
  const gold = preset?.gold ?? deriveGoldFromCream(cream);
  const light = relativeLuminance(cream) > 0.72;
  const ink = light ? "#1A1A1A" : "#F2EFE9";

  return {
    cream,
    gold,
    ink,
    muted: light ? "rgba(26, 26, 26, 0.52)" : "rgba(242, 239, 233, 0.72)",
    faint: light ? "rgba(26, 26, 26, 0.38)" : "rgba(242, 239, 233, 0.5)",
    uploadBg: shade(cream, -0.06),
    portraitMid: shade(cream, -0.12),
  };
}

export function carreeThemeStyle(background: string | null | undefined): CSSProperties {
  const theme = resolveCarreeTheme(background);
  return {
    ["--yd-carree-cream" as string]: theme.cream,
    ["--yd-carree-gold" as string]: theme.gold,
    ["--yd-carree-ink" as string]: theme.ink,
    ["--yd-carree-muted" as string]: theme.muted,
    ["--yd-carree-faint" as string]: theme.faint,
    ["--yd-carree-upload-bg" as string]: theme.uploadBg,
    ["--yd-carree-portrait-mid" as string]: theme.portraitMid,
    background: theme.cream,
    color: theme.ink,
  };
}

// Für Server-Komponenten ohne React.CSSProperties-Import
export function carreeThemeInlineStyle(
  background: string | null | undefined
): Record<string, string> {
  const theme = resolveCarreeTheme(background);
  return {
    "--yd-carree-cream": theme.cream,
    "--yd-carree-gold": theme.gold,
    "--yd-carree-ink": theme.ink,
    "--yd-carree-muted": theme.muted,
    "--yd-carree-faint": theme.faint,
    "--yd-carree-upload-bg": theme.uploadBg,
    "--yd-carree-portrait-mid": theme.portraitMid,
    background: theme.cream,
    color: theme.ink,
  };
}
