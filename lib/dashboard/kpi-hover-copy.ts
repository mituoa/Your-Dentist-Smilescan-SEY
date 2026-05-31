/** Einzeilige KPI-Hover-Hinweise — dezent, ohne Popup. */

export function kpiHoverEinsendungen(count: number | null): string {
  const n = count ?? 0;
  if (n === 0) return "Keine Patienten warten auf Sichtung";
  if (n === 1) return "1 Patient wartet auf Sichtung";
  return `${n} Patienten warten auf Sichtung`;
}

export function kpiHoverAktiveFaelle(count: number | null): string {
  const n = count ?? 0;
  if (n === 0) return "Keine Fälle in Bearbeitung";
  if (n === 1) return "1 Fall in Bearbeitung";
  return `${n} in Bearbeitung`;
}

export function kpiHoverAufgaben(count: number): string {
  if (count === 0) return "Keine offenen Aufgaben";
  if (count === 1) return "1 Aufgabe offen";
  return `${count} Aufgaben offen`;
}
