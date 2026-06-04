import {
  hasPhotoTrail,
  isApprovalPending,
  type EnrichedSubmissionListItem,
  type PhotoDocumentationHint,
  type TrackerInboxWorkKind,
} from "@/lib/inbox/tracker-inbox-logic";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { IntakeChannel } from "@/lib/submissions/intake-channel";

export type TrackerPreparedItem = {
  label: string;
  status: "done" | "warn";
};

export type TrackerClinicalDecision = {
  patientReport: string;
  speaksFor: string[];
  missing: string[];
  primaryAction: string;
  confidenceNote: string;
  clinicalBrief: string[];
  /** V7 — erledigte Vorarbeit (✓ / ⚠ im Block „Vorbereitet“). */
  prepared: TrackerPreparedItem[];
  /** V7 — maximal 2 kurze Lücken für die Entscheidung. */
  stillNeed: string[];
};

export type TrackerDecisionAction = {
  id: string;
  label: string;
  href?: string;
  scrollToId?: string;
  primary?: boolean;
};

export type TrackerClinicalDecisionInput = {
  patientNotes: string | null;
  patientName: string | null;
  photoCount: number;
  hasMultiDayPhotos: boolean;
  hasPhotoTrail: boolean;
  messageDraftStatus: MessageDraftListStatus;
  draftsAvailable: boolean;
  urgency: string | null;
  intakeChannel: IntakeChannel;
  isApprovalPending: boolean;
  isDoctor: boolean;
  openTaskCount: number;
  photoDocumentation?: PhotoDocumentationHint | null;
};

function skipGreetingLine(line: string): boolean {
  const head = line.replace(/[,;:]+$/, "").trim();
  return /^(sehr geehrte(\s+(damen und herren|damen|herren))?|liebe\s+damen und herren|guten tag|hallo|mit freundlichen)\b/i.test(
    head
  );
}

function extractReportSentences(notes: string | null, maxSentences = 3): string[] {
  const raw = notes?.trim();
  if (!raw) return [];

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 8 && !skipGreetingLine(l));

  const fromLines = lines.slice(0, maxSentences);
  if (fromLines.length >= 2) return fromLines;

  const sentences = raw
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12 && !skipGreetingLine(s));

  const merged = [...fromLines];
  for (const s of sentences) {
    if (merged.length >= maxSentences) break;
    if (!merged.some((m) => m.startsWith(s.slice(0, 24)))) merged.push(s);
  }
  return merged.slice(0, maxSentences);
}

function buildPatientReport(notes: string | null, patientName: string | null): string {
  const sentences = extractReportSentences(notes, 3);
  if (sentences.length >= 2) {
    return sentences.join(" ");
  }
  if (sentences.length === 1) {
    const one = sentences[0]!;
    const hasPain = /schmerz|weh|druck/i.test(one);
    const hasSwelling = /schwell|anschwell/i.test(one);
    if (hasPain && !hasSwelling) {
      return `${one} Es wird Schmerz beschrieben; eine Schwellung oder Verlauf ist im Text nicht genannt.`;
    }
    if (hasSwelling && !hasPain) {
      return `${one} Es wird eine Schwellung beschrieben; Intensität oder Dauer sind im Text nicht präzisiert.`;
    }
    return `${one} Weitere klinische Details können bei Bedarf nachgefragt werden.`;
  }

  const name = patientName?.trim();
  if (name) {
    return `${name} hat ein Anliegen ohne ausführlichen Freitext hinterlassen. Die Einordnung stützt sich auf Bilder und strukturierte Metadaten.`;
  }
  return "Es liegt kein Patiententext vor. Die Einordnung basiert auf Bildmaterial und Eingangsdaten der Praxis.";
}

function hasDraftReady(input: TrackerClinicalDecisionInput): boolean {
  return (
    input.draftsAvailable &&
    (input.messageDraftStatus === "draft" ||
      input.messageDraftStatus === "approved" ||
      input.messageDraftStatus === "sent")
  );
}

