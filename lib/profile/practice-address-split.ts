/** Split practice_address (line1 street, line2 PLZ Ort) for Figma form */
export function parsePracticeAddressBlock(address: string | null): {
  street: string;
  postalCode: string;
  city: string;
} {
  const lines = (address || "").split("\n").map((l) => l.trim());
  const street = lines[0] || "";
  const line2 = lines[1] || "";

  // "80802 München" — PLZ + Stadt
  const spaced = line2.match(/^(\d{1,12})\s+(.+)$/);
  if (spaced) {
    return { street, postalCode: spaced[1] || "", city: (spaced[2] || "").trim() };
  }

  // Nur PLZ (auch während der Eingabe: "8", "80", "80802")
  const digitsOnly = line2.match(/^(\d{1,12})$/);
  if (digitsOnly) {
    return { street, postalCode: digitsOnly[1] || "", city: "" };
  }

  // Keine zweite Zeile / freier Text in Zeile 2
  return { street, postalCode: "", city: line2 };
}

export function mergePracticeAddressBlock(
  street: string,
  postalCode: string,
  city: string
): string {
  const s = street.trim();
  const plz = postalCode.trim();
  const c = city.trim();
  const line2 = [plz, c].filter(Boolean).join(" ").trim();
  if (s && line2) return `${s}\n${line2}`;
  if (s) return s;
  return line2;
}
