import type { CSSProperties } from "react";

/** Referenz Carree — feste Markenwerte (unabhängig von Grundfarbe-Swatch). */
export const CARREE_GOLD = "#B89564";
export const DEFAULT_PROFILE_BACKGROUND = "#FAF8F5";

export type ProfileBackgroundPreset = {
  name: string;
  /** Hintergrund der Bühne */
  value: string;
  /** Headline / Primärtext */
  ink?: string;
};

/** Hauptfarben — sichtbar in der Sidebar. */
export const PROFILE_PRIMARY_COLOR_PRESETS: ProfileBackgroundPreset[] = [
  { name: "Mitternacht", value: "#FAF8F5", ink: "#1A2D4A" },
  { name: "Praxisblau", value: "#EEF4FA", ink: "#1A2D42" },
  { name: "Lavendel", value: "#F3EFF8", ink: "#3A3455" },
  { name: "Creme", value: "#F7F3EC", ink: "#1F1D1A" },
  { name: "Salbei", value: "#EDF4EE", ink: "#2A3D32" },
];

/** Weitere Pastellfarben — unter „Mehr auswählen“. */
export const PROFILE_EXTENDED_COLOR_PRESETS: ProfileBackgroundPreset[] = [
  { name: "Rosé", value: "#F8F0EE", ink: "#2A2220" },
  { name: "Pfirsich", value: "#FAEDE4", ink: "#3D2E24" },
  { name: "Apricot", value: "#F9E8DC", ink: "#3A2A1E" },
  { name: "Koralle", value: "#FBE8E3", ink: "#3A2824" },
  { name: "Stein", value: "#F0EEEA", ink: "#2C2A28" },
  { name: "Nebelblau", value: "#EBF2F6", ink: "#1E2A32" },
  { name: "Himmel", value: "#E6F1FA", ink: "#1A3048" },
  { name: "Minze", value: "#E8F5F0", ink: "#1E3D34" },
  { name: "Perle", value: "#F4F6F5", ink: "#25282A" },
  { name: "Sand", value: "#F5F0E8", ink: "#2A241C" },
];

export const PROFILE_BACKGROUND_PRESETS: ProfileBackgroundPreset[] = [
  ...PROFILE_PRIMARY_COLOR_PRESETS,
  ...PROFILE_EXTENDED_COLOR_PRESETS,
];

/** @deprecated Alias — erste 8 für Abwärtskompatibilität */
export const PROFILE_EDITOR_COLOR_PRESETS = PROFILE_BACKGROUND_PRESETS.slice(0, 8);

/** Sichtbare Swatch-Farbe (Referenz: erster Kreis = Navy). */
export function presetSwatchFill(preset: ProfileBackgroundPreset, index: number): string {
  return index === 0 ? (preset.ink ?? preset.value) : preset.value;
}

export type CarreeTheme = {
  cream: string;
  gold: string;
  ink: string;
  watermark: string;
  cardSurface: string;
  panelBg: string;
  panelBorder: string;
  vitaBg: string;
  stageGradient: string;
  heroGlow: string;
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

export function relativeLuminance(hex: string): number {
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

function mixWithWhite(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  const t = Math.max(0, Math.min(1, amount));
  return toHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
}

function findPreset(cream: string): ProfileBackgroundPreset | undefined {
  return PROFILE_BACKGROUND_PRESETS.find((p) => p.value.toUpperCase() === cream.toUpperCase());
}

export function resolveCarreeTheme(background: string | null | undefined): CarreeTheme {
  const cream = normalizeProfileBackgroundHex(background) ?? DEFAULT_PROFILE_BACKGROUND;
  const preset = findPreset(cream);
  const ink = preset?.ink ?? (relativeLuminance(cream) > 0.72 ? "#1A2D4A" : "#FAF8F5");
  const light = relativeLuminance(cream) > 0.72;

  const cardSurface = mixWithWhite(cream, 0.72);
  const vitaBg = mixWithWhite(cream, 0.82);
  const panelBg = mixWithWhite(cream, 0.78);
  const panelBorder = shade(mixWithWhite(cream, 0.5), -0.06);
  const watermark = shade(cream, -0.1);
  const glowTint = shade(cream, 0.12);

  const stageGradient = [
    `radial-gradient(ellipse 130% 90% at 8% -5%, ${glowTint} 0%, transparent 58%)`,
    `radial-gradient(ellipse 80% 70% at 92% 8%, ${mixWithWhite(cream, 0.35)} 0%, transparent 62%)`,
    `linear-gradient(175deg, ${shade(cream, 0.06)} 0%, ${cream} 42%, ${shade(cream, -0.02)} 100%)`,
  ].join(", ");

  const heroGlow = `radial-gradient(ellipse 75% 65% at 88% 12%, ${mixWithWhite(cream, 0.45)} 0%, transparent 72%)`;

  return {
    cream,
    gold: CARREE_GOLD,
    ink,
    watermark,
    cardSurface,
    panelBg,
    panelBorder,
    vitaBg,
    stageGradient,
    heroGlow,
    muted: light ? "rgba(26, 43, 74, 0.48)" : "rgba(250, 248, 245, 0.72)",
    faint: light ? "rgba(26, 43, 74, 0.34)" : "rgba(250, 248, 245, 0.5)",
    uploadBg: shade(cream, -0.04),
    portraitMid: shade(cream, -0.08),
  };
}

function themeCssVars(theme: CarreeTheme): Record<string, string> {
  return {
    "--yd-carree-cream": theme.cream,
    "--yd-carree-gold": theme.gold,
    "--yd-carree-ink": theme.ink,
    "--yd-carree-watermark": theme.watermark,
    "--yd-carree-card-surface": theme.cardSurface,
    "--yd-carree-panel-bg": theme.panelBg,
    "--yd-carree-panel-border": theme.panelBorder,
    "--yd-carree-vita-bg": theme.vitaBg,
    "--yd-carree-stage-gradient": theme.stageGradient,
    "--yd-carree-hero-glow": theme.heroGlow,
    "--yd-carree-muted": theme.muted,
    "--yd-carree-faint": theme.faint,
    "--yd-carree-upload-bg": theme.uploadBg,
    "--yd-carree-portrait-mid": theme.portraitMid,
  };
}

export function carreeThemeStyle(background: string | null | undefined): CSSProperties {
  const theme = resolveCarreeTheme(background);
  return {
    ...themeCssVars(theme),
    background: theme.cream,
    color: theme.ink,
  } as CSSProperties;
}

export function carreeThemeInlineStyle(
  background: string | null | undefined
): Record<string, string> {
  const theme = resolveCarreeTheme(background);
  return {
    ...themeCssVars(theme),
    background: theme.cream,
    color: theme.ink,
  };
}

/** Preset-Name für aktive Farbe (inkl. erweiterte Palette). */
export function profileBackgroundPresetName(hex: string | null | undefined): string {
  const normalized = normalizeProfileBackgroundHex(hex);
  if (!normalized) return "Mitternacht";
  return findPreset(normalized)?.name ?? "Eigene Farbe";
}
