export interface WorkingStyleStatement {
  id: string;
  text: string;
  category: string;
}

export const WORKING_STYLE_STATEMENTS: WorkingStyleStatement[] = [
  { id: "s1", text: "Sie müssen hier nichts aushalten.", category: "Kontrolle" },
  { id: "s2", text: "Wenn etwas unangenehm wird, stoppen wir sofort.", category: "Kontrolle" },
  { id: "s3", text: "Wir gehen das in Ihrem Tempo an.", category: "Kontrolle" },
  { id: "s4", text: "Sie bestimmen das Tempo – nicht der Terminplan.", category: "Kontrolle" },
  { id: "s5", text: "Bevor wir beginnen, wissen Sie genau, was passiert.", category: "Aufklärung" },
  { id: "s6", text: "Sie können jederzeit nachfragen – ich nehme mir die Zeit.", category: "Aufklärung" },
  { id: "s7", text: "Ich sage Ihnen klar, was sinnvoll ist – und was nicht.", category: "Aufklärung" },
  { id: "s8", text: "Ich erkläre jeden Schritt verständlich.", category: "Aufklärung" },
  { id: "s9", text: "Sie entscheiden in Ruhe – ich dränge Sie zu nichts.", category: "Vertrauen" },
  { id: "s10", text: "Ich behandle nur das, was wirklich notwendig ist.", category: "Vertrauen" },
  { id: "s11", text: "Was nicht dringend ist, kann warten.", category: "Vertrauen" },
  { id: "s12", text: "Ich empfehle nur, was ich selbst machen lassen würde.", category: "Vertrauen" },
  { id: "s13", text: "Viele Patienten kommen nervös – das ist völlig in Ordnung.", category: "Angst" },
  { id: "s14", text: "Wenn Sie unsicher sind, sagen Sie es – wir passen uns an.", category: "Angst" },
  { id: "s15", text: "Wir finden gemeinsam heraus, was Ihnen hilft.", category: "Angst" },
];

export const WORKING_STYLE_CATEGORY_ORDER = ["Kontrolle", "Aufklärung", "Vertrauen", "Angst"] as const;

export const MAX_WORKING_STYLE_SELECTIONS = 3;

export const VITA_WS_PREFIX = "__WS__:";

export function isValidStatementId(id: string): boolean {
  return WORKING_STYLE_STATEMENTS.some((s) => s.id === id);
}

export function getCategorizedStatements(): { name: string; statements: WorkingStyleStatement[] }[] {
  return WORKING_STYLE_CATEGORY_ORDER.map((name) => ({
    name,
    statements: WORKING_STYLE_STATEMENTS.filter((s) => s.category === name),
  }));
}

export function sortStatementIdsByCategory(ids: string[]): WorkingStyleStatement[] {
  return ids
    .map((id) => WORKING_STYLE_STATEMENTS.find((s) => s.id === id))
    .filter((s): s is WorkingStyleStatement => Boolean(s))
    .sort((a, b) => {
      const ia = WORKING_STYLE_CATEGORY_ORDER.indexOf(a.category as (typeof WORKING_STYLE_CATEGORY_ORDER)[number]);
      const ib = WORKING_STYLE_CATEGORY_ORDER.indexOf(b.category as (typeof WORKING_STYLE_CATEGORY_ORDER)[number]);
      return ia - ib;
    });
}

/** Drei sichtbare Zeilen für Formular + Vorschau (Bibliothek → Texte). */
export function statementIdsToThreeLines(ids: string[]): [string, string, string] {
  const texts = sortStatementIdsByCategory(ids).map((s) => s.text);
  const out: [string, string, string] = ["", "", ""];
  for (let i = 0; i < Math.min(3, texts.length); i++) {
    out[i] = texts[i] ?? "";
  }
  return out;
}

/** Parse vita: library prefix block or up to 3 free paragraphs */
export function parseWorkingStyleVita(vita: string | null): {
  statementIds: string[];
  freeLines: [string, string, string];
  tailParagraphs: string;
} {
  const raw = (vita || "").trim();
  if (!raw) {
    return { statementIds: [], freeLines: ["", "", ""], tailParagraphs: "" };
  }
  const parts = raw.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const first = parts[0] || "";
  if (first.startsWith(VITA_WS_PREFIX)) {
    const ids = first
      .slice(VITA_WS_PREFIX.length)
      .split(",")
      .map((x) => x.trim())
      .filter(isValidStatementId)
      .slice(0, MAX_WORKING_STYLE_SELECTIONS);
    const tail = parts.slice(1).join("\n\n");
    return { statementIds: ids, freeLines: ["", "", ""], tailParagraphs: tail };
  }
  const lines: [string, string, string] = ["", "", ""];
  for (let i = 0; i < 3; i++) lines[i] = parts[i] || "";
  const tail = parts.slice(3).join("\n\n");
  return { statementIds: [], freeLines: lines, tailParagraphs: tail };
}

export function buildWorkingStyleVita(input: {
  statementIds: string[];
  freeLines: [string, string, string];
  tailParagraphs: string;
}): string {
  const ids = input.statementIds.filter(isValidStatementId).slice(0, MAX_WORKING_STYLE_SELECTIONS);
  const head =
    ids.length > 0
      ? `${VITA_WS_PREFIX}${ids.join(",")}`
      : input.freeLines.map((l) => l.trim()).filter(Boolean).join("\n\n");
  const tail = input.tailParagraphs.trim();
  if (!head && !tail) return "";
  if (!head) return tail;
  if (!tail) return head;
  return `${head}\n\n${tail}`;
}

/** For public profile: replace __WS__ block with statement texts */
export function expandWorkingStyleVitaForDisplay(vita: string | null): string {
  const { statementIds, freeLines, tailParagraphs } = parseWorkingStyleVita(vita);
  if (statementIds.length > 0) {
    const texts = sortStatementIdsByCategory(statementIds).map((s) => s.text);
    const head = texts.join("\n\n");
    return tailParagraphs ? `${head}\n\n${tailParagraphs}` : head;
  }
  const head = freeLines.map((l) => l.trim()).filter(Boolean).join("\n\n");
  return tailParagraphs ? (head ? `${head}\n\n${tailParagraphs}` : tailParagraphs) : head;
}