function buildSpeaksFor(input: TrackerClinicalDecisionInput): string[] {
  const points: string[] = [];

  if (input.patientNotes?.trim()) {
    points.push("Anliegen des Patienten in Kurzfassung erfasst");
  }

  if (input.photoCount > 0) {
    points.push(
      input.photoCount === 1
        ? "Klinisches Bild liegt vor"
        : `${input.photoCount} klinische Bilder liegen vor`
    );
  }

  if (input.hasMultiDayPhotos || input.hasPhotoTrail) {
    points.push("Fotoverlauf über mehrere Tage dokumentiert");
  }

  const doc = input.photoDocumentation;
  if (doc?.kind === "linked" && doc.linkedSubmissionCount > 1) {
    points.push(
      doc.linkedSubmissionCount === 2
        ? "Zweite Einsendung in derselben Verlaufskette"
        : `${doc.linkedSubmissionCount} Einsendungen in derselben Verlaufskette`
    );
  }

  if (input.isApprovalPending || hasDraftReady(input)) {
    points.push(
      input.isApprovalPending
        ? "Antwortentwurf zur ärztlichen Freigabe bereit"
        : "Antwortentwurf ist vorbereitet"
    );
  }

  if (input.urgency === "today" || input.urgency === "this_week") {
    points.push(
      input.urgency === "today"
        ? "Terminwunsch: zeitnah (heute)"
        : "Terminwunsch: in dieser Woche"
    );
  }

  if (input.openTaskCount > 0) {
    points.push(
      input.openTaskCount === 1
        ? "Offene Praxisaufgabe zum Fall"
        : `${input.openTaskCount} offene Praxisaufgaben zum Fall`
    );
  }

  if (input.intakeChannel === "follow_up") {
    points.push("Eingang als Verlaufskontrolle markiert");
  }

  if (points.length === 0) {
    points.push("Eingang ist dokumentiert — klinische Details noch knapp");
  }

  return points;
}

function noteMentionsPain(notes: string | null): boolean {
  return /schmerz|weh|druck|pochend|dumpf/i.test(notes ?? "");
}

function noteMentionsSwelling(notes: string | null): boolean {
  return /schwell|anschwell|geschwollen/i.test(notes ?? "");
}

function noteMentionsDuration(notes: string | null): boolean {
  return /seit|tagen|woche|stunden|dauer|plötzlich|chronisch/i.test(notes ?? "");
}

function noteMentionsFever(notes: string | null): boolean {
  return /fieber|temperatur|wärme|heiß/i.test(notes ?? "");
}

function buildMissing(input: TrackerClinicalDecisionInput): string[] {
  const missing: string[] = [];
  const notes = input.patientNotes;

  if (input.photoCount === 0) {
    missing.push("Klinische Bilder zur Einordnung");
  } else if (input.photoCount === 1 && !input.hasPhotoTrail) {
    missing.push("Zusätzliche Fotos (z. B. anderer Blickwinkel oder Verlauf)");
  }

  if (!input.urgency) {
    missing.push("Gewünschter Behandlungszeitraum");
  }

  if (noteMentionsPain(notes) && !/(skala|nrs|vas|\b[0-9]\s*\/\s*10\b|stärke)/i.test(notes ?? "")) {
    missing.push("Schmerzskala oder Intensität");
  }

  if (noteMentionsSwelling(notes) && input.photoCount === 0) {
    missing.push("Foto der Schwellung");
  }

  if (noteMentionsPain(notes) && !noteMentionsDuration(notes)) {
    missing.push("Dauer der Beschwerden");
  }

  if (noteMentionsFever(notes) && !/(temperatur|°|fieberwert)/i.test(notes ?? "")) {
    missing.push("Temperaturverlauf oder Reaktion auf Wärme/Kälte");
  }

  if (
    input.draftsAvailable &&
    !hasDraftReady(input) &&
    !input.isApprovalPending &&
    input.photoCount > 0
  ) {
    missing.push("Vorbereitete Patientenantwort");
  }

  if (missing.length === 0) {
    missing.push("Keine zwingenden Lücken — bei Bedarf Details in der Akte vertiefen");
  }

  return missing.slice(0, 5);
}

