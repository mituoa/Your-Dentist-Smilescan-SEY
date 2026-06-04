/**
 * Calm, professional German copy for patient-facing drafts.
 * Nothing is sent automatically — always physician review.
 */

export type UrgencyKey =
  | "today"
  | "within_24h"
  | "this_week"
  | "not_urgent"
  | null;

export function buildFollowUpDraft(params: {
  patientName: string;
  urgency: UrgencyKey;
  practicePhone: string;
  appointmentUrl: string | null;
}): string {
  const name = params.patientName.trim() || "Patient";
  const tel = params.practicePhone.trim() || "[Praxisnummer]";
  const link = params.appointmentUrl?.trim();

  const timing =
    params.urgency === "today"
      ? "Wir möchten Sie noch heute kurzfristig in die Praxis einladen, um Ihr Anliegen sicher einzuordnen."
      : params.urgency === "within_24h"
        ? "Wir empfehlen eine Untersuchung innerhalb der nächsten 24 Stunden."
        : params.urgency === "this_week"
          ? "Wir möchten Sie innerhalb der nächsten Tage für eine zeitnahe Klärung in die Praxis einladen."
          : "Wir bitten Sie, einen für Sie passenden Termin bei uns zu vereinbaren.";

  const linkLine = link
    ? `Online-Termin: ${link}`
    : "Online-Termin: [Link einfügen]";

  return (
    `Sehr geehrte/r ${name},\n\n` +
    `vielen Dank für Ihre Einsendung. ${timing}\n\n` +
    `Bitte kontaktieren Sie uns telefonisch unter ${tel} oder nutzen Sie unseren Online-Termin.\n` +
    `${linkLine}\n\n` +
    `Mit freundlichen Grüßen\n` +
    `Ihr Praxisteam`
  );
}

export const FOLLOW_UP_SNIPPETS: { id: string; label: string; text: string }[] = [
  {
    id: "pain",
    label: "Schmerzintensität",
    text: "Treten derzeit Schmerzen auf? Wenn ja: wie stark auf einer Skala von 0 (keine Schmerzen) bis 10 (stärkste vorstellbare Belastung)?",
  },
  {
    id: "course",
    label: "Schmerzverlauf",
    text: "Seit wann bestehen die Beschwerden, und haben sie sich seitdem verändert (besser, schlechter, gleich)?",
  },
  {
    id: "swelling",
    label: "Schwellung",
    text: "Haben Sie aktuell eine sichtbare Schwellung bemerkt? Bitte kurz beschreiben, wo und seit wann.",
  },
  {
    id: "fever",
    label: "Fieber",
    text: "Hatten Sie in den letzten Tagen Fieber oder ein allgemeines Krankheitsgefühl? Eine kurze Rückmeldung hilft uns bei der Einordnung.",
  },
  {
    id: "meds",
    label: "Medikamente",
    text: "Nehmen Sie derzeit regelmäßig Medikamente ein (einschließlich rezeptfreier Präparate)? Eine grobe Auflistung genügt.",
  },
  {
    id: "bleeding",
    label: "Blutung",
    text: "Besteht aktuell eine Blutung am betroffenen Zahn oder Zahnfleisch? Wenn ja: seit wann und in welchem Ausmaß?",
  },
  {
    id: "cold",
    label: "Kälteempfindlichkeit",
    text: "Reagieren die Zähne auf Kälte, Wärme oder Süßes? Bitte kurz beschreiben, welcher Reiz betroffen ist.",
  },
  {
    id: "chew",
    label: "Kauprobleme",
    text: "Können Sie normal kauen, oder vermeiden Sie bestimmte Seiten? Eine kurze Beschreibung hilft bei der Einordnung.",
  },
  {
    id: "photo",
    label: "Weiteres Foto",
    text: "Könnten Sie bitte zusätzlich eine Aufnahme aus größerem Abstand senden, damit wir den betroffenen Bereich besser einordnen können?",
  },
  {
    id: "custom",
    label: "Freitext",
    text: "[Ihre Rückfrage hier formulieren]",
  },
];

