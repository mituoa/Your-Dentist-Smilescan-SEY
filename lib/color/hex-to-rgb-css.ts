/** Space-separated RGB for Tailwind `rgb(var(--brand-primary) / <alpha>)` */

const DEFAULT_PRIMARY = "15 110 86";

export function hexToRgbSpaceSeparated(hex: string | null | undefined): string {
  if (!hex) return DEFAULT_PRIMARY;
  const m = /^#([0-9A-Fa-f]{6})$/.exec(hex.trim());
  if (!m) return DEFAULT_PRIMARY;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `${r} ${g} ${b}`;
}

export function lightenRgbSpaceSeparated(
  rgbSpace: string,
  amount: number
): string {
  const parts = rgbSpace.split(/\s+/).map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return "29 158 117";
  }
  const lighten = (c: number) =>
    Math.min(255, Math.round(c + (255 - c) * amount));
  return `${lighten(parts[0])} ${lighten(parts[1])} ${lighten(parts[2])}`;
}