function buildConfidenceNote(input: TrackerClinicalDecisionInput): string {
  const hasNotes = Boolean(input.patientNotes?.trim());
  const hasDraft = hasDraftReady(input);

  if (input.photoCount === 0 && !hasNotes) {
    return "Für eine belastbare Einordnung fehlen klinische Angaben.";
  }

  if (input.photoCount === 0 && hasNotes) {
    return "Die Einschätzung basiert aktuell nur auf dem Anliegen — Bilder würden die Entscheidung absichern.";
  }

  if (input.photoCount > 0 && hasNotes && hasDraft) {
    return "Die vorhandenen Informationen reichen für eine erste Einschätzung.";
  }

  if (input.photoCount > 0 && hasNotes) {
    return "Die vorhandenen Informationen reichen für eine erste Einschätzung — einzelne Details können noch ergänzt werden.";
  }

  if (input.photoCount > 0) {
    return "Die Einschätzung stützt sich vor allem auf Bilder — das Anliegen ist noch knapp dokumentiert.";
  }

  return "Für eine belastbare Einordnung fehlen klinische Angaben.";
}

function buildPrimaryAction(input: TrackerClinicalDecisionInput): string {
  if (input.isApprovalPending && input.isDoctor) {
    return "Antwort freigeben";
  }

  if (input.messageDraftStatus === "draft" && input.isDoctor) {
    return "Antwort freigeben";
  }

  if (input.photoCount === 0) {
    return "Rückfrage senden";
  }

  if (input.photoCount < 2 && !input.hasPhotoTrail) {
    return "Weitere Fotos anfordern";
  }

  if (input.urgency === "today" || input.urgency === "this_week") {
    return "Termin anbieten";
  }

  if (
    input.hasPhotoTrail ||
    input.hasMultiDayPhotos ||
    input.intakeChannel === "follow_up" ||
    (input.photoDocumentation?.kind === "linked" &&
      (input.photoDocumentation?.linkedSubmissionCount ?? 0) > 1)
  ) {
    return "Verlauf beobachten";
  }

  if (input.photoCount > 0 && hasDraftReady(input)) {
    return "Antwort freigeben";
  }

  if (input.photoCount > 0) {
    return "Rückfrage senden";
  }

  return "Weitere Fotos anfordern";
}

function shortenMissingLabel(raw: string): string {
  if (/schmerzskala|intensität/i.test(raw)) return "Schmerzintensität fehlt";
  if (/dauer/i.test(raw)) return "Schmerzdauer fehlt";
  if (/zeitraum|behandlungszeitraum/i.test(raw)) return "Zeitraum unklar";
  if (/zusätzliche foto|blickwinkel/i.test(raw)) return "Weitere klinische Fotos empfohlen";
  if (/klinische bilder/i.test(raw)) return "Klinische Fotos fehlen";
  if (/patientenantwort|entwurf/i.test(raw)) return "Antwortentwurf fehlt";
  if (/temperatur|wärme/i.test(raw)) return "Temperaturverlauf fehlt";
  const t = raw.replace(/\.$/, "").trim();
  return t.length > 48 ? `${t.slice(0, 45)}…` : `${t.charAt(0).toUpperCase()}${t.slice(1)}`;
}

function buildStillNeed(input: TrackerClinicalDecisionInput, missing: string[]): string[] {
  const out: string[] = [];
  for (const m of missing) {
    if (/keine zwingenden/i.test(m)) continue;
    const short = shortenMissingLabel(m);
    if (!out.includes(short)) out.push(short);
    if (out.length >= 2) break;
  }
  if (out.length === 0 && !input.urgency) {
    out.push("Zeitraum unklar");
  }
  return out.slice(0, 2);
}