export const PHOTO_VIEW_SNIPPETS: { id: string; label: string; requestLine: string }[] = [
  {
    id: "closeup",
    label: "Nahaufnahme",
    requestLine:
      "Bitte senden Sie eine gut ausgeleuchtete Nahaufnahme des betroffenen Zahns oder der betroffenen Stelle.",
  },
  {
    id: "overview",
    label: "Übersichtsaufnahme",
    requestLine:
      "Bitte senden Sie zusätzlich eine Übersichtsaufnahme aus etwas größerem Abstand, damit wir den Bereich einordnen können.",
  },
  {
    id: "upper",
    label: "Oberkiefer",
    requestLine: "Bitte senden Sie eine Aufnahme des Oberkiefers mit gut sichtbarem Befundbereich.",
  },
  {
    id: "lower",
    label: "Unterkiefer",
    requestLine: "Bitte senden Sie eine Aufnahme des Unterkiefers mit gut sichtbarem Befundbereich.",
  },
  {
    id: "left",
    label: "Linke Seite",
    requestLine: "Bitte senden Sie eine Aufnahme von der linken Seite mit deutlich erkennbarem Befund.",
  },
  {
    id: "right",
    label: "Rechte Seite",
    requestLine: "Bitte senden Sie eine Aufnahme von der rechten Seite mit deutlich erkennbarem Befund.",
  },
  {
    id: "affected",
    label: "Betroffener Zahn",
    requestLine:
      "Bitte senden Sie eine Nahaufnahme des betroffenen Zahns aus Frontal- und Seitenansicht, falls möglich.",
  },
  {
    id: "free",
    label: "Freie Auswahl",
    requestLine:
      "Bitte senden Sie eine gut ausgeleuchtete Aufnahme des betroffenen Bereichs aus einem für Sie passenden Blickwinkel.",
  },
  {
    id: "swelling",
    label: "Schwellung",
    requestLine:
      "Bitte senden Sie eine gut ausgeleuchtete Aufnahme der geschwollenen Region aus Nah- und Übersichtsperspektive.",
  },
  {
    id: "wound",
    label: "Wunde",
    requestLine:
      "Bitte senden Sie eine Nahaufnahme der Wunde bei guter Beleuchtung, damit wir den Befund sicher einordnen können.",
  },
];

export type RuckfrageTopicId = (typeof FOLLOW_UP_SNIPPETS)[number]["id"];

/** Assistenz-Flow — Rückfrage-Themen (IDs → FOLLOW_UP_SNIPPETS). */
export const CLINICAL_RUCKFRAGE_TOPICS: {
  id: RuckfrageTopicId;
  label: string;
}[] = [
  { id: "pain", label: "Schmerzstärke" },
  { id: "course", label: "Dauer der Beschwerden" },
  { id: "swelling", label: "Schwellung" },
  { id: "fever", label: "Temperatur/Fieber" },
  { id: "meds", label: "Medikamente" },
  { id: "bleeding", label: "Blutung" },
  { id: "cold", label: "Empfindlichkeit" },
  { id: "photo", label: "Weiteres Foto" },
  { id: "custom", label: "Sonstiges" },
];

/** Assistenz-Flow — Fotoanforderung (UI-Labels, IDs → PHOTO_VIEW_SNIPPETS). */
export const ASSIST_PHOTO_OPTIONS: { id: string; label: string }[] = [
  { id: "upper", label: "Übersicht Oberkiefer" },
  { id: "lower", label: "Übersicht Unterkiefer" },
  { id: "closeup", label: "Nahaufnahme" },
  { id: "right", label: "Seitenansicht" },
  { id: "affected", label: "Frontansicht" },
  { id: "swelling", label: "Schwellung" },
  { id: "wound", label: "Wunde" },
  { id: "free", label: "Sonstiges" },
];

const timingLine = (urgency: UrgencyKey): string => {
  if (urgency === "today") {
    return "Wir möchten Ihr Anliegen zeitnah mit Ihnen klären.";
  }
  if (urgency === "within_24h") {
    return "Wir möchten Ihr Anliegen innerhalb der nächsten 24 Stunden mit Ihnen klären.";
  }
  if (urgency === "this_week") {
    return "Wir möchten Ihr Anliegen in den nächsten Tagen gemeinsam mit Ihnen einordnen.";
  }
  return "Wir möchten Ihr Anliegen nach Praxiskapazität gemeinsam mit Ihnen weiter klären.";
};

