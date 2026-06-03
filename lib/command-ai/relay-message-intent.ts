/** Interne Relay-Nachricht (Übergabe) — nicht Patientenkommunikation, nicht Aufgabe. */

import { isCommandTaskCommand } from "./task-intent";

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isRelayInternalMessageCommand(rawText: string): boolean {
  const t = normalize(rawText);
  if (!t) return false;
  if (isCommandTaskCommand(rawText)) return false;

  if (/(informier|benachrichtig|mitteil|übergib|uebergib).*(empfang|rezeption|team|implantat)/.test(t)) {
    return true;
  }
  if (/schreib.*(dem |der )?(empfang|rezeption|team|implantat)/.test(t)) {
    return true;
  }
  if (/(empfang|rezeption|team).*(inform|benachrichtig|mitteil)/.test(t)) {
    return true;
  }
  if (/(bitte\s+)?(dem\s+)?(empfang|rezeption).*(bescheid|mitteil)/.test(t)) {
    return true;
  }
  return false;
}

export type ParsedRelayMessageIntent = {
  body: string;
  assigneeHint: string | null;
  groupHint: "reception" | "team" | "implant" | null;
};

export function parseRelayMessageFromVoice(rawText: string): ParsedRelayMessageIntent {
  const text = rawText.trim();
  const lower = normalize(text);

  let groupHint: ParsedRelayMessageIntent["groupHint"] = null;
  if (/(empfang|rezeption)/.test(lower)) groupHint = "reception";
  else if (/implantat|implant/.test(lower)) groupHint = "implant";
  else if (/team/.test(lower)) groupHint = "team";

  const assigneeMatch = lower.match(
    /\b(lisa|sarah|anna|team|empfang|rezeption|assistentin|assistent|zfa|dh)\b/i
  );
  const assigneeHint = assigneeMatch?.[1]?.toLowerCase() ?? null;

  let body = text;
  const prefixes = [
    /^(informier|benachrichtig|mitteil)\s+(das\s+)?(empfang|rezeption|team|implantat-?team)[,:]?\s*/i,
    /^schreib\s+(dem|der)\s+(empfang|rezeption|team)[,:]?\s*/i,
  ];
  for (const re of prefixes) {
    body = body.replace(re, "").trim();
  }
  if (body.length < 8) {
    body = text;
  }

  return { body, assigneeHint, groupHint };
}