function buildPrepared(input: TrackerClinicalDecisionInput): TrackerPreparedItem[] {
  const items: TrackerPreparedItem[] = [];

  if (input.patientNotes?.trim()) {
    items.push({ label: "Anliegen strukturiert", status: "done" });
  } else {
    items.push({ label: "Anliegen strukturiert", status: "warn" });
  }

  if (input.photoCount > 0) {
    items.push({ label: "Bilder analysierbar vorhanden", status: "done" });
  } else {
    items.push({ label: "Bilder analysierbar vorhanden", status: "warn" });
  }

  const chronologyReady =
    input.hasPhotoTrail ||
    input.hasMultiDayPhotos ||
    input.intakeChannel === "follow_up" ||
    (input.photoDocumentation?.kind === "linked" &&
      (input.photoDocumentation?.linkedSubmissionCount ?? 0) > 1);

  if (chronologyReady) {
    items.push({ label: "Fall chronologisch eingeordnet", status: "done" });
  }

  if (input.isApprovalPending || hasDraftReady(input)) {
    items.push({ label: "Antwort vorbereitet", status: "done" });
  } else if (input.draftsAvailable && input.photoCount > 0) {
    items.push({ label: "Antwort vorbereitet", status: "warn" });
  }

  return items;
}

function firstSentence(text: string): string {
  const t = text.trim();
  if (!t) return "";
  const m = t.match(/^(.+?[.!?])(?:\s|$)/);
  return (m?.[1] ?? t).trim();
}

function buildClinicalBrief(
  input: TrackerClinicalDecisionInput,
  decision: {
    patientReport: string;
    missing: string[];
    confidenceNote: string;
  }
): string[] {
  const lines: string[] = [];

  const lead = firstSentence(decision.patientReport);
  if (lead) lines.push(lead.endsWith(".") ? lead : `${lead}.`);

  if (input.photoCount === 0) {
    lines.push("Es liegen noch keine klinischen Bilder vor.");
  } else if (input.photoCount === 1) {
    lines.push("Ein klinisches Bild liegt vor.");
  } else {
    lines.push(`${input.photoCount} klinische Bilder liegen vor.`);
  }

  if (input.urgency === "today") {
    lines.push("Der Fall wirkt zeitnah zu klären.");
  } else if (input.urgency === "this_week") {
    lines.push("Eine Einordnung in dieser Woche ist gewünscht.");
  } else {
    lines.push("Der Fall wirkt aktuell nicht akut.");
  }

  const gap = decision.missing.find((m) => !/keine zwingenden/i.test(m));
  if (gap) {
    const g = gap.endsWith(".") ? gap : `${gap}.`;
    lines.push(
      /fehlt|fehlen|würde|könnte/i.test(g)
        ? g
        : `Für eine sichere Einschätzung fehlen noch Angaben (${g.replace(/\.$/, "")}).`
    );
  } else {
    lines.push(decision.confidenceNote);
  }

  return lines.slice(0, 4);
}

function primaryActionToButtonId(primaryAction: string, isDoctor: boolean): string {
  if (/freigeben/i.test(primaryAction) && isDoctor) return "freigabe";
  if (/termin/i.test(primaryAction)) return "termin";
  if (/foto/i.test(primaryAction)) return "foto";
  if (/verlauf|beobachten/i.test(primaryAction)) return "verlauf";
  return "rueckfrage";
}

/** V7 — eine Hauptaktion, maximal zwei Nebenaktionen; Praxisaufgabe nur sekundär. */
export function buildTrackerDecisionActions(opts: {
  primaryAction: string;
  submissionId: string;
  isDoctor: boolean;
  openTaskCount?: number;
}): TrackerDecisionAction[] {
  const { primaryAction, submissionId, isDoctor } = opts;
  const taskHref = `/my-tasks/new?submission_id=${submissionId}&from=inbox`;
  const comm = "tracker-kommunikation";

  const catalog: Record<string, TrackerDecisionAction> = {
    termin: { id: "termin", label: "Termin anbieten", scrollToId: comm },
    freigabe: { id: "freigabe", label: "Antwort freigeben", scrollToId: comm },
    rueckfrage: { id: "rueckfrage", label: "Rückfrage senden", scrollToId: comm },
    foto: { id: "foto", label: "Weitere Fotos anfordern", scrollToId: comm },
    aufgabe: { id: "aufgabe", label: "Praxisaufgabe erstellen", href: taskHref },
    verlauf: { id: "verlauf", label: "Verlauf beobachten", scrollToId: "tracker-beweise" },
  };

  let primaryId = primaryActionToButtonId(primaryAction, isDoctor);

  const secondaryOrder: Record<string, string[]> = {
    freigabe: ["rueckfrage", "termin"],
    rueckfrage: ["foto", "termin"],
    foto: ["rueckfrage", "termin"],
    termin: ["rueckfrage", "foto"],
    verlauf: ["rueckfrage", "termin"],
    aufgabe: ["rueckfrage", "termin"],
  };

  const out: TrackerDecisionAction[] = [];
  const primary = catalog[primaryId];
  if (primary) out.push({ ...primary, primary: true });

  for (const id of secondaryOrder[primaryId] ?? ["rueckfrage", "termin"]) {
    if (out.length >= 3) break;
    if (id === primaryId) continue;
    const row = catalog[id];
    if (row && !out.some((a) => a.id === row.id)) out.push(row);
  }

  if (
    (opts.openTaskCount ?? 0) > 0 &&
    primaryId !== "aufgabe" &&
    out.length < 3 &&
    !out.some((a) => a.id === "aufgabe")
  ) {
    out.push(catalog.aufgabe!);
  }

  return out.slice(0, 3);
}