/**
 * Vollständiger Nachrichtentext für die gewählte Rückfrage-Vorlage (nur Entwurf, nie automatischer Versand).
 */
export function buildRuckfrageDraftForSnippet(
  snippetId: string,
  params: {
    patientName: string;
    urgency: UrgencyKey;
    practicePhone: string;
    appointmentUrl: string | null;
  }
): string {
  const name = params.patientName.trim() || "Patient";
  const tel = params.practicePhone.trim() || "[Praxisnummer]";
  const link = params.appointmentUrl?.trim();
  const linkLine = link
    ? `Online-Terminbuchung: ${link}`
    : "Online-Terminbuchung: [Link einfügen]";

  const snippet = FOLLOW_UP_SNIPPETS.find((s) => s.id === snippetId);
  const core = snippet?.text ?? FOLLOW_UP_SNIPPETS[0].text;

  return (
    `Sehr geehrte/r ${name},\n\n` +
    `vielen Dank für Ihre Einsendung. ${timingLine(params.urgency)}\n\n` +
    `Damit wir Sie bestmöglich beraten können, bitten wir Sie um eine kurze Rückmeldung:\n\n` +
    `${core}\n\n` +
    `Sie erreichen uns telefonisch unter ${tel}. Gerne können Sie auch unseren Online-Termin nutzen:\n` +
    `${linkLine}\n\n` +
    `Mit freundlichen Grüßen\n` +
    `Ihr Praxisteam`
  );
}

export type AssistQuickActionId =
  | "invite_today"
  | "pain_followup"
  | "appointment_link_text"
  | "polish_placeholder";

/** Kurze KI-Einordnung für Fotoanforderung (UI, nicht der Brief). */
export function buildPhotoRequestRationale(photoCount: number): string {
  if (photoCount === 0) {
    return "Ohne klinische Bilder können wir den Fall nur eingeschränkt einordnen — eine erste Aufnahme sichert die Beurteilung.";
  }
  if (photoCount === 1) {
    return "Für eine bessere Einschätzung wird eine zusätzliche Aufnahme aus einem weiteren Blickwinkel benötigt.";
  }
  return "Bei Verlaufs- oder Befundänderung hilft eine aktuelle Aufnahme bei der sicheren Einordnung.";
}

/** Terminvorschlag mit Dringlichkeit und begründeter Empfehlung. */
export function buildTerminOfferDraft(params: {
  patientName: string;
  urgency: UrgencyKey;
  practicePhone: string;
  appointmentUrl: string | null;
}): string {
  const name = params.patientName.trim() || "Patient";
  const tel = params.practicePhone.trim() || "[Praxisnummer]";
  const link = params.appointmentUrl?.trim();
  const linkLine = link
    ? `Online-Terminbuchung: ${link}`
    : "Online-Terminbuchung: [Link einfügen]";

  const recommendation =
    params.urgency === "today"
      ? "Aufgrund Ihrer Angaben empfehlen wir einen Termin noch heute."
      : params.urgency === "within_24h"
        ? "Wir empfehlen eine Untersuchung innerhalb der nächsten 24 Stunden."
        : params.urgency === "this_week"
          ? "Aufgrund Ihrer Angaben empfehlen wir einen Termin in dieser Woche."
          : "Aufgrund Ihrer Angaben empfehlen wir einen Termin nach Praxiskapazität — zur sicheren Klärung.";

  const timing =
    params.urgency === "today"
      ? "Wir möchten Sie noch heute kurz in die Praxis einladen."
      : params.urgency === "within_24h"
        ? "Wir möchten Sie zeitnah in die Praxis einladen."
        : params.urgency === "this_week"
          ? "Wir möchten Sie innerhalb der nächsten Tage in die Praxis einladen."
          : "Wir bitten Sie, einen für Sie passenden Termin zu vereinbaren.";

  return (
    `Sehr geehrte/r ${name},\n\n` +
    `vielen Dank für Ihre Einsendung. ${recommendation}\n\n` +
    `${timing} Bitte kontaktieren Sie uns unter ${tel} oder nutzen Sie unseren Online-Termin:\n` +
    `${linkLine}\n\n` +
    `Mit freundlichen Grüßen\n` +
    `Ihr Praxisteam`
  );
}

