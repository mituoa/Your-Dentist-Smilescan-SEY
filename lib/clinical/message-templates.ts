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
    text: "Treten derzeit Schmerzen auf? Wenn ja: wie stark auf einer Skala von 0 (keine Schmerzen) bis 10 (stärkste vorstellbare Belastung), und seit ungefähr wann?",
  },
  {
    id: "since",
    label: "Seit wann?",
    text: "Seit wann bestehen Ihre Beschwerden ungefähr, und wie haben sie sich in den letzten Tagen entwickelt (besser, gleich, schlechter)?",
  },
  {
    id: "swelling",
    label: "Schwellung/Fieber",
    text: "Treten Schwellungen, Fieber oder eine deutliche Einschränkung beim Öffnen des Mundes auf? Bitte kurz beschreiben.",
  },
  {
    id: "photo",
    label: "Weiteres Bild",
    text: "Zur besseren Einordnung wäre uns eine zusätzliche, gut ausgeleuchtete Nahaufnahme des betroffenen Bereichs hilfreich. Könnten Sie uns diese bitte beifügen?",
  },
  {
    id: "meds",
    label: "Medikamente",
    text: "Nehmen Sie derzeit regelmäßig Medikamente ein (einschließlich rezeptfreier Präparate und ggf. blutverdünnender Mittel)? Eine grobe Auflistung genügt.",
  },
];

const timingLine = (urgency: UrgencyKey): string => {
  if (urgency === "today") {
    return "Wir möchten Ihr Anliegen zeitnah mit Ihnen klären.";
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
