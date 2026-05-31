/** Medical display name for doctor-facing workspace (Atlas, header). */
export function formatDoctorDisplayName(name: string | null | undefined): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "Dr.";
  if (/^dr\.?\s/i.test(trimmed)) return trimmed;
  return `Dr. ${trimmed}`;
}

/** Kurze Anrede in der Begrüßung — nur der erste Name, kein zweiter Nachname. */
export function greetingDoctorLabel(name: string | null | undefined): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "Dr.";
  const withoutDr = trimmed.replace(/^dr\.?\s+/i, "").trim();
  const [primary] = withoutDr.split(/\s+/).filter(Boolean);
  if (!primary) return formatDoctorDisplayName(trimmed);
  return `Dr. ${primary}`;
}