/** KI-Vorschlag für Fotoanforderung — abhängig vom gewählten Aufnahmetyp. */
export function buildPhotoRequestDraft(params: {
  patientName: string;
  practicePhone: string;
  photoCount: number;
  viewId?: string;
}): string {
  const name = params.patientName.trim() || "Patient";
  const tel = params.practicePhone.trim() || "[Praxisnummer]";
  const view =
    PHOTO_VIEW_SNIPPETS.find((v) => v.id === params.viewId) ??
    PHOTO_VIEW_SNIPPETS[params.photoCount === 0 ? 0 : 1];
  const core = view.requestLine;

  return (
    `Guten Tag,\n\n` +
    `vielen Dank für Ihre Nachricht.\n\n` +
    `Für eine genauere Einschätzung bitten wir Sie um eine weitere Aufnahme:\n\n` +
    `${core}\n\n` +
    `Bitte fotografieren Sie die betroffene Region möglichst nah und bei guter Beleuchtung.\n\n` +
    `Bei Rückfragen erreichen Sie uns unter ${tel}.\n\n` +
    `Vielen Dank.\n` +
    `Ihr Praxisteam`
  );
}

/** Kurzvorschlag für Praxisaufgabe aus dem Fallkontext. */
export function buildTaskSuggestionFromCase(params: {
  patientName: string;
  patientNotes: string | null;
  primaryAction: string;
}): { title: string; description: string } {
  const name = params.patientName.trim() || "Patient";
  const notes = params.patientNotes?.trim() ?? "";
  const pain = /schmerz|weh/i.test(notes);
  const photo = /foto|bild/i.test(params.primaryAction);
  const title = photo
    ? `Fotos nachfordern — ${name}`
    : pain
      ? `Rückmeldung Schmerz — ${name}`
      : `Fall nachverfolgen — ${name}`;
  const description =
    notes.length > 0
      ? notes.length > 280
        ? `${notes.slice(0, 280).trimEnd()}…`
        : notes
      : `Interne Aufgabe zum Fall von ${name}. Nächster Schritt: ${params.primaryAction}.`;
  return { title, description };
}

export function buildAssistQuickDraft(
  actionId: AssistQuickActionId,
  params: {
    patientName: string;
    urgency: UrgencyKey;
    practicePhone: string;
    appointmentUrl: string | null;
  }
): string {
  const name = params.patientName.trim() || "Patient";
  const tel = params.practicePhone.trim() || "[Praxisnummer]";
  const link = params.appointmentUrl?.trim();
  const linkLine = link
    ? link
    : "[Online-Terminlink der Praxis einfügen]";

  switch (actionId) {
    case "invite_today":
      return (
        `Sehr geehrte/r ${name},\n\n` +
        `wir möchten Sie noch heute kurz in die Praxis einladen, um Ihr Anliegen sicher einzuordnen.\n\n` +
        `Bitte rufen Sie uns unter ${tel} an, damit wir einen passenden Zeitslot abstimmen können.\n\n` +
        `Alternativ können Sie hier einen Termin wählen:\n${linkLine}\n\n` +
        `Mit freundlichen Grüßen\n` +
        `Ihr Praxisteam`
      );
    case "pain_followup":
      return buildRuckfrageDraftForSnippet("pain", params);
    case "appointment_link_text":
      return (
        `Sehr geehrte/r ${name},\n\n` +
        `vielen Dank für Ihre Einsendung. Hier finden Sie den Link zur Online-Terminbuchung unserer Praxis:\n\n` +
        `${linkLine}\n\n` +
        `Bei Rückfragen erreichen Sie uns unter ${tel}.\n\n` +
        `Mit freundlichen Grüßen\n` +
        `Ihr Praxisteam`
      );
    case "polish_placeholder":
      return (
        `[Ihren bisherigen Entwurf hier einfügen]\n\n` +
        `---\n` +
        `Hinweis: Formulieren Sie die Nachricht klar, höflich und ohne Diagnose gegenüber dem Patienten. ` +
        `Abschluss mit Praxisteam und Kontaktmöglichkeit nicht vergessen.`
      );
    default:
      return buildFollowUpDraft({
        patientName: name,
        urgency: params.urgency,
        practicePhone: tel,
        appointmentUrl: params.appointmentUrl,
      });
  }
}
