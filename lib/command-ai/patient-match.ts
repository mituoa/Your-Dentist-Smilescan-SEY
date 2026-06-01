import type { CommandWorkspaceHints } from "./types";

export type MatchedPatient = {
  name: string;
  submissionId: string;
  concernLine: string | null;
};

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function scorePatientMatch(queryTokens: string[], patientName: string): number {
  const nameNorm = normalize(patientName);
  const nameParts = nameNorm.split(/\s+/).filter(Boolean);
  if (!nameParts.length || !queryTokens.length) return 0;

  let score = 0;
  for (const qt of queryTokens) {
    if (nameNorm.includes(qt)) score += 3;
    for (const part of nameParts) {
      if (part === qt) score += 5;
      else if (part.startsWith(qt) || qt.startsWith(part)) score += 2;
    }
  }
  if (nameParts.length >= 2 && nameParts.every((p) => queryTokens.some((qt) => p.includes(qt) || qt.includes(p)))) {
    score += 8;
  }
  return score;
}

type ActiveCaseHint = {
  patientName: string | null;
  submissionId: string;
  concernLine?: string | null;
};

/**
 * Resolves a patient from free text + workspace directory + optional open Tracker case.
 */
export function findPatientInCommandText(
  rawText: string,
  hints: CommandWorkspaceHints | null,
  activeCase?: ActiveCaseHint | null
): MatchedPatient | null {
  const patients = hints?.patients ?? [];
  const queryTokens = tokens(rawText).filter((t) => !STOP_TOKENS.has(t));

  let best: { patient: MatchedPatient; score: number } | null = null;
  for (const p of patients) {
    const name = p.name.trim();
    if (!name) continue;
    const score = scorePatientMatch(queryTokens, name);
    if (score <= 0) continue;
    const candidate: MatchedPatient = {
      name,
      submissionId: p.submissionId,
      concernLine: p.concernLine,
    };
    if (!best || score > best.score) best = { patient: candidate, score };
  }

  if (best && best.score >= 5) return best.patient;

  if (activeCase?.submissionId) {
    const refersToOpenCase =
      /(dieser fall|diesen fall|den fall|dem patient|der patient|ihm|ihr|diesem patient)/i.test(rawText) ||
      queryTokens.length === 0;
    if (refersToOpenCase || (!best && patients.length === 0)) {
      return {
        name: activeCase.patientName?.trim() || "Patient",
        submissionId: activeCase.submissionId,
        concernLine: activeCase.concernLine ?? null,
      };
    }
  }

  if (best && best.score >= 3) return best.patient;
  return null;
}

const STOP_TOKENS = new Set([
  "bitte",
  "eine",
  "einen",
  "einer",
  "das",
  "die",
  "der",
  "den",
  "dem",
  "und",
  "oder",
  "fuer",
  "fur",
  "mit",
  "nach",
  "an",
  "auf",
  "morgen",
  "heute",
  "woche",
  "diese",
  "noch",
  "soll",
  "schicken",
  "senden",
  "schreiben",
  "erstellen",
  "erstelle",
  "mach",
  "mache",
  "memo",
  "aufgabe",
  "task",
  "reminder",
  "erinnerung",
  "termin",
  "link",
  "bild",
  "foto",
  "nachricht",
  "mail",
  "team",
  "rezeption",
  "empfang",
]);