/** Zentrale klinische Entscheidungslogik — Tracker & Inbox. */
export function buildTrackerClinicalDecision(
  input: TrackerClinicalDecisionInput
): TrackerClinicalDecision {
  const patientReport = buildPatientReport(input.patientNotes, input.patientName);
  const speaksFor = buildSpeaksFor(input);
  const missing = buildMissing(input);
  const confidenceNote = buildConfidenceNote(input);
  const primaryAction = buildPrimaryAction(input);

  const prepared = buildPrepared(input);
  const stillNeed = buildStillNeed(input, missing);

  return {
    patientReport,
    speaksFor,
    missing,
    primaryAction,
    confidenceNote,
    clinicalBrief: buildClinicalBrief(input, { patientReport, missing, confidenceNote }),
    prepared,
    stillNeed,
  };
}

export function buildTrackerClinicalDecisionFromListItem(
  item: EnrichedSubmissionListItem,
  options?: { isDoctor?: boolean }
): TrackerClinicalDecision {
  return buildTrackerClinicalDecision({
    patientNotes: item.patient_notes,
    patientName: item.patient_name,
    photoCount: item.photo_count ?? 0,
    hasMultiDayPhotos: Boolean(
      item.photo_documentation &&
        item.photo_documentation.dayCount >= 2 &&
        item.photo_documentation.photoCount >= 2
    ),
    hasPhotoTrail: hasPhotoTrail(item),
    messageDraftStatus: item.message_draft_status,
    draftsAvailable: item.message_draft_status !== "none",
    urgency: item.urgency,
    intakeChannel: item.intake_channel,
    isApprovalPending: isApprovalPending(item),
    isDoctor: options?.isDoctor ?? true,
    openTaskCount: item.open_task_count ?? 0,
    photoDocumentation: item.photo_documentation,
  });
}

/** Filter-Kind aus Inbox-Headline (ersetzt generisches „laufend“ / In Bearbeitung). */
export function clinicalHeadlineToWorkKind(headline: string): TrackerInboxWorkKind {
  switch (headline) {
    case "Antwort freigeben":
      return "freigabe";
    case "Rückfrage offen":
      return "rueckfrage";
    case "Verlaufskontrolle":
      return "verlaufskontrolle";
    case "Praxisaufgabe":
      return "praxisaufgabe";
    case "Neue Anfrage":
    default:
      return "neue_anfrage";
  }
}

/** Inbox-Zeile aus derselben Haupthandlung — keine generischen Statuswörter. */
export function clinicalPrimaryActionToInboxHeadline(action: string): string {
  if (action === "Antwort freigeben" || action.startsWith("Antwort prüfen")) {
    return "Antwort freigeben";
  }
  if (action === "Rückfrage senden" || action === "Rückfrage stellen") return "Rückfrage offen";
  if (action === "Weitere Fotos anfordern" || action === "Foto nachfordern") return "Rückfrage offen";
  if (action === "Termin anbieten") return "Neue Anfrage";
  if (action.startsWith("Praxisaufgabe")) return "Praxisaufgabe";
  if (action.startsWith("Verlauf")) return "Verlaufskontrolle";
  return "Neue Anfrage";
}
