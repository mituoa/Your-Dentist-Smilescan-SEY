/**
 * Defense in depth für öffentliche `/doc/{slug}`-Pfadsegmente: kein `/`, `..`, Leerzeichen.
 * Entspricht dem üblichen DB-Format aus `generateSlug` (`[a-z0-9-]+`).
 */
export function isSafeDocPathSlug(slug: string): boolean {
  const s = slug.trim();
  if (s.length === 0 || s.length > 128) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
