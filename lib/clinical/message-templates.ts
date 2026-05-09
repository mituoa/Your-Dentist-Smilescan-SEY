/**
 * Calm, professional German copy for patient-facing drafts.
 * Nothing is sent automatically — always physician review.
 */

export type UrgencyKey = "today" | "this_week" | "not_urgent" | null;

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
    label: "Schmerzen?",
    text: "Treten aktuell Schmerzen auf? Wenn ja, wie stark (0–10) und seit wann ungefähr?",
  },
  {
    id: "since",
    label: "Seit wann?",
    text: "Seit wann bestehen die Beschwerden, und gab es eine Veränderung in den letzten Tagen?",
  },
  {
    id: "swelling",
    label: "Schwellung / Fieber",
    text: "Bestehen Schwellung, Fieber oder Einschränkungen beim Öffnen des Mundes?",
  },
  {
    id: "photo",
    label: "Weiteres Bild",
    text: "Könnten Sie uns bitte zusätzlich eine aktuelle Nahaufnahme des betroffenen Bereichs zusenden?",
  },
  {
    id: "meds",
    label: "Medikamente",
    text: "Nehmen Sie derzeit regelmäßig Medikamente ein (inkl. Blutverdünner)? Bitte nur grob angeben.",
  },
];
