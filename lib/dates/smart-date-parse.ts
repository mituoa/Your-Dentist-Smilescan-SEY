/**
 * Smart birth-date parsing (DE-first) + validation for medical SaaS inputs.
 * No external date libraries.
 */

export type SmartParseFailure = { ok: false; error: string };
export type SmartParseSuccess = { ok: true; iso: string | null };
export type SmartParseResult = SmartParseFailure | SmartParseSuccess;

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Zweistelliger Jahreszahl: 00–49 → 20xx, 50–99 → 19xx (06 → 2006, 99 → 1999). */
export function expandTwoDigitYear(yy: number): number {
  if (yy < 0 || yy > 99) return yy;
  return yy < 50 ? 2000 + yy : 1900 + yy;
}

function utcTodayParts(): { y: number; m0: number; d: number } {
  const n = new Date();
  return { y: n.getUTCFullYear(), m0: n.getUTCMonth(), d: n.getUTCDate() };
}

export function maxBirthUtc(): number {
  const { y, m0, d } = utcTodayParts();
  return Date.UTC(y, m0, d);
}

export function minBirthUtc(): number {
  const { y, m0, d } = utcTodayParts();
  return Date.UTC(y - 120, m0, d);
}

export function isValidYmd(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function toIso(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

export function formatIsoToGermanPadded(iso: string): string {
  const [ys, ms, ds] = iso.split("-");
  const y = parseInt(ys, 10);
  const m = parseInt(ms, 10);
  const d = parseInt(ds, 10);
  if (!y || !m || !d) return iso;
  return `${pad2(d)}.${pad2(m)}.${y}`;
}

function inBirthRange(y: number, m: number, d: number): boolean {
  const t = Date.UTC(y, m - 1, d);
  return t >= minBirthUtc() && t <= maxBirthUtc();
}

function finalize(y: number, m: number, d: number): SmartParseResult {
  if (!isValidYmd(y, m, d)) {
    return { ok: false, error: "Bitte prüfen Sie das Datum." };
  }
  if (!inBirthRange(y, m, d)) {
    const t = Date.UTC(y, m - 1, d);
    if (t > maxBirthUtc()) {
      return { ok: false, error: "Datum liegt in der Zukunft." };
    }
    return { ok: false, error: "Datum liegt zu weit zurück (über 120 Jahre)." };
  }
  return { ok: true, iso: toIso(y, m, d) };
}

/**
 * Erkennt u. a. 12.03.1999 · 12/03/1999 · 12-03-1999 · 12031999 · 120399 (DDMMYY) · 1999-03-12
 */
export function parseSmartDate(raw: string): SmartParseResult {
  const t = raw.trim();
  if (!t) return { ok: true, iso: null };

  const isoLike = t.match(/^(\d{4})[\s.\/-](\d{1,2})[\s.\/-](\d{1,2})$/);
  if (isoLike) {
    const y = parseInt(isoLike[1], 10);
    const m = parseInt(isoLike[2], 10);
    const d = parseInt(isoLike[3], 10);
    return finalize(y, m, d);
  }

  if (/^\d+$/.test(t)) {
    if (t.length === 8) {
      const d = parseInt(t.slice(0, 2), 10);
      const m = parseInt(t.slice(2, 4), 10);
      const y = parseInt(t.slice(4, 8), 10);
      return finalize(y, m, d);
    }
    if (t.length === 6) {
      const d = parseInt(t.slice(0, 2), 10);
      const m = parseInt(t.slice(2, 4), 10);
      const yy = parseInt(t.slice(4, 6), 10);
      const y = expandTwoDigitYear(yy);
      return finalize(y, m, d);
    }
    return { ok: false, error: "Eingabe nicht erkannt." };
  }

  const norm = t.replace(/[\s\/-]/g, ".");
  const parts = norm.split(".").filter((p) => p.length > 0);
  if (parts.length !== 3) {
    return { ok: false, error: "Eingabe nicht erkannt." };
  }

  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const yRaw = parts[2];
  let y = parseInt(yRaw, 10);
  if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) {
    return { ok: false, error: "Eingabe nicht erkannt." };
  }
  if (yRaw.length === 2) {
    y = expandTwoDigitYear(y);
  } else if (yRaw.length !== 4) {
    return { ok: false, error: "Eingabe nicht erkannt." };
  }

  return finalize(y, m, d);
}
