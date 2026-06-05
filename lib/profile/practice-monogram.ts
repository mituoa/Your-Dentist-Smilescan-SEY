/** Monogramm aus Praxisname (z. B. „Carree Dental“ → „CD“). */
export function practiceMonogram(practiceName: string): string {
  const words = practiceName.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]!.charAt(0)}${words[1]!.charAt(0)}`.toUpperCase();
  }
  if (words.length === 1) {
    const w = words[0]!;
    return w.length >= 2 ? w.slice(0, 2).toUpperCase() : `${w.charAt(0)}`.toUpperCase();
  }
  return "PR";
}

export function practiceNameCaps(practiceName: string): string {
  return practiceName.trim().toUpperCase() || "IHRE PRAXIS";
}
